'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, MonitorSmartphone } from 'lucide-react';
import type { SessionRecord } from '@/lib/admin/sessionRegistry';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';

type SessionRow = SessionRecord & { isCurrent: boolean };

export default function SessionsClient({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(sessions);
  const [revokingSid, setRevokingSid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRevokeAllOpen, setIsRevokeAllOpen] = useState(false);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  async function handleRevoke(sid: string) {
    setRevokingSid(sid);
    setError(null);
    const response = await adminFetch(`/api/admin/sessions/${sid}/revoke`, { method: 'POST' });
    if (!response.ok) {
      setError(await extractAdminErrorMessage(response, 'Unable to revoke that session.'));
      setRevokingSid(null);
      return;
    }
    setRows((current) => current.filter((row) => row.sid !== sid));
    setRevokingSid(null);
  }

  async function handleRevokeAll() {
    setIsRevokingAll(true);
    setError(null);
    const response = await adminFetch('/api/admin/sessions/revoke-all', { method: 'POST' });
    if (!response.ok) {
      setError(await extractAdminErrorMessage(response, 'Unable to log out of all devices.'));
      setIsRevokingAll(false);
      return;
    }
    router.push('/admin/login');
  }

  const columns: Column<SessionRow>[] = [
    {
      key: 'device',
      header: 'Device',
      sortValue: (r) => `${r.browser} ${r.os}`,
      render: (r) => (
        <span className="flex items-center gap-2">
          <MonitorSmartphone size={14} className="text-neutral-silver" aria-hidden="true" />
          {r.browser} on {r.os}
          {r.isCurrent && (
            <span className="rounded-full bg-accent-primary/10 px-2 py-0.5 text-caption font-body text-accent-primary">
              This device
            </span>
          )}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Signed in', sortValue: (r) => r.createdAt, render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: 'lastUsedAt', header: 'Last active', sortValue: (r) => r.lastUsedAt, render: (r) => new Date(r.lastUsedAt).toLocaleString() },
  ];

  return (
    <div className="flex flex-col gap-6">
      {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.sid}
        emptyMessage="No remembered devices — sessions only appear here after signing in with “Keep me logged in” checked."
        pageSize={20}
        rowActions={(r) =>
          r.isCurrent ? (
            <span className="text-caption font-body text-neutral-silver">Use “Log out” to end this device</span>
          ) : (
            <button
              type="button"
              onClick={() => handleRevoke(r.sid)}
              disabled={revokingSid === r.sid}
              className={cn('rounded-md px-2 py-1 text-caption text-error hover:underline', 'disabled:opacity-50')}
            >
              {revokingSid === r.sid ? 'Revoking…' : 'Revoke'}
            </button>
          )
        }
      />

      <div className={cn(cardVariants.base, 'max-w-2xl border-error/30')}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
          <div>
            <h2 className="text-h6 font-heading font-semibold text-neutral-white">Log out of all devices</h2>
            <p className="mt-1 text-body-sm font-body text-neutral-silver">
              Revokes every remembered device, including this one, and signs you out everywhere immediately.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsRevokeAllOpen(true)}
            className={cn(buttonVariants.danger, spacing.buttonPadding, 'text-body-sm')}
          >
            Log out of all devices
          </button>
        </div>

        <Modal
          isOpen={isRevokeAllOpen}
          onClose={() => setIsRevokeAllOpen(false)}
          title="Log out of all devices?"
          size="sm"
          footer={
            <>
              <button type="button" onClick={() => setIsRevokeAllOpen(false)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeAll}
                disabled={isRevokingAll}
                className={cn(buttonVariants.danger, spacing.buttonPadding, 'text-body-sm')}
              >
                {isRevokingAll ? 'Logging out…' : 'Log out everywhere'}
              </button>
            </>
          }
        >
          <p className="text-body-sm font-body text-neutral-light-gray">
            This immediately signs you out on every device, including the one you&apos;re using right now.
            You&apos;ll need to sign in again anywhere you want to keep using the dashboard.
          </p>
        </Modal>
      </div>
    </div>
  );
}
