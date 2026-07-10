'use client';

import type { ActivityLogEntry } from '@/types/admin';
import DataTable, { type Column } from '@/components/admin/DataTable';

const columns: Column<ActivityLogEntry>[] = [
  { key: 'createdAt', header: 'When', sortValue: (e) => e.createdAt, render: (e) => new Date(e.createdAt).toLocaleString() },
  { key: 'actor', header: 'Actor', sortValue: (e) => e.actor },
  { key: 'action', header: 'Action', sortValue: (e) => e.action },
  { key: 'target', header: 'Target', sortValue: (e) => e.target },
  { key: 'detail', header: 'Detail', render: (e) => e.detail ?? '—' },
  { key: 'ip', header: 'IP', render: (e) => e.ip ?? '—' },
  { key: 'device', header: 'Device', render: (e) => e.device ?? '—' },
  {
    key: 'success',
    header: 'Success',
    render: (e) => (e.success === undefined ? '—' : e.success ? 'Yes' : 'No'),
  },
];

export default function LogsClient({ entries }: { entries: ActivityLogEntry[] }) {
  return (
    <DataTable
      columns={columns}
      rows={entries}
      getRowId={(e) => e.id}
      searchable
      searchPlaceholder="Search activity…"
      searchKeys={['actor', 'action', 'target']}
      emptyMessage="No activity yet."
      pageSize={20}
    />
  );
}
