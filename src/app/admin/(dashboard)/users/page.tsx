import { ShieldAlert } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import { getAllAdminUsers } from '@/lib/admin/users';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  // src/proxy.ts + the dashboard layout already guarantee a valid admin
  // session; managing accounts/roles is SuperAdmin-only specifically.
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Users & Roles" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="Managing admin accounts and roles is restricted to SuperAdmin accounts. Contact a SuperAdmin if you need a role change."
        />
      </div>
    );
  }

  const users = await getAllAdminUsers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users & Roles"
        description="Invited accounts set their own password via an emailed invite link, then sign in with access scoped to their role."
      />
      <UsersClient initialUsers={users} />
    </div>
  );
}
