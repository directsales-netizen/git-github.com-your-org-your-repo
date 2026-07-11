/**
 * Shared Upstash Redis client for anything that needs storage durable
 * across Vercel serverless instances — unlike src/lib/globalStore.ts's
 * globalSingleton (in-memory, per-instance, can vanish between two
 * consecutive requests in production). Node-only.
 */
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

/**
 * True once either the Vercel KV integration's or a direct Upstash
 * integration's env vars are present. Callers that can tolerate degrading
 * to in-memory storage until this is configured should check this first —
 * see src/lib/admin/requests.ts and src/lib/checkout/inquiries.ts for the
 * pattern, which mirrors this codebase's existing "disabled until
 * configured" convention (src/lib/email/resend.ts, src/lib/sms/vonage.ts).
 */
export function isRedisConfigured(): boolean {
  return Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}
