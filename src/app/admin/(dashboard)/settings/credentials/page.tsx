import { ShieldAlert } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import CredentialsClient from './CredentialsClient';

export default async function AdminCredentialsVaultPage() {
  // Same SuperAdmin bar as Business Settings and Security — this is where
  // the page-level role check lives. The passkey gate is separate and sits
  // in front of the actual data (see /api/admin/vault/credentials-status),
  // not this shell, so viewing this page never leaks integration status
  // without the vault also being unlocked.
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Credentials Vault" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="The credentials vault is restricted to SuperAdmin accounts. Contact a SuperAdmin if you need a change."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Credentials Vault"
        description="Read-only status of configured third-party integrations. Unlocking requires a passkey on top of your login."
      />
      <CredentialsClient />
    </div>
  );
}
