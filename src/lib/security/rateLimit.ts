/**
 * In-memory, per-process rate limiter — same accepted limitation as every
 * other mock store in this app (resets on restart, not shared across
 * serverless instances). Good enough to blunt casual brute force / abuse on
 * a single long-lived process.
 */
export interface RateLimiter {
  isRateLimited(key: string): boolean;
}

export function createRateLimiter(maxAttempts: number, windowMs: number): RateLimiter {
  const attempts = new Map<string, { count: number; windowStart: number }>();

  return {
    isRateLimited(key: string): boolean {
      const now = Date.now();
      const entry = attempts.get(key);
      if (!entry || now - entry.windowStart > windowMs) {
        attempts.set(key, { count: 1, windowStart: now });
        return false;
      }
      entry.count += 1;
      return entry.count > maxAttempts;
    },
  };
}
