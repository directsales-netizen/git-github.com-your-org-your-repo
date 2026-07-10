import { ShieldAlert } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import { getBusinessSettings } from '@/lib/admin/settings';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import SettingsClient from './SettingsClient';
import RedeploySection from './RedeploySection';

export default async function AdminSettingsPage() {
  // src/proxy.ts + the dashboard layout already guarantee a valid admin
  // session; business-wide settings (incl. maintenance mode) are
  // SuperAdmin-only specifically.
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Business Settings" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="Business-wide settings, including maintenance mode, are restricted to SuperAdmin accounts. Contact a SuperAdmin if you need a change."
        />
      </div>
    );
  }

  const settings = await getBusinessSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Business Settings" description="Store details used across the site and support communications." />
      <SettingsClient initialSettings={settings} />
      <RedeploySection />
    </div>
  );
}
