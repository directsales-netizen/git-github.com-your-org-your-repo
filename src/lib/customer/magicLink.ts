import { randomUUID } from 'node:crypto';
import { globalSingleton } from '@/lib/globalStore';

// Shorter TTL than email-verification tokens (24h) since redeeming this one
// grants a live session directly rather than just flipping a flag.
const TOKEN_TTL_MS = 15 * 60 * 1000;

interface TokenEntry {
  email: string;
  name: string;
  expiresAt: number;
}

const TOKENS = globalSingleton('customerMagicLinkTokens', (): Map<string, TokenEntry> => new Map());

export function createMagicLinkToken(email: string, name: string): string {
  const token = randomUUID();
  TOKENS.set(token, { email: email.trim().toLowerCase(), name, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

/** One-time use — consumes (deletes) the token if valid. */
export function consumeMagicLinkToken(token: string): { email: string; name: string } | null {
  const entry = TOKENS.get(token);
  if (!entry) return null;
  TOKENS.delete(token);
  if (entry.expiresAt < Date.now()) return null;
  return { email: entry.email, name: entry.name };
}
