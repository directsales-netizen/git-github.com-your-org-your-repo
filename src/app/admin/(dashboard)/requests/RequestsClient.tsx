'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle2, Circle, Mail, MessageSquare, Smartphone, XCircle } from 'lucide-react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import type { RequestStatus, VisitorRequest, NotificationChannel, DeliveryStatus } from '@/types/admin';
import { REQUEST_KIND_LABELS, REQUEST_STATUS_LABELS, REQUEST_PRIORITY_LABELS } from '@/lib/admin/requestLabels';
import { accessibility, buttonVariants, cn, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge';
import Drawer from '@/components/admin/Drawer';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { TextField, SelectField } from '@/components/admin/FormFields';

const STATUS_TONE: Record<RequestStatus, BadgeTone> = {
  new: 'info',
  assigned: 'warning',
  in_progress: 'warning',
  completed: 'success',
  archived: 'neutral',
};

const FILTER_TABS: Array<{ value: RequestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const CHANNEL_ICON: Record<NotificationChannel, typeof Mail> = {
  email: Mail,
  sms: Smartphone,
  dashboard: MessageSquare,
};

const DELIVERY_TONE: Record<DeliveryStatus, string> = {
  sent: 'text-success',
  failed: 'text-error',
  not_configured: 'text-neutral-silver',
};

function DeliveryIcons({ deliveries }: { deliveries: VisitorRequest['deliveries'] }) {
  const channels: NotificationChannel[] = ['sms', 'email', 'dashboard'];
  return (
    <div className="flex items-center gap-2">
      {channels.map((channel) => {
        const delivery = deliveries.find((d) => d.channel === channel);
        const Icon = CHANNEL_ICON[channel];
        const status = delivery?.status ?? 'not_configured';
        return (
          <span key={channel} title={`${channel}: ${status.replace('_', ' ')}${delivery?.error ? ` — ${delivery.error}` : ''}`} className={DELIVERY_TONE[status]}>
            <Icon size={14} aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

export default function RequestsClient({ initialRequests }: { initialRequests: VisitorRequest[] }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [detail, setDetail] = useState<VisitorRequest | null>(null);
  const [assignedToDraft, setAssignedToDraft] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<VisitorRequest | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)), [requests, filter]);

  async function patchRequest(id: string, patch: Partial<Pick<VisitorRequest, 'status' | 'assignedTo' | 'read' | 'priority'>>): Promise<VisitorRequest | null> {
    const response = await adminFetch(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      setError(await extractAdminErrorMessage(response, `Unable to update ${id}.`));
      return null;
    }
    setError(null);
    const updated: VisitorRequest = await response.json();
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    router.refresh();
    return updated;
  }

  function openDetail(request: VisitorRequest) {
    setDetail(request);
    setAssignedToDraft(request.assignedTo ?? '');
    if (!request.read) void patchRequest(request.id, { read: true });
  }

  async function handleSaveAssignment() {
    if (!detail) return;
    setIsSaving(true);
    const updated = await patchRequest(detail.id, { assignedTo: assignedToDraft.trim() || undefined, status: detail.status === 'new' ? 'assigned' : detail.status });
    if (updated) setDetail(updated);
    setIsSaving(false);
  }

  async function handleArchive() {
    if (!archiveTarget) return;
    await patchRequest(archiveTarget.id, { status: 'archived' });
    setArchiveTarget(null);
    setDetail(null);
  }

  const columns: Column<VisitorRequest>[] = [
    {
      key: 'read',
      header: '',
      className: 'w-8',
      render: (r) => (r.read ? <Circle size={8} aria-hidden="true" className="text-transparent" /> : <Circle size={8} aria-hidden="true" className="fill-accent-primary text-accent-primary" />),
    },
    { key: 'id', header: 'Reference', sortValue: (r) => r.id, render: (r) => <span className="font-medium text-neutral-white">{r.id}</span> },
    { key: 'kind', header: 'Type', sortValue: (r) => r.kind, render: (r) => REQUEST_KIND_LABELS[r.kind] },
    {
      key: 'contact',
      header: 'Contact',
      render: (r) => (
        <div>
          {r.clientName && <p className="text-neutral-white">{r.clientName}</p>}
          {r.email && <p className="text-caption text-neutral-silver">{r.email}</p>}
          {r.phone && <p className="text-caption text-neutral-silver">{r.phone}</p>}
        </div>
      ),
    },
    { key: 'priority', header: 'Priority', sortValue: (r) => r.priority, render: (r) => REQUEST_PRIORITY_LABELS[r.priority] },
    { key: 'deliveries', header: 'Delivery', render: (r) => <DeliveryIcons deliveries={r.deliveries} /> },
    { key: 'createdAt', header: 'Received', sortValue: (r) => r.createdAt, render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge tone={STATUS_TONE[r.status]} label={REQUEST_STATUS_LABELS[r.status]} /> },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-caption font-body font-medium transition-colors',
              accessibility.focusRing,
              filter === tab.value ? 'bg-accent-primary text-bg-primary' : 'bg-bg-secondary text-neutral-silver hover:text-accent-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-body-sm font-body text-error">{error}</p>}

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={(r) => r.id}
          searchable
          searchPlaceholder="Search requests…"
          searchKeys={['id', 'clientName', 'email', 'phone', 'message']}
          emptyMessage="No requests yet."
          rowActions={(r) => (
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={() => openDetail(r)} className={cn('rounded-md px-2 py-1 text-caption text-accent-primary hover:underline', accessibility.focusRing)}>
                View
              </button>
              {r.status !== 'archived' && (
                <button type="button" aria-label={`Archive ${r.id}`} onClick={() => setArchiveTarget(r)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-error', accessibility.focusRing)}>
                  <Archive size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        />
      </div>

      <Drawer
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.id} — ${REQUEST_KIND_LABELS[detail.kind]}` : ''}
        footer={
          detail && (
            <>
              <button type="button" onClick={() => setDetail(null)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
                Close
              </button>
              <button type="button" onClick={handleSaveAssignment} disabled={isSaving} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </>
          )
        }
      >
        {detail && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-label-md font-body text-neutral-light-gray">Message</p>
              <p className="mt-1 whitespace-pre-wrap text-body-sm font-body text-neutral-white">{detail.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-body-sm font-body text-neutral-light-gray">
              {detail.clientName && <p><strong className="text-neutral-white">Name:</strong> {detail.clientName}</p>}
              {detail.companyName && <p><strong className="text-neutral-white">Company:</strong> {detail.companyName}</p>}
              {detail.email && <p><strong className="text-neutral-white">Email:</strong> {detail.email}</p>}
              {detail.phone && <p><strong className="text-neutral-white">Phone:</strong> {detail.phone}</p>}
              <p><strong className="text-neutral-white">Source:</strong> {detail.source}</p>
              <p><strong className="text-neutral-white">Received:</strong> {new Date(detail.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="mb-1.5 text-label-md font-body text-neutral-light-gray">Delivery status</p>
              <div className="flex flex-col gap-1 text-caption font-body text-neutral-silver">
                {detail.deliveries.map((d) => (
                  <div key={d.channel} className="flex items-center gap-2">
                    {d.status === 'sent' ? <CheckCircle2 size={14} className="text-success" aria-hidden="true" /> : <XCircle size={14} className="text-error" aria-hidden="true" />}
                    <span className="capitalize">{d.channel}</span>: {d.status.replace('_', ' ')} ({d.attempts} attempt{d.attempts === 1 ? '' : 's'})
                    {d.error && <span className="text-error">— {d.error}</span>}
                  </div>
                ))}
              </div>
            </div>

            <SelectField
              id="request-status"
              label="Status"
              value={detail.status}
              onChange={async (v) => {
                const updated = await patchRequest(detail.id, { status: v as RequestStatus });
                if (updated) setDetail(updated);
              }}
              options={(Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map((s) => ({ label: REQUEST_STATUS_LABELS[s], value: s }))}
            />
            <TextField id="request-assigned-to" label="Assigned to" placeholder="Staff member name" value={assignedToDraft} onChange={setAssignedToDraft} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={archiveTarget !== null}
        title="Archive request"
        message={`Archive ${archiveTarget?.id}? It will stay searchable under the Archived filter.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </>
  );
}
