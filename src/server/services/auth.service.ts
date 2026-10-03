import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterInput, ChangePasswordInput } from "../validators/auth.validator";
import { AuthError, ConflictError, NotFoundError, AppError } from "../utils/errors";
import { auditRepository } from "../repositories/audit.repository";
import { TotpUtil } from "../utils/totp";

export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;

  /**
   * Register a new user with hashed password and initial audit log
   */
  async registerUser(input: RegisterInput, ip?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError("An account with this email address already exists");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Record registration audit event
    await auditRepository.createLog({
      userId: user.id,
      action: "USER_REGISTRATION",
      entity: "User",
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: ip,
      userAgent,
    });

    return user;
  }

  /**
   * Verify login credentials, progressive lockout & TOTP 2FA
   */
  async verifyCredentials(
    credentials: { email?: string; password?: string; totpCode?: string },
    ip?: string,
    userAgent?: string
  ) {
    if (!credentials.email || !credentials.password) {
      throw new AuthError("Email and password are required");
    }

    const email = credentials.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new AuthError("Invalid email or password");
    }

    // 1. Account Lockout Check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );
      throw new AppError(
        `Account is temporarily locked due to consecutive failed attempts. Try again in ${remainingMinutes} minute(s).`,
        423,
        "ACCOUNT_LOCKED"
      );
    }

    // 2. Verify Password Hash
    const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

    if (!passwordMatch) {
      const newAttempts = user.failedLoginAttempts + 1;
      const willLock = newAttempts >= this.MAX_FAILED_ATTEMPTS;
      const lockedUntil = willLock
        ? new Date(Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000)
        : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil,
        },
      });

      await auditRepository.createLog({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        details: { attempts: newAttempts, isLocked: willLock },
        ipAddress: ip,
        userAgent,
      });

      if (willLock) {
        throw new AppError(
          `Too many failed attempts. Account has been locked for ${this.LOCKOUT_DURATION_MINUTES} minutes.`,
          423,
          "ACCOUNT_LOCKED"
        );
      }

      throw new AuthError("Invalid email or password");
    }

    // 3. Reset lockout on successful password verification
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // 4. Admin / 2FA TOTP Verification (if enabled)
    if (user.twoFactorEnabled) {
      if (!credentials.totpCode) {
        throw new AppError("Two-factor authentication code is required", 401, "TWO_FACTOR_REQUIRED");
      }

      if (!user.twoFactorSecret || !TotpUtil.verify(user.twoFactorSecret, credentials.totpCode)) {
        await auditRepository.createLog({
          userId: user.id,
          action: "2FA_VERIFICATION_FAILED",
          entity: "User",
          entityId: user.id,
          ipAddress: ip,
          userAgent,
        });
        throw new AuthError("Invalid two-factor authentication code");
      }
    }

    // 5. Successful Login Audit Log
    await auditRepository.createLog({
      userId: user.id,
      action: "USER_LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }

  /**
   * Change password and invalidate all sessions across devices
   */
  async changePassword(userId: string, input: ChangePasswordInput, ip?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundError("User not found");
    }

    const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw new AuthError("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(input.newPassword, 10);

    // Atomic update password and revoke all sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      }),
      // Invalidate all active sessions to force re-login on all devices
      prisma.session.deleteMany({
        where: { userId },
      }),
    ]);

    await auditRepository.createLog({
      userId,
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: userId,
      details: { note: "All active sessions revoked" },
      ipAddress: ip,
      userAgent,
    });

    return { success: true };
  }

  /**
   * Revoke all sessions for a user (Logout from all devices)
   */
  async logoutAllDevices(userId: string, ip?: string, userAgent?: string) {
    const deleted = await prisma.session.deleteMany({
      where: { userId },
    });

    await auditRepository.createLog({
      userId,
      action: "LOGOUT_ALL_DEVICES",
      entity: "User",
      entityId: userId,
      details: { sessionsRevoked: deleted.count },
      ipAddress: ip,
      userAgent,
    });

    return { count: deleted.count };
  }
}

export const authService = new AuthService();
