import { logger } from "./logger";

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export const RATE_LIMIT_PRESETS: Record<string, RateLimitRule> = {
  AUTH_LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  AUTH_REGISTER: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 registers per hour
  CHECKOUT: { limit: 10, windowMs: 10 * 60 * 1000 }, // 10 orders per 10 minutes
  COUPON_APPLY: { limit: 15, windowMs: 5 * 60 * 1000 }, // 15 coupon tries per 5 mins
  SEARCH: { limit: 60, windowMs: 60 * 1000 }, // 60 queries per minute
  UPLOADS: { limit: 20, windowMs: 15 * 60 * 1000 }, // 20 uploads per 15 mins
  GENERAL_API: { limit: 120, windowMs: 60 * 1000 }, // 120 requests per minute
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
  retryAfterSeconds?: number;
}

class MemoryRateLimiter {
  private store = new Map<string, number[]>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection every 5 minutes to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check and consume rate limit quota using a sliding window algorithm
   */
  async consume(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - rule.windowMs;

    let timestamps = this.store.get(key) || [];

    // Filter out timestamps outside the sliding window
    timestamps = timestamps.filter((t) => t > windowStart);

    const count = timestamps.length;
    const allowed = count < rule.limit;

    if (allowed) {
      timestamps.push(now);
      this.store.set(key, timestamps);
    }

    const remaining = Math.max(0, rule.limit - timestamps.length);
    const oldestTimestamp = timestamps[0] || now;
    const resetTimeMs = oldestTimestamp + rule.windowMs;
    const resetTimeSec = Math.ceil(resetTimeMs / 1000);
    const retryAfterSeconds = allowed ? undefined : Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    if (!allowed) {
      logger.warn(
        { key, limit: rule.limit, windowMs: rule.windowMs, retryAfterSeconds },
        "Rate limit exceeded"
      );
    }

    return {
      allowed,
      limit: rule.limit,
      remaining,
      resetTime: resetTimeSec,
      retryAfterSeconds,
    };
  }

  /**
   * Reset limits for a specific key (e.g. after successful login)
   */
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.store.entries()) {
      // Find the max potential window (1 hour)
      const valid = timestamps.filter((t) => t > now - 60 * 60 * 1000);
      if (valid.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, valid);
      }
    }
  }
}

export const rateLimiter = new MemoryRateLimiter();
