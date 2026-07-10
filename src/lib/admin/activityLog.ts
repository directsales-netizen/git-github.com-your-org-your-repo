import type { ActivityLogEntry } from '@/types/admin';
import { globalBox, globalSingleton } from '@/lib/globalStore';

// In-memory, append-only — resets on server restart, same accepted
// limitation as every other mock data store in this app. Stored via
// globalSingleton/globalBox (see src/lib/globalStore.ts) so writes from
// every other module's mutating API route are visible to page reads
// within the same server process.
const ACTIVITY_LOG = globalSingleton('activityLog', (): ActivityLogEntry[] => [
  {
    id: 'log-seed-1',
    actor: 'system',
    action: 'seed',
    target: 'admin dashboard',
    detail: 'Activity log initialized.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]);

const nextIdBox = globalBox('activityLogNextId', () => 2);

export async function logActivity(entry: {
  actor: string;
  action: string;
  target: string;
  detail?: string;
  ip?: string | null;
  device?: string;
  success?: boolean;
  previousValue?: string;
  newValue?: string;
}): Promise<ActivityLogEntry> {
  const record: ActivityLogEntry = {
    id: `log-${nextIdBox.current++}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  ACTIVITY_LOG.unshift(record);
  return record;
}

export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  return ACTIVITY_LOG;
}
