'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import type { AdminOrderSummary } from '@/types/admin';
import type { DisputeRecord, FraudBlocklists, RiskLevel } from '@/types/fraud';
import { accessibility, buttonVariants, cardVariants, cn, inputVariants, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const RISK_TONE: Record<RiskLevel, BadgeTone> = { low: 'success', flagged: 'warning', extreme: 'error' };

function orderTotal(order: AdminOrderSummary): number {
  return order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
}

interface Props {
  initialQueue: AdminOrderSummary[];
  initialBlocklists: FraudBlocklists;
  initialDisputes: DisputeRecord[];
}

export default function FraudClient({ initialQueue, initialBlocklists, initialDisputes }: Props) {
  const router = useRouter();
  const [queue, setQueue] = useState(initialQueue);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ order: AdminOrderSummary; action: 'approve' | 'reject' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function runAction(order: AdminOrderSummary, action: 'approve' | 'reject') {
    setIsSubmitting(true);
    setError(null);

    const response = await adminFetch(`/api/admin/fraud/${order.id}/${action}`, { method: 'POST' });
    if (response.ok) {
      const updated: AdminOrderSummary = await response.json();
      setQueue((prev) => prev.filter((o) => o.id !== updated.id));
      router.refresh();
    } else {
      setError(await extractAdminErrorMessage(response, `Unable to ${action} order ${order.id}.`));
    }
    setIsSubmitting(false);
    setConfirmAction(null);
  }

  const columns: Column<AdminOrderSummary>[] = [
    { key: 'id', header: 'Order', sortValue: (o) => o.id, render: (o) => <span className="font-medium text-neutral-white">{o.id}</span> },
    { key: 'email', header: 'Customer', render: (o) => o.email },
    { key: 'provider', header: 'Payment', render: (o) => (o.paymentProvider === 'stripe' ? 'Stripe' : o.paymentProvider === 'paypal' ? 'PayPal' : '—') },
    { key: 'total', header: 'Amount', sortValue: (o) => orderTotal(o), render: (o) => `$${orderTotal(o).toFixed(2)}` },
    {
      key: 'risk',
      header: 'Risk',
      sortValue: (o) => o.riskScore ?? 0,
      render: (o) => (
        <div className="flex flex-col gap-1">
          <StatusBadge tone={o.riskLevel ? RISK_TONE[o.riskLevel] : 'neutral'} label={`${o.reviewStatus === 'held' ? 'Held' : 'Flagged'} · ${o.riskScore ?? 0}`} />
          {o.riskReasons && o.riskReasons.length > 0 && (
            <ul className="list-disc pl-4 text-caption text-neutral-silver">
              {o.riskReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    { key: 'clientIp', header: 'IP', render: (o) => o.clientIp ?? '—' },
    { key: 'placedDate', header: 'Placed', sortValue: (o) => o.placedDate },
  ];

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="text-body-sm font-body text-error">{error}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Review Queue</h2>
        <DataTable
          columns={columns}
          rows={queue}
          getRowId={(o) => o.id}
          searchable
          searchPlaceholder="Search by order id…"
          searchKeys={['id', 'email']}
          emptyMessage="Nothing to review — no flagged or held orders."
          rowActions={(o) => (
            <div className="flex justify-end gap-2">
              {o.reviewStatus === 'held' && (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ order: o, action: 'approve' })}
                    className={cn(buttonVariants.primary, accessibility.focusRing, 'px-3 py-1.5 text-caption')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ order: o, action: 'reject' })}
                    className={cn(buttonVariants.danger, accessibility.focusRing, 'px-3 py-1.5 text-caption')}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          )}
        />
      </section>

      <BlocklistsPanel initialBlocklists={initialBlocklists} />

      <section className="flex flex-col gap-3">
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Chargebacks</h2>
        <DataTable
          columns={[
            { key: 'provider', header: 'Provider', render: (d: DisputeRecord) => (d.provider === 'stripe' ? 'Stripe' : 'PayPal') },
            { key: 'orderId', header: 'Order', render: (d: DisputeRecord) => d.orderId ?? '—' },
            { key: 'amount', header: 'Amount', render: (d: DisputeRecord) => (d.amount != null ? `$${d.amount.toFixed(2)}` : '—') },
            { key: 'status', header: 'Status', render: (d: DisputeRecord) => d.status },
            { key: 'createdAt', header: 'Date', sortValue: (d: DisputeRecord) => d.createdAt, render: (d: DisputeRecord) => new Date(d.createdAt).toLocaleDateString() },
          ]}
          rows={initialDisputes}
          getRowId={(d) => d.id}
          emptyMessage="No chargebacks recorded."
        />
      </section>

      {confirmAction && (
        <ConfirmDialog
          isOpen
          title={confirmAction.action === 'approve' ? 'Approve this order?' : 'Reject and refund this order?'}
          message={
            confirmAction.action === 'approve'
              ? `This releases fulfillment for order ${confirmAction.order.id} — stock will be decremented, rewards awarded, and a confirmation email sent.`
              : `This issues a full refund for order ${confirmAction.order.id} ($${orderTotal(confirmAction.order).toFixed(2)}) and permanently blocks fulfillment.`
          }
          confirmLabel={isSubmitting ? 'Working…' : confirmAction.action === 'approve' ? 'Approve' : 'Reject & Refund'}
          danger={confirmAction.action === 'reject'}
          onConfirm={() => runAction(confirmAction.order, confirmAction.action)}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

function BlocklistsPanel({ initialBlocklists }: { initialBlocklists: FraudBlocklists }) {
  const [ips, setIps] = useState(initialBlocklists.blockedIps.join('\n'));
  const [countries, setCountries] = useState(initialBlocklists.blockedCardCountries.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    const blockedIps = ips.split('\n').map((v) => v.trim()).filter(Boolean);
    const blockedCardCountries = countries.split(',').map((v) => v.trim().toUpperCase()).filter(Boolean);

    const response = await adminFetch('/api/admin/fraud/blocklists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedIps, blockedCardCountries }),
    });

    if (response.ok) {
      setSaved(true);
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to save blocklists.'));
    }
    setIsSaving(false);
  }

  return (
    <section className={cn(cardVariants.base, 'flex flex-col gap-4')}>
      <div>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Blocklists</h2>
        <p className="text-body-sm font-body text-neutral-silver">
          An IP here hard-blocks checkout before any payment is attempted. A card-issuing country here contributes to
          the risk score (this can&apos;t pre-block a Stripe charge — for a true pre-auth block, configure a matching
          Stripe Radar rule in the Dashboard).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <div>
          <label htmlFor="fraud-blocked-ips" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
            Blocked IPs (one per line)
          </label>
          <textarea
            id="fraud-blocked-ips"
            rows={5}
            value={ips}
            onChange={(e) => setIps(e.target.value)}
            className="w-full resize-none rounded-md border border-neutral-titanium bg-bg-primary px-4 py-3 text-body-sm font-body text-neutral-white focus-visible:border-2 focus-visible:border-accent-primary focus-visible:outline-none"
          />
        </div>
        <div>
          <label htmlFor="fraud-blocked-countries" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
            Blocked card-issuing countries (comma-separated ISO codes)
          </label>
          <input
            id="fraud-blocked-countries"
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="e.g. KP, IR"
            className={inputVariants.base}
          />
        </div>
      </div>

      {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}
      {saved && <p className="text-body-sm font-body text-success">Saved.</p>}

      <button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className={cn(buttonVariants.primary, spacing.buttonPadding, accessibility.focusRing, 'self-start text-body-sm')}
      >
        {isSaving ? 'Saving…' : 'Save Blocklists'}
      </button>
    </section>
  );
}
