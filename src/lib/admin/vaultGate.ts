/**
 * In-memory "is the credentials vault currently unlocked for this session"
 * state — same shape as src/lib/admin/otp.ts's PENDING/VERIFIED maps, just
 * without a code to check (the passkey ceremony itself is the check; this
 * only remembers that it already succeeded recently). Losing this on
 * restart just means re-prompting for the passkey, not a lockout, so unlike
 * the credential itself (src/lib/admin/webauthnStore.ts, Redis-backed) this
 * never needs to be durable.
 */

import { globalSingleton } from '@/lib/globalStore';
import type { SessionPayload } from './session';

const UNLOCK_WINDOW_MS = 10 * 60 * 1000;

interface VaultUnlockEntry {
  unlockedUntil: number;
}

const UNLOCKED = globalSingleton('adminVaultUnlocked', () => new Map<string, VaultUnlockEntry>());

/** sub+iat uniquely identifies one signed-in session — a fresh login always requires a fresh unlock. */
function sessionKey(session: SessionPayload): string {
  return `${session.sub}:${session.iat}`;
}

export function isVaultUnlocked(session: SessionPayload): boolean {
  const entry = UNLOCKED.get(sessionKey(session));
  return Boolean(entry && Date.now() < entry.unlockedUntil);
}

export function markVaultUnlocked(session: SessionPayload): void {
  const unlockedUntil = Math.min(Date.now() + UNLOCK_WINDOW_MS, session.exp * 1000);
  UNLOCKED.set(sessionKey(session), { unlockedUntil });
}
