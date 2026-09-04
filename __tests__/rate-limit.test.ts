import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

// Mock the redis module so it returns null (forces fallback to memory)
vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn(() => null),
  isRedisAvailable: vi.fn(() => false),
}));

// Mock the business rules dynamically imported inside checkRateLimit
vi.mock('@/lib/business-rules', () => ({
  getRateLimitConfig: vi.fn(() => ({ maxRequests: 5, windowMs: 60000 })),
}));

describe('Rate Limiter (In-Memory Fallback)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows requests within limit', async () => {
    const result = await checkRateLimit('test-ip-1', 5, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks requests exceeding the limit', async () => {
    const ip = 'test-ip-2';
    // Exhaust limit (5)
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(ip, 5, 1000);
    }
    // 6th request should be blocked
    const blockedResult = await checkRateLimit(ip, 5, 1000);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.remaining).toBe(0);
  });
});
