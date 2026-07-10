import { headers } from 'next/headers';
import { ShieldAlert } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import { getSecuritySettings } from '@/lib/admin/securitySettings';
import { getRequestIp } from '@/lib/admin/visitorIntel';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import SecurityClient from './SecurityClient';

export default async function AdminSecurityPage() {
  // Same SuperAdmin bar as Business Settings — security policy is
  // shared-system-critical, not something any admin/editor should tune.
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Security Settings" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="Security settings, including login restrictions and IP access control, are restricted to SuperAdmin accounts. Contact a SuperAdmin if you need a change."
        />
      </div>
    );
  }

  const settings = await getSecuritySettings();
  const currentIp = getRequestIp(await headers());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Security Settings"
        description="Password policy, login restrictions, IP access control, session expiration, and security alerts."
      />
      <SecurityClient initialSettings={settings} currentIp={currentIp} />
    </div>
  );
}
