/**
 * In-memory registry of "keep me logged in" refresh sessions, keyed by
 * `sid`. Edge-safe (no `node:crypto`), so it's importable directly from
 * src/proxy.ts as well as Node route handlers. Same accepted limitation as
 * every other mock store in this app (src/lib/globalStore.ts): resets on
 * restart, and on Vercel serverless production a request may land on a
 * cold instance that has never seen a given sid — that case is treated as
 * "not yet known" (lazy-accept) rather than "revoked", so a legitimate
 * remember-me token isn't incorrectly rejected just because it hasn't been
 * seen by this particular instance yet.
 */

import { globalSingleton } from '@/lib/globalStore';
import type { SessionRole } from './session';

export interface SessionRecord {
  sid: string;
  email: string;
  role: SessionRole;
  createdAt: string;
  lastUsedAt: string;
  userAgent: string;
  ip: string | null;
  browser: string;
  os: string;
  revoked: boolean;
}

const REGISTRY = globalSingleton('adminSessionRegistry', () => new Map<string, SessionRecord>());
const REVOKED_BEFORE = globalSingleton('adminSessionRevokedBefore', () => new Map<string, number>());

export function recordSession(record: SessionRecord): void {
  REGISTRY.set(record.sid, record);
}

export function touchSession(
  sid: string,
  patch: { lastUsedAt: string; userAgent?: string; ip?: string | null }
): void {
  const existing = REGISTRY.get(sid);
  if (!existing) return;
  REGISTRY.set(sid, { ...existing, ...patch });
}

export function revokeSession(sid: string): void {
  const existing = REGISTRY.get(sid);
  if (!existing) return;
  REGISTRY.set(sid, { ...existing, revoked: true });
}

/** Missing-from-registry is treated as "not revoked" — see file header. */
export function isRevoked(sid: string): boolean {
  return REGISTRY.get(sid)?.revoked ?? false;
}

export function getSessionsForEmail(email: string): SessionRecord[] {
  return Array.from(REGISTRY.values())
    .filter((record) => record.email === email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSessionRecord(sid: string): SessionRecord | undefined {
  return REGISTRY.get(sid);
}

export function revokeAllForEmail(email: string): void {
  for (const record of REGISTRY.values()) {
    if (record.email === email) record.revoked = true;
  }
}

export function bumpRevokedBefore(email: string): number {
  const now = Date.now();
  REVOKED_BEFORE.set(email, now);
  return now;
}

export function getRevokedBefore(email: string): number {
  return REVOKED_BEFORE.get(email) ?? 0;
}
