'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import type { AdminOrderSummary, VisitorRequest } from '@/types/admin';
import type { DisputeRecord } from '@/types/fraud';
import { accessibility, buttonVariants, cardVariants, cn, inputVariants, spacing } from '@/design';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import RefundModal, { orderTotalCents } from '@/components/admin/RefundModal';
import { REQUEST_KIND_LABELS, REQUEST_STATUS_LABELS } from '@/lib/admin/requestLabels';
import {
  PROVIDER_LABEL,
  SHIPMENT_STATUS_LABEL,
  SHIPMENT_STATUS_TONE,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  RETURN_STATUS_LABEL,
  WARRANTY_STATUS_LABEL,
  getPaymentStatus,
} from '@/lib/admin/orderLabels';

interface Props {
  order: AdminOrderSummary;
  disputes: DisputeRecord[];
  linkedRequests: VisitorRequest[];
}

const currency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function OrderDetailClient({ order: initialOrder, disputes, linkedRequests }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState<string | null>(null);
  const [showRefund, setShowRefund] = useState(false);
  const [showShip, setShowShip] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes ?? '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const paymentStatus = getPaymentStatus(order, disputes);
  const totalCents = orderTotalCents(order);

  function applyUpdate(updated: AdminOrderSummary) {
    setOrder(updated);
    router.refresh();
  }

  async function handleCancel() {
    setIsCancelling(true);
    setError(null);
    const response = await adminFetch(`/api/admin/orders/${order.id}/cancel`, { method: 'POST' });
    if (response.ok) {
      applyUpdate(await response.json());
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to cancel this order.'));
    }
    setIsCancelling(false);
    setShowCancelConfirm(false);
  }

  async function handleSaveNotes() {
    setIsSavingNotes(true);
    setNotesSaved(false);
    setError(null);
    const response = await adminFetch(`/api/admin/orders/${order.id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalNotes }),
    });
    if (response.ok) {
      setOrder(await response.json());
      setNotesSaved(true);
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to save notes.'));
    }
    setIsSavingNotes(false);
  }

  return (
    <div className="grid grid-cols-1 gap-6 desktop:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-4">
        {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}

        <section className={cn(cardVariants.base, 'flex flex-col gap-3')}>
          <h2 className="text-h6 font-heading font-semibold text-neutral-white">Items</h2>
          <ul className="flex flex-col gap-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-body-sm font-body text-neutral-light-gray">
                <span>{item.title} × {item.quantity ?? 1}</span>
                <span>{currency(item.price * (item.quantity ?? 1))}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-neutral-titanium/10 pt-2 font-heading font-semibold text-neutral-white">
            <span>Total</span>
            <span>{currency(totalCents / 100)}</span>
          </div>
        </section>

        <section className={cn(cardVariants.base, 'flex flex-col gap-3')}>
          <h2 className="text-h6 font-heading font-semibold text-neutral-white">Customer &amp; Shipping</h2>
          <p className="text-body-sm font-body text-neutral-light-gray">{order.email}</p>
          {order.shippingAddress && (
            <p className="text-body-sm font-body text-neutral-light-gray">
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
          )}
        </section>

        <section className={cn(cardVariants.base, 'flex flex-col gap-3')}>
          <h2 className="text-h6 font-heading font-semibold text-neutral-white">Notes</h2>
          <div>
            <p className="mb-1 text-label-md font-body text-neutral-light-gray">Customer notes</p>
            <p className="rounded-md bg-bg-primary/60 px-3 py-2 text-body-sm font-body text-neutral-silver">
              {order.customerNotes || 'No notes left at checkout.'}
            </p>
          </div>
          <div>
            <label htmlFor="internal-notes" className="mb-1 block text-label-md font-body text-neutral-light-gray">
              Internal notes (never shown to the customer)
            </label>
            <textarea
              id="internal-notes"
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full resize-none rounded-md border border-neutral-titanium bg-bg-primary px-3 py-2 text-body-sm font-body text-neutral-white focus-visible:border-2 focus-visible:border-accent-primary focus-visible:outline-none"
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-3 py-1.5 text-caption')}
              >
                {isSavingNotes ? 'Saving…' : 'Save Notes'}
              </button>
              {notesSaved && <span className="text-caption font-body text-success">Saved.</span>}
            </div>
          </div>
        </section>

        <section className={cn(cardVariants.base, 'flex flex-col gap-3')}>
          <h2 className="text-h6 font-heading font-semibold text-neutral-white">Documents</h2>
          <div className="flex flex-wrap gap-3">
            <a href={`/admin/orders/${order.id}/packing-slip`} target="_blank" rel="noreferrer" className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-3 py-2 text-caption')}>
              Print Packing Slip
            </a>
            <a href={`/admin/orders/${order.id}/invoice`} target="_blank" rel="noreferrer" className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-3 py-2 text-caption')}>
              Generate Invoice
            </a>
            <a href={`/admin/orders/${order.id}/shipping-label`} target="_blank" rel="noreferrer" className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-3 py-2 text-caption')}>
              Generate Shipping Label
            </a>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <section className={cn(cardVariants.base, 'flex flex-col gap-3')}>
          <div className="flex items-center justify-between">
            <h2 className="text-h6 font-heading font-semibold text-neutral-white">Payment</h2>
            <StatusBadge tone={PAYMENT_STATUS_TONE[paymentStatus]} label={PAYMENT_STATUS_LABEL[paymentStatus]} />
          </div>
          <p className="text-body-sm font-body text-neutral-silver">
            {order.paymentProvider ? PROVIDER_LABEL[order.paymentProvider] : 'No payment provider on record'}
            {Boolean(order.refundedAmount) && ` — refunded ${currency((order.refundedAmount ?? 0) / 100)}`}
          </p>
          {order.providerReference && totalCents - (order.refundedAmount ?? 0) > 0 && (
            <button type="button" onClick={() => setShowRefund(true)} className={cn(buttonVariants.danger, accessibility.focusRing, 'self-start px-3 py-1.5 text-caption')}>
              Refund
            </button>
          )}
        </section>

        <section className={cn(cardVariants.base, 'flex flex-col gap-3')}>
          <div className="flex items-center justify-between">
            <h2 className="text-h6 font-heading font-semibold text-neutral-white">Shipment</h2>
            <StatusBadge tone={SHIPMENT_STATUS_TONE[order.status]} label={SHIPMENT_STATUS_LABEL[order.status]} />
          </div>
          {order.trackingNumber ? (
            <p className="text-body-sm font-body text-neutral-silver">{order.carrier} — {order.trackingNumber}</p>
          ) : (
            <p className="text-body-sm font-body text-neutral-silver">Not yet shipped.</p>
          )}
          <div className="flex gap-2">
            {order.status === 'processing' && (
              <>
                <button type="button" onClick={() => setShowShip(true)} className={cn(buttonVariants.primary, accessibility.focusRing, 'px-3 py-1.5 text-caption')}>
                  Ship Order
                </button>
                <button type="button" onClick={() => setShowCancelConfirm(true)} className={cn(buttonVariants.ghost, accessibility.focusRing, 'px-3 py-1.5 text-caption')}>
                  Cancel Order
                </button>
              </>
            )}
          </div>
        </section>

        <section className={cn(cardVariants.base, 'flex flex-col gap-2')}>
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-heading font-semibold text-neutral-white">Return</h3>
            <StatusBadge tone="neutral" label={RETURN_STATUS_LABEL[order.returnStatus]} />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-heading font-semibold text-neutral-white">Warranty</h3>
            <StatusBadge tone="neutral" label={WARRANTY_STATUS_LABEL[order.warrantyStatus]} />
          </div>
          {linkedRequests.length > 0 && (
            <div className="mt-2 flex flex-col gap-1 border-t border-neutral-titanium/10 pt-2">
              {linkedRequests.map((r) => (
                <Link key={r.id} href="/admin/requests" className="text-caption font-body text-accent-primary hover:underline">
                  {REQUEST_KIND_LABELS[r.kind]} — {REQUEST_STATUS_LABELS[r.status]} ({r.id})
                </Link>
              ))}
            </div>
          )}
          <p className="text-caption font-body text-neutral-silver">Reviewed from the Requests inbox — approving/completing the linked request there updates these statuses.</p>
        </section>
      </div>

      {showRefund && <RefundModal order={order} onClose={() => setShowRefund(false)} onRefunded={(updated) => { applyUpdate(updated); setShowRefund(false); }} />}
      {showShip && <ShipModal orderId={order.id} onClose={() => setShowShip(false)} onShipped={(updated) => { applyUpdate(updated); setShowShip(false); }} />}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancel this order?"
        message={`This refunds order ${order.id} in full and marks it cancelled. This can't be undone.`}
        confirmLabel={isCancelling ? 'Cancelling…' : 'Cancel Order'}
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}

function ShipModal({ orderId, onClose, onShipped }: { orderId: string; onClose: () => void; onShipped: (updated: AdminOrderSummary) => void }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    const response = await adminFetch(`/api/admin/orders/${orderId}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber, carrier }),
    });
    if (response.ok) {
      onShipped(await response.json());
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to mark this order shipped.'));
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Ship this order"
      footer={
        <>
          <button type="button" onClick={onClose} className={cn(buttonVariants.ghost, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}>
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !trackingNumber.trim() || !carrier.trim()}
            onClick={handleSubmit}
            className={cn(buttonVariants.primary, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}
          >
            {isSubmitting ? 'Saving…' : 'Mark Shipped'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="ship-carrier" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Carrier</label>
          <input id="ship-carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="UPS, USPS, FedEx…" className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="ship-tracking" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Tracking number</label>
          <input id="ship-tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className={inputVariants.base} />
        </div>
        {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}
      </div>
    </Modal>
  );
}
