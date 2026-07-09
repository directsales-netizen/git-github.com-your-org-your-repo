'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import type { AppointmentStatus, AppointmentSummary } from '@/types/chat';
import { APPOINTMENT_TYPE_LABELS } from '@/lib/chat/appointments';
import { inputVariants } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge';

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const STATUS_TONE: Record<AppointmentStatus, BadgeTone> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AppointmentsClient({ initialAppointments }: { initialAppointments: AppointmentSummary[] }) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);

  async function updateStatus(appointment: AppointmentSummary, status: AppointmentStatus) {
    const response = await adminFetch(`/api/admin/appointments/${appointment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const updated: AppointmentSummary = await response.json();
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      router.refresh();
    }
  }

  const columns: Column<AppointmentSummary>[] = [
    { key: 'id', header: 'Reference', sortValue: (a) => a.id, render: (a) => <span className="font-medium text-neutral-white">{a.id}</span> },
    { key: 'type', header: 'Type', sortValue: (a) => a.type, render: (a) => APPOINTMENT_TYPE_LABELS[a.type] },
    { key: 'preferredWindow', header: 'Preferred window', sortValue: (a) => a.preferredWindow },
    { key: 'contactMethod', header: 'Contact', sortValue: (a) => a.contactMethod },
    { key: 'createdAt', header: 'Requested', sortValue: (a) => a.createdAt, render: (a) => new Date(a.createdAt).toLocaleDateString() },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <div className="flex items-center gap-2">
          <StatusBadge tone={STATUS_TONE[a.status]} label={STATUS_LABEL[a.status]} />
          <select
            aria-label={`Update status for ${a.id}`}
            value={a.status}
            onChange={(event) => updateStatus(a, event.target.value as AppointmentStatus)}
            className={`${inputVariants.base} w-auto py-1.5 text-caption`}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={appointments}
      getRowId={(a) => a.id}
      searchable
      searchPlaceholder="Search appointments…"
      searchKeys={['id', 'contactMethod']}
      emptyMessage="No appointments yet."
    />
  );
}
