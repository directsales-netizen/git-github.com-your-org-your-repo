import { getActivityLog } from '@/lib/admin/activityLog';
import PageHeader from '@/components/admin/PageHeader';
import LogsClient from './LogsClient';

export default async function AdminLogsPage() {
  const entries = await getActivityLog();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity Logs" description="A record of admin actions taken in this dashboard. Resets on server restart." />
      <LogsClient entries={entries} />
    </div>
  );
}
