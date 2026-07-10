'use client';

import { useState } from 'react';
import { buttonVariants, cardVariants, cn, inputVariants, spacing } from '@/design';

type RequestKind = 'return_request' | 'refund_request' | 'warranty_repair' | 'support';

const OPTIONS: { kind: RequestKind; label: string; placeholder: string }[] = [
  { kind: 'return_request', label: 'Request a Return', placeholder: "What's the reason for the return?" },
  { kind: 'refund_request', label: 'Request a Refund', placeholder: 'Why are you requesting a refund?' },
  { kind: 'warranty_repair', label: 'Start a Warranty Claim', placeholder: 'Describe the issue with your device.' },
  { kind: 'support', label: 'Contact Support', placeholder: 'How can we help with this order?' },
];

export default function OrderRequestActions({ orderId, supportEmail }: { orderId: string; supportEmail: string }) {
  const [active, setActive] = useState<RequestKind | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedFor, setSubmittedFor] = useState<RequestKind | null>(null);

  async function handleSubmit(kind: RequestKind) {
    setIsSubmitting(true);
    setError(null);

    const response = await fetch(`/api/customer/orders/${orderId}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, message }),
    });

    const data = (await response.json().catch(() => null)) as { id?: string; error?: string } | null;
    if (!response.ok || !data?.id) {
      setError(data?.error ?? 'Something went wrong submitting this. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setSubmittedFor(kind);
    setActive(null);
    setMessage('');
    setIsSubmitting(false);
  }

  return (
    <div className={cn(cardVariants.base, 'flex flex-col gap-4')}>
      <h3 className="text-h6 font-heading font-semibold text-neutral-white">Need something with this order?</h3>

      {submittedFor && (
        <p className="text-body-sm font-body text-success">
          Submitted — our team will follow up by email. You can also reach us directly at {supportEmail}.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.kind}
            type="button"
            onClick={() => {
              setActive(option.kind);
              setSubmittedFor(null);
              setError(null);
            }}
            className={cn(active === option.kind ? buttonVariants.primary : buttonVariants.ghost, spacing.buttonPadding, 'text-caption')}
          >
            {option.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="flex flex-col gap-3">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={OPTIONS.find((o) => o.kind === active)?.placeholder}
            className={cn(inputVariants.base, 'resize-none')}
          />
          {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSubmitting || !message.trim()}
              onClick={() => handleSubmit(active)}
              className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}
            >
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
            <button type="button" onClick={() => setActive(null)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
