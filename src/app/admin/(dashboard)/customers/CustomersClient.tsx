'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle2 } from 'lucide-react';
import type { Customer } from '@/types/admin';
import { accessibility, cn } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);

  async function toggleStatus(customer: Customer) {
    const nextStatus = customer.status === 'active' ? 'blocked' : 'active';
    const response = await fetch(`/api/admin/customers/${customer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) {
      const updated: Customer = await response.json();
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      router.refresh();
    }
  }

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Name', sortValue: (c) => c.name, render: (c) => <span className="font-medium text-neutral-white">{c.name}</span> },
    { key: 'email', header: 'Email', sortValue: (c) => c.email },
    { key: 'location', header: 'Location', sortValue: (c) => c.location },
    { key: 'orders', header: 'Orders', sortValue: (c) => c.orders },
    { key: 'lifetimeValue', header: 'Lifetime value', sortValue: (c) => c.lifetimeValue, render: (c) => `$${c.lifetimeValue.toLocaleString()}` },
    { key: 'joinedDate', header: 'Joined', sortValue: (c) => c.joinedDate },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge tone={c.status === 'active' ? 'success' : 'error'} label={c.status === 'active' ? 'Active' : 'Blocked'} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={customers}
      getRowId={(c) => c.id}
      searchable
      searchPlaceholder="Search customers…"
      searchKeys={['name', 'email']}
      emptyMessage="No customers yet."
      rowActions={(c) => (
        <button
          type="button"
          onClick={() => toggleStatus(c)}
          aria-label={c.status === 'active' ? `Block ${c.name}` : `Unblock ${c.name}`}
          className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}
        >
          {c.status === 'active' ? <Ban size={14} aria-hidden="true" /> : <CheckCircle2 size={14} aria-hidden="true" />}
        </button>
      )}
    />
  );
}
