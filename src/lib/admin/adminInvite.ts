import { randomUUID } from 'node:crypto';
import { globalSingleton } from '@/lib/globalStore';

/**
 * Same shape as src/lib/customer/emailVerification.ts, keyed by admin user
 * id instead of raw email so a token is tied to a specific invited record.
 */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

interface InviteEntry {
  userId: string;
  expiresAt: number;
}

const TOKENS = globalSingleton('adminInviteTokens', (): Map<string, InviteEntry> => new Map());

export function createInviteToken(userId: string): string {
  const token = randomUUID();
  TOKENS.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

/** One-time use — consumes (deletes) the token if valid, returns the associated admin user id. */
export function consumeInviteToken(token: string): string | null {
  const entry = TOKENS.get(token);
  if (!entry) return null;
  TOKENS.delete(token);
  if (entry.expiresAt < Date.now()) return null;
  return entry.userId;
}
