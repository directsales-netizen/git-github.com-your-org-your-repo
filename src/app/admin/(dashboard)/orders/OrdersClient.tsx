'use client';

import { useState } from 'react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import type { OrderSummary } from '@/types/chat';
import { inputVariants } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge';

const STATUS_OPTIONS: OrderSummary['status'][] = ['processing', 'shipped', 'out-for-delivery', 'delivered'];

const STATUS_TONE: Record<OrderSummary['status'], BadgeTone> = {
  processing: 'info',
  shipped: 'warning',
  'out-for-delivery': 'warning',
  delivered: 'success',
};

const STATUS_LABEL: Record<OrderSummary['status'], string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
};

export default function OrdersClient({ initialOrders }: { initialOrders: OrderSummary[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(order: OrderSummary, status: OrderSummary['status']) {
    setError(null);
    const response = await adminFetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const updated: OrderSummary = await response.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      router.refresh();
    } else {
      setError(await extractAdminErrorMessage(response, `Unable to update order ${order.id}.`));
    }
  }

  const columns: Column<OrderSummary>[] = [
    { key: 'id', header: 'Order', sortValue: (o) => o.id, render: (o) => <span className="font-medium text-neutral-white">{o.id}</span> },
    {
      key: 'items',
      header: 'Items',
      render: (o) => (
        <span className="text-neutral-silver">
          {o.items.map((i) => i.title).join(', ')}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortValue: (o) => o.items.reduce((sum, i) => sum + i.price, 0),
      render: (o) => `$${o.items.reduce((sum, i) => sum + i.price, 0).toLocaleString()}`,
    },
    { key: 'placedDate', header: 'Placed', sortValue: (o) => o.placedDate },
    { key: 'estimatedDelivery', header: 'Est. delivery', sortValue: (o) => o.estimatedDelivery },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <div className="flex items-center gap-2">
          <StatusBadge tone={STATUS_TONE[o.status]} label={STATUS_LABEL[o.status]} />
          <select
            aria-label={`Update status for order ${o.id}`}
            value={o.status}
            onChange={(event) => updateStatus(o, event.target.value as OrderSummary['status'])}
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
    <div className="flex flex-col gap-3">
      {error && <p className="text-body-sm font-body text-error">{error}</p>}
      <DataTable
        columns={columns}
        rows={orders}
        getRowId={(o) => o.id}
        searchable
        searchPlaceholder="Search orders…"
        searchKeys={['id']}
        emptyMessage="No orders yet."
      />
    </div>
  );
}
