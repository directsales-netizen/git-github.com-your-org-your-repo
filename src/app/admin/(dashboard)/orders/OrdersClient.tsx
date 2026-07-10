'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import type { AdminOrderSummary, PaymentProvider, PaymentStatus } from '@/types/admin';
import type { DisputeRecord } from '@/types/fraud';
import type { OrderSummary } from '@/types/chat';
import { accessibility, buttonVariants, cardVariants, cn, inputVariants, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import RefundModal, { orderTotalCents } from '@/components/admin/RefundModal';
import { PROVIDER_LABEL, SHIPMENT_STATUS_LABEL, SHIPMENT_STATUS_TONE, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, getPaymentStatus } from '@/lib/admin/orderLabels';

const STATUS_OPTIONS: OrderSummary['status'][] = ['processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];

export default function OrdersClient({ initialOrders, disputes }: { initialOrders: AdminOrderSummary[]; disputes: DisputeRecord[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<AdminOrderSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderSummary['status'] | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState<PaymentProvider | 'all'>('all');

  async function updateStatus(order: AdminOrderSummary, status: OrderSummary['status']) {
    setError(null);
    const response = await adminFetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const updated: AdminOrderSummary = await response.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      router.refresh();
    } else {
      setError(await extractAdminErrorMessage(response, `Unable to update order ${order.id}.`));
    }
  }

  function handleRefunded(updated: AdminOrderSummary) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setRefundTarget(null);
    router.refresh();
  }

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (paymentFilter !== 'all' && getPaymentStatus(o, disputes) !== paymentFilter) return false;
        if (providerFilter !== 'all' && o.paymentProvider !== providerFilter) return false;
        return true;
      }),
    [orders, disputes, statusFilter, paymentFilter, providerFilter]
  );

  const analytics = useMemo(() => {
    const revenueCents = filtered.reduce((sum, o) => sum + orderTotalCents(o), 0);
    const refundedCents = filtered.reduce((sum, o) => sum + (o.refundedAmount ?? 0), 0);
    return {
      count: filtered.length,
      revenue: revenueCents / 100,
      refunded: refundedCents / 100,
      aov: filtered.length ? revenueCents / 100 / filtered.length : 0,
    };
  }, [filtered]);

  const columns: Column<AdminOrderSummary>[] = [
    {
      key: 'id',
      header: 'Order',
      sortValue: (o) => o.id,
      render: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="font-medium text-neutral-white hover:text-accent-primary hover:underline">
          {o.id}
        </Link>
      ),
    },
    { key: 'email', header: 'Customer', render: (o) => <span className="text-neutral-silver">{o.email}</span> },
    {
      key: 'items',
      header: 'Items',
      render: (o) => <span className="text-neutral-silver">{o.items.map((i) => i.title).join(', ')}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      sortValue: (o) => orderTotalCents(o),
      render: (o) => `$${(orderTotalCents(o) / 100).toLocaleString()}`,
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (o) => (
        <div className="flex flex-col gap-0.5">
          <StatusBadge tone={PAYMENT_STATUS_TONE[getPaymentStatus(o, disputes)]} label={PAYMENT_STATUS_LABEL[getPaymentStatus(o, disputes)]} />
          <span className="text-caption text-neutral-silver">{o.paymentProvider ? PROVIDER_LABEL[o.paymentProvider] : '—'}</span>
        </div>
      ),
    },
    { key: 'placedDate', header: 'Placed', sortValue: (o) => o.placedDate },
    {
      key: 'status',
      header: 'Shipment',
      render: (o) => (
        <div className="flex items-center gap-2">
          <StatusBadge tone={SHIPMENT_STATUS_TONE[o.status]} label={SHIPMENT_STATUS_LABEL[o.status]} />
          <select
            aria-label={`Update status for order ${o.id}`}
            value={o.status}
            onChange={(event) => updateStatus(o, event.target.value as OrderSummary['status'])}
            className={`${inputVariants.base} w-auto py-1.5 text-caption`}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {SHIPMENT_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
        <div className={cn(cardVariants.minimal, 'flex flex-col gap-1')}>
          <span className="text-caption font-body text-neutral-silver">Orders (filtered)</span>
          <span className="text-h5 font-heading font-semibold text-neutral-white">{analytics.count}</span>
        </div>
        <div className={cn(cardVariants.minimal, 'flex flex-col gap-1')}>
          <span className="text-caption font-body text-neutral-silver">Revenue</span>
          <span className="text-h5 font-heading font-semibold text-neutral-white">${analytics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className={cn(cardVariants.minimal, 'flex flex-col gap-1')}>
          <span className="text-caption font-body text-neutral-silver">Refunded</span>
          <span className="text-h5 font-heading font-semibold text-neutral-white">${analytics.refunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className={cn(cardVariants.minimal, 'flex flex-col gap-1')}>
          <span className="text-caption font-body text-neutral-silver">Avg. order value</span>
          <span className="text-h5 font-heading font-semibold text-neutral-white">${analytics.aov.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={`${inputVariants.base} w-auto`} aria-label="Filter by shipment status">
          <option value="all">All shipment statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{SHIPMENT_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)} className={`${inputVariants.base} w-auto`} aria-label="Filter by payment status">
          <option value="all">All payment statuses</option>
          {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map((s) => (
            <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value as typeof providerFilter)} className={`${inputVariants.base} w-auto`} aria-label="Filter by payment provider">
          <option value="all">All providers</option>
          {(Object.keys(PROVIDER_LABEL) as PaymentProvider[]).map((p) => (
            <option key={p} value={p}>{PROVIDER_LABEL[p]}</option>
          ))}
        </select>

        <a
          href="/api/admin/orders/export"
          className={cn(buttonVariants.ghost, accessibility.focusRing, 'ml-auto px-3 py-2 text-caption')}
        >
          Export CSV
        </a>
      </div>

      {error && <p className="text-body-sm font-body text-error">{error}</p>}
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(o) => o.id}
        searchable
        searchPlaceholder="Search orders…"
        searchKeys={['id', 'email']}
        emptyMessage="No orders match these filters."
        rowActions={(o) =>
          o.providerReference && orderTotalCents(o) - (o.refundedAmount ?? 0) > 0 ? (
            <button
              type="button"
              onClick={() => setRefundTarget(o)}
              className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-3 py-1.5 text-caption')}
            >
              Refund
            </button>
          ) : null
        }
      />

      {refundTarget && <RefundModal order={refundTarget} onClose={() => setRefundTarget(null)} onRefunded={handleRefunded} />}
    </div>
  );
}
