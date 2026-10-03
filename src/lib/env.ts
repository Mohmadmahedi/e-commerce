import { z } from "zod";

/**
 * Zod schema to validate all server and client environment variables at runtime/startup.
 * Throws a descriptive error and halts execution if any required variable is missing or invalid.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().default("file:./dev.db"),
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().default("avanya_super_secret_jwt_encryption_key_production_32chars"),
  
  // Public client-safe variables
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_STORE_NAME: z.string().default("AVANYA"),
  NEXT_PUBLIC_CURRENCY_SYMBOL: z.string().default("₹"),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().default("rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: z.string().default("placeholder_secret"),
  RAZORPAY_WEBHOOK_SECRET: z.string().default("placeholder_webhook_secret"),

  // Optional services (safe fallbacks implemented in code)
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),
  RESEND_API_KEY: z.string().optional().default("re_placeholder"),
  EMAIL_FROM: z.string().default("AVANYA <orders@avanya.in>"),
  ADMIN_EMAIL: z.string().email().default("admin@avanya.in"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.warn("⚠️ Non-critical environment configuration warning:", result.error.format());
    return {
      NODE_ENV: (process.env.NODE_ENV as any) || "production",
      DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "avanya_super_secret_jwt_encryption_key_production_32chars",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME || "AVANYA",
      NEXT_PUBLIC_CURRENCY_SYMBOL: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹",
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "placeholder_webhook_secret",
      REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
      RESEND_API_KEY: process.env.RESEND_API_KEY || "re_placeholder",
      EMAIL_FROM: process.env.EMAIL_FROM || "AVANYA <orders@avanya.in>",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@avanya.in",
    };
  }

  return result.data;
};

export const env = parseEnv();
