import pino from "pino";

/**
 * Enterprise structured logger using Pino.
 * Configured with automatic redaction of sensitive credentials, tokens, and PII
 * to guarantee that security secrets are never leaked into server logs.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: {
    paths: [
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "refreshToken",
      "secret",
      "authorization",
      "cookie",
      "creditCard",
      "cardNumber",
      "cvv",
      "razorpay_signature",
      "twoFactorSecret",
    ],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export default logger;
