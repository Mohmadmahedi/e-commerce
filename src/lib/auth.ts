import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { authService } from "@/server/services/auth.service";
import { logger } from "@/server/utils/logger";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "CUSTOMER" | "STAFF" | "ADMIN";
      phone?: string | null;
      twoFactorEnabled: boolean;
      sessionToken?: string;
    };
  }

  interface User {
    id: string;
    role: string;
    phone?: string | null;
    twoFactorEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "STAFF" | "ADMIN";
    phone?: string | null;
    twoFactorEnabled?: boolean;
    sessionToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    // 1. Google OAuth Provider (configured via environment variables)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_google_secret",
      allowDangerousEmailAccountLinking: true,
    }),

    // 2. Credentials Provider (Email + Password + Lockout + TOTP 2FA)
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const ip =
          req?.headers?.["x-forwarded-for"]?.toString() ||
          req?.headers?.["x-real-ip"]?.toString() ||
          "127.0.0.1";
        const userAgent = req?.headers?.["user-agent"]?.toString() || "Unknown";

        try {
          const user = await authService.verifyCredentials(
            {
              email: credentials.email,
              password: credentials.password,
              totpCode: credentials.totpCode,
            },
            ip,
            userAgent
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            phone: user.phone,
            twoFactorEnabled: user.twoFactorEnabled,
          };
        } catch (err: any) {
          logger.warn({ email: credentials.email, error: err.message }, "Auth credentials rejection");
          throw new Error(err.message || "Invalid email or password");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as any) || "CUSTOMER";
        token.phone = user.phone;
        token.twoFactorEnabled = user.twoFactorEnabled;

        // Generate a tracked database session token for immediate revocation support
        const sessionToken = crypto.randomUUID();
        token.sessionToken = sessionToken;

        // Persist session to database so it can be revoked via logout-all or password change
        try {
          await prisma.session.create({
            data: {
              sessionToken,
              userId: user.id,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } catch (err) {
          logger.error({ err, userId: user.id }, "Failed to write database session record");
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && token.sessionToken) {
        // DATABASE SESSION REVOCATION CHECK:
        // Query the database to verify this session hasn't been revoked
        const dbSession = await prisma.session.findUnique({
          where: { sessionToken: token.sessionToken },
          include: { user: true },
        });

        // If session was revoked via password change or logout-from-all-devices:
        if (!dbSession || (dbSession.expires && dbSession.expires < new Date())) {
          return null as any; // Invalidates session
        }

        // Attach fresh user data from DB
        session.user = {
          id: dbSession.user.id,
          name: dbSession.user.name,
          email: dbSession.user.email,
          image: dbSession.user.image,
          role: dbSession.user.role as "CUSTOMER" | "STAFF" | "ADMIN",
          phone: dbSession.user.phone,
          twoFactorEnabled: dbSession.user.twoFactorEnabled,
          sessionToken: token.sessionToken,
        };
      }

      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
