import { getBusinessSettings } from '@/lib/admin/settings';
import PageHeader from '@/components/admin/PageHeader';
import SettingsClient from './SettingsClient';

export default async function AdminSettingsPage() {
  const settings = await getBusinessSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Business Settings" description="Store details used across the site and support communications." />
      <SettingsClient initialSettings={settings} />
    </div>
  );
}
