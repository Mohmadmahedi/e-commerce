import { z } from "zod";

/**
 * Zod schema to validate all server and client environment variables at runtime/startup.
 * Throws a descriptive error and halts execution if any required variable is missing or invalid.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 characters"),
  
  // Public client-safe variables
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
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
    console.error("❌ CRITICAL: Invalid environment variables detected:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error("Invalid environment configuration. Check your .env file against .env.example.");
  }

  return result.data;
};

export const env = parseEnv();
