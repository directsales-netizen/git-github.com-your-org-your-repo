/**
 * In-memory, per-process rate limiter — same accepted limitation as every
 * other mock store in this app (resets on restart, not shared across
 * serverless instances). Good enough to blunt casual brute force / abuse on
 * a single long-lived process.
 */
export interface RateLimiter {
  /**
   * `overrides`, when passed, takes precedence over the maxAttempts/windowMs
   * this limiter was created with — lets a single call site (e.g. admin
   * login, reading a configurable threshold from security settings) behave
   * dynamically while every other call site, which never passes overrides,
   * keeps its original frozen-at-creation-time behavior unchanged.
   */
  isRateLimited(key: string, overrides?: { maxAttempts: number; windowMs: number }): boolean;
}

export function createRateLimiter(maxAttempts: number, windowMs: number): RateLimiter {
  const attempts = new Map<string, { count: number; windowStart: number }>();

  return {
    isRateLimited(key: string, overrides?: { maxAttempts: number; windowMs: number }): boolean {
      const effectiveMaxAttempts = overrides?.maxAttempts ?? maxAttempts;
      const effectiveWindowMs = overrides?.windowMs ?? windowMs;

      const now = Date.now();
      const entry = attempts.get(key);
      if (!entry || now - entry.windowStart > effectiveWindowMs) {
        attempts.set(key, { count: 1, windowStart: now });
        return false;
      }
      entry.count += 1;
      return entry.count > effectiveMaxAttempts;
    },
  };
}
