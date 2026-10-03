import Redis from "ioredis";
import { logger } from "./logger";

class CacheManager {
  private redis: Redis | null = null;
  private memoryStore = new Map<string, { value: string; expiresAt: number }>();
  private isRedisConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl && !redisUrl.includes("placeholder")) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          retryStrategy(times) {
            // Reconnect backoff up to 2 seconds, but don't hang server
            return Math.min(times * 100, 2000);
          },
          lazyConnect: true,
        });

        this.redis.on("connect", () => {
          this.isRedisConnected = true;
          logger.info("Connected to Redis cache engine");
        });

        this.redis.on("error", (err) => {
          this.isRedisConnected = false;
          // Log only once in quiet mode to avoid spamming console
          logger.debug({ err: err.message }, "Redis unavailable, falling back to memory cache");
        });

        // Attempt initial non-blocking connection
        this.redis.connect().catch(() => {
          this.isRedisConnected = false;
        });
      } catch (e) {
        this.isRedisConnected = false;
      }
    }
  }

  /**
   * Retrieve cached value by key
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      if (this.isRedisConnected && this.redis) {
        const data = await this.redis.get(key);
        if (data) return JSON.parse(data) as T;
      }
    } catch {
      // Fall through to memory store
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    try {
      return JSON.parse(item.value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Store value in cache with TTL (Time To Live in seconds)
   */
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);

    try {
      if (this.isRedisConnected && this.redis) {
        await this.redis.set(key, serialized, "EX", ttlSeconds);
        return;
      }
    } catch {
      // Fall through to memory store
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryStore.set(key, { value: serialized, expiresAt });
  }

  /**
   * Delete specific cache key
   */
  async del(key: string): Promise<void> {
    try {
      if (this.isRedisConnected && this.redis) {
        await this.redis.del(key);
      }
    } catch {}
    this.memoryStore.delete(key);
  }

  /**
   * Invalidate all keys matching a wildcard pattern (e.g. "products:*")
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (this.isRedisConnected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch {}

    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    for (const key of this.memoryStore.keys()) {
      if (regex.test(key)) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Diagnostic check of cache connectivity and statistics
   */
  async status(): Promise<{
    engine: "redis" | "memory";
    connected: boolean;
    cachedKeysCount: number;
  }> {
    if (this.isRedisConnected && this.redis) {
      try {
        const dbsize = await this.redis.dbsize();
        return {
          engine: "redis",
          connected: true,
          cachedKeysCount: dbsize,
        };
      } catch {}
    }

    return {
      engine: "memory",
      connected: true,
      cachedKeysCount: this.memoryStore.size,
    };
  }
}

export const cache = new CacheManager();
