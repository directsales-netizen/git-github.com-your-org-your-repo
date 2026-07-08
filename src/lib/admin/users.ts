import type { AdminRole, AdminUser } from '@/types/admin';
import { globalBox, globalSingleton } from '@/lib/globalStore';

// Illustrative admin-user list — only the ADMIN_EMAIL/ADMIN_PASSWORD_HASH
// env-var account can actually authenticate today (see src/lib/admin/auth.ts).
// This module lets the Users & Roles UI demonstrate real CRUD without
// implying a multi-account auth system that doesn't exist yet.
const USERS = globalSingleton('adminUsers', (): AdminUser[] => [
  { id: 'usr-1', name: 'Store Admin', email: 'admin@premiumtechnoir.org', role: 'admin', status: 'active', lastActive: new Date().toISOString() },
  { id: 'usr-2', name: 'Casey Nguyen', email: 'casey@premiumtechnoir.org', role: 'editor', status: 'active', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'usr-3', name: 'Riley Brooks', email: 'riley@premiumtechnoir.org', role: 'viewer', status: 'invited' },
]);

const nextUserIdBox = globalBox('nextAdminUserId', () => 100);

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  return USERS;
}

export async function createAdminUser(input: { name: string; email: string; role: AdminRole }): Promise<AdminUser> {
  const user: AdminUser = { id: `usr-${nextUserIdBox.current++}`, status: 'invited', ...input };
  USERS.push(user);
  return user;
}

export async function updateAdminUser(id: string, patch: Partial<Pick<AdminUser, 'name' | 'role' | 'status'>>): Promise<AdminUser | null> {
  const user = USERS.find((u) => u.id === id);
  if (!user) return null;
  Object.assign(user, patch);
  return user;
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const index = USERS.findIndex((u) => u.id === id);
  if (index === -1) return false;
  USERS.splice(index, 1);
  return true;
}
