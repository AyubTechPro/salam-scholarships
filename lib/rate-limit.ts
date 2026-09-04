/**
 * Rate Limiting Utility
 * Redis-based rate limiter with in-memory fallback
 */

import { getRedisClient } from './redis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Fallback in-memory store (used when Redis is unavailable)
const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

// Cleanup expired entries (fallback only)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Check if request should be rate limited (Redis-based with fallback)
 * @param identifier - IP address or user ID
 * @param maxRequests - Maximum requests allowed (overrides DB if provided)
 * @param windowMs - Time window in milliseconds (overrides DB if provided)
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests?: number,
  windowMs?: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // Get rate limit config from business rules if not provided
  if (maxRequests === undefined || windowMs === undefined) {
    const { getRateLimitConfig } = await import('./business-rules');
    const config = await getRateLimitConfig();
    maxRequests = maxRequests ?? config.maxRequests;
    windowMs = windowMs ?? config.windowMs;
  }

  const redis = getRedisClient();

  // Use Redis if available
  if (redis) {
    try {
      const key = `ratelimit:${identifier}`;
      const now = Date.now();
      const windowSeconds = Math.floor(windowMs / 1000);

      // Use Redis INCR with EXPIRE pattern
      const current = await redis.incr(key);
      
      // Set expiration on first request
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Check if limit exceeded
      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + (ttl * 1000),
        };
      }

      const ttl = await redis.ttl(key);
      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - current),
        resetTime: now + (ttl * 1000),
      };
    } catch (error) {
      console.error('Redis rate limit error, falling back to memory:', error);
      // Fall through to in-memory fallback
    }
  }

  // Fallback: In-memory rate limiting
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback (won't work in serverless, but good for development)
  return 'unknown';
}

