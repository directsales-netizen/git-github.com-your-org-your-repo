import { getAllAdminUsers } from '@/lib/admin/users';
import PageHeader from '@/components/admin/PageHeader';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  const users = await getAllAdminUsers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users & Roles"
        description="Only the configured admin account (via ADMIN_EMAIL) can actually sign in today — this list is illustrative role management, not a live multi-account auth system."
      />
      <UsersClient initialUsers={users} />
    </div>
  );
}
