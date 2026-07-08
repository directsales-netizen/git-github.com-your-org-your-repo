import { randomUUID } from 'node:crypto';
import { globalSingleton } from '@/lib/globalStore';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

interface TokenEntry {
  email: string;
  expiresAt: number;
}

const TOKENS = globalSingleton('customerVerificationTokens', (): Map<string, TokenEntry> => new Map());

export function createVerificationToken(email: string): string {
  const token = randomUUID();
  TOKENS.set(token, { email: email.trim().toLowerCase(), expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

/** One-time use — consumes (deletes) the token if valid, returns the associated email. */
export function consumeVerificationToken(token: string): string | null {
  const entry = TOKENS.get(token);
  if (!entry) return null;
  TOKENS.delete(token);
  if (entry.expiresAt < Date.now()) return null;
  return entry.email;
}
