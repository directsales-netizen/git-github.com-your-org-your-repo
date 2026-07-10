import { globalSingleton } from '@/lib/globalStore';

/**
 * Rolling-window attempt counter — same in-memory, per-process convention
 * (and same accepted serverless-durability limitation) as
 * src/lib/security/rateLimit.ts. Recorded once per checkout *attempt* (in
 * prepareCheckout.ts, before payment), not just successful ones, so velocity
 * reflects abandoned/retried attempts too.
 */
const ATTEMPTS = globalSingleton('fraudCheckoutAttempts', (): Map<string, number[]> => new Map());

export function recordAttempt(key: string): void {
  const timestamps = ATTEMPTS.get(key) ?? [];
  timestamps.push(Date.now());
  ATTEMPTS.set(key, timestamps);
}

export function countRecentAttempts(key: string, windowMs: number): number {
  const timestamps = ATTEMPTS.get(key) ?? [];
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((t) => t > cutoff).length;
}
