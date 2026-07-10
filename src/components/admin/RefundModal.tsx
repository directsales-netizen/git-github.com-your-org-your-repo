'use client';

import { useState } from 'react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import type { AdminOrderSummary } from '@/types/admin';
import { PROVIDER_LABEL } from '@/lib/admin/orderLabels';
import { accessibility, buttonVariants, cn, inputVariants, spacing } from '@/design';
import Modal from './Modal';

export function orderTotalCents(order: AdminOrderSummary): number {
  return Math.round(order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0) * 100);
}

interface Props {
  order: AdminOrderSummary;
  onClose: () => void;
  onRefunded: (updated: AdminOrderSummary) => void;
}

/** Shared by the Orders list's row action and the order detail page's Refund button. */
export default function RefundModal({ order, onClose, onRefunded }: Props) {
  const remainingCents = orderTotalCents(order) - (order.refundedAmount ?? 0);
  const [mode, setMode] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState((remainingCents / 100).toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const amountCents = mode === 'full' ? undefined : Math.round(parseFloat(amount) * 100);
    const response = await adminFetch(`/api/admin/orders/${order.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(amountCents != null ? { amountCents } : {}),
    });

    if (response.ok) {
      onRefunded(await response.json());
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to process this refund.'));
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Refund order ${order.id}`}
      footer={
        <>
          <button type="button" onClick={onClose} className={cn(buttonVariants.ghost, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}>
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={cn(buttonVariants.danger, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}
          >
            {isSubmitting ? 'Processing…' : 'Issue Refund'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-sm font-body text-neutral-light-gray">
          {order.paymentProvider ? PROVIDER_LABEL[order.paymentProvider] : 'This'} payment — up to ${(remainingCents / 100).toFixed(2)} refundable.
        </p>

        <div className="flex gap-4 text-body-sm font-body text-neutral-light-gray">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'full'} onChange={() => setMode('full')} className="accent-accent-primary" />
            Full refund
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === 'partial'} onChange={() => setMode('partial')} className="accent-accent-primary" />
            Partial refund
          </label>
        </div>

        {mode === 'partial' && (
          <div>
            <label htmlFor="refund-amount" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
              Amount (USD)
            </label>
            <input
              id="refund-amount"
              type="number"
              min="0.01"
              max={(remainingCents / 100).toFixed(2)}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputVariants.base}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-body-sm font-body text-error">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
