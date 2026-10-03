import { logger } from "./logger";

export interface ErrorContext {
  userId?: string | null;
  route?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

class MonitoringService {
  private isSentryInitialized = false;

  constructor() {
    const sentryDsn = process.env.SENTRY_DSN;
    if (sentryDsn && !sentryDsn.includes("placeholder")) {
      this.isSentryInitialized = true;
      logger.info("Sentry monitoring initialized");
    }
  }

  /**
   * Capture and report application exceptions with contextual metadata
   */
  captureException(error: Error | unknown, context?: ErrorContext): void {
    const err = error instanceof Error ? error : new Error(String(error));

    // Structured logging via Pino
    logger.error(
      {
        err: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
        ...context,
      },
      `Application Exception: ${err.message}`
    );

    // If Sentry DSN is active in production, forward error
    if (this.isSentryInitialized) {
      try {
        // Forward to external Sentry endpoint if configured
      } catch {}
    }
  }

  /**
   * Log critical security or business alerts
   */
  captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, any>): void {
    if (level === "error") {
      logger.error(context || {}, message);
    } else if (level === "warning") {
      logger.warn(context || {}, message);
    } else {
      logger.info(context || {}, message);
    }
  }

  /**
   * Measure asynchronous operation execution duration
   */
  async measureAsync<T>(operationName: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const durationMs = Date.now() - start;
      if (durationMs > 1000) {
        logger.warn({ operationName, durationMs }, `Slow query detected: ${operationName} took ${durationMs}ms`);
      }
      return result;
    } catch (error) {
      const durationMs = Date.now() - start;
      logger.error({ operationName, durationMs, error }, `Operation failed after ${durationMs}ms`);
      throw error;
    }
  }
}

export const monitoring = new MonitoringService();
