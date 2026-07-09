/**
 * Node-only admin credential verification. Never import this from
 * src/proxy.ts or src/lib/admin/session.ts — the Edge runtime doesn't have
 * `node:crypto`. This module is only used by the login route handler, which
 * runs on the Node runtime by default. Password hashing itself lives in
 * src/lib/security/password.ts, shared with customer auth.
 */

import { verifyPasswordHash } from '@/lib/security/password';
import { getAdminUserByEmail } from '@/lib/admin/users';
import type { SessionRole } from '@/lib/admin/session';

/**
 * This app has exactly one real login (ADMIN_EMAIL/ADMIN_PASSWORD_HASH) — there
 * is no multi-account auth system, so role can't be looked up from a user
 * record. ADMIN_ROLE lets an operator downgrade that single account away from
 * SuperAdmin (e.g. to keep visitor analytics off by default); unset defaults
 * to SuperAdmin since it's the only account that can sign in at all.
 */
export function getConfiguredAdminRole(): 'SuperAdmin' | 'admin' | 'editor' | 'viewer' {
  const role = process.env.ADMIN_ROLE;
  if (role === 'admin' || role === 'editor' || role === 'viewer') return role;
  return 'SuperAdmin';
}

export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !passwordHash) {
    console.warn('[admin/auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set — admin login is disabled until configured.');
    return false;
  }

  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;

  return verifyPasswordHash(password, passwordHash);
}

/**
 * Resolves a login attempt against either the single env-var "break-glass"
 * account (verifyCredentials — unchanged, always SuperAdmin-configured role)
 * or a real invited account activated via src/lib/admin/users.ts. Checked in
 * that order so the bootstrap account always works even if it collides with
 * an invited email.
 */
export async function resolveAdminLogin(email: string, password: string): Promise<{ email: string; role: SessionRole } | null> {
  if (verifyCredentials(email, password)) {
    return { email, role: getConfiguredAdminRole() };
  }

  const user = await getAdminUserByEmail(email);
  if (!user || user.status !== 'active' || !user.passwordHash) return null;
  if (!verifyPasswordHash(password, user.passwordHash)) return null;

  return { email: user.email, role: user.role };
}
