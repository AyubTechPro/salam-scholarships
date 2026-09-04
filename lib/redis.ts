/**
 * Redis Client for Global Performance & Scalability
 * Handles rate limiting, caching, and session storage
 */

import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

/**
 * Get Redis client instance (singleton pattern)
 * Falls back to in-memory mode if Redis is not configured
 */
export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    // Redis not configured - return null (will use fallback)
    return null;
  }

  if (globalForRedis.redis) {
    return globalForRedis.redis;
  }

  try {
    const redis = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: false,
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        })
      : new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: false,
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      // Redis Client Connected
    });

    // Store in global for serverless environments (Next.js)
    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = redis;
    }

    return redis;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

/**
 * Close Redis connection (cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    await redis.quit();
    globalForRedis.redis = undefined;
  }
}

