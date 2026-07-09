import type { AdminRole, AdminUser } from '@/types/admin';
import { globalBox, globalSingleton } from '@/lib/globalStore';
import { createInviteToken } from '@/lib/admin/adminInvite';
import { sendAdminInviteEmail } from '@/lib/email/resend';

/**
 * Real (if in-memory) admin accounts. The single ADMIN_EMAIL/ADMIN_PASSWORD_HASH
 * env-var account (src/lib/admin/auth.ts) remains a separate, permanent
 * "break-glass" SuperAdmin — it's what lets you invite anyone here in the
 * first place. `passwordHash` is intentionally never part of the exported
 * `AdminUser` type and is stripped before anything leaves this module.
 */
type StoredAdminUser = AdminUser & { passwordHash?: string };

const USERS = globalSingleton('adminUsers', (): StoredAdminUser[] => [
  { id: 'usr-1', name: 'Store Admin', email: 'admin@premiumtechnoir.org', role: 'admin', status: 'active', lastActive: new Date().toISOString() },
  { id: 'usr-2', name: 'Casey Nguyen', email: 'casey@premiumtechnoir.org', role: 'editor', status: 'active', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'usr-3', name: 'Riley Brooks', email: 'riley@premiumtechnoir.org', role: 'viewer', status: 'invited' },
]);

const nextUserIdBox = globalBox('nextAdminUserId', () => 100);

function stripPassword(user: StoredAdminUser): AdminUser {
  const { id, name, email, role, status, lastActive } = user;
  return { id, name, email, role, status, lastActive };
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  return USERS.map(stripPassword);
}

export async function getAdminUserByEmail(email: string): Promise<StoredAdminUser | null> {
  const normalized = email.trim().toLowerCase();
  return USERS.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

/** Fire-and-forget: never awaited by the caller, same reasoning as every other notification send in this app (sendEmail never throws). */
async function sendInvite(user: AdminUser, origin: string): Promise<void> {
  const token = createInviteToken(user.id);
  await sendAdminInviteEmail(user.email, token, origin);
}

export async function createAdminUser(input: { name: string; email: string; role: AdminRole }, origin: string): Promise<AdminUser> {
  const user: StoredAdminUser = { id: `usr-${nextUserIdBox.current++}`, status: 'invited', ...input };
  USERS.push(user);
  void sendInvite(user, origin);
  return stripPassword(user);
}

export async function updateAdminUser(id: string, patch: Partial<Pick<AdminUser, 'name' | 'role' | 'status'>>): Promise<AdminUser | null> {
  const user = USERS.find((u) => u.id === id);
  if (!user) return null;
  Object.assign(user, patch);
  return stripPassword(user);
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const index = USERS.findIndex((u) => u.id === id);
  if (index === -1) return false;
  USERS.splice(index, 1);
  return true;
}

/** Consumes an invite token: sets the account's password and activates it. Returns null if the user record vanished (shouldn't happen — tokens are keyed by id). */
export async function activateAdminUser(id: string, passwordHash: string): Promise<AdminUser | null> {
  const user = USERS.find((u) => u.id === id);
  if (!user) return null;
  user.passwordHash = passwordHash;
  user.status = 'active';
  user.lastActive = new Date().toISOString();
  return stripPassword(user);
}
