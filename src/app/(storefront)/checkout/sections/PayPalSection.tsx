'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Lock } from 'lucide-react';
import type { CheckoutAddress } from '../checkoutTypes';

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

interface Props {
  items: { productId: string; quantity: number }[];
  shippingAddress: CheckoutAddress;
  notes: string;
  phone: string;
  /** Guest checkout only — omitted for logged-in customers, whose identity comes from their session server-side. */
  guestEmail?: string;
  guestName?: string;
}

/**
 * Alternative to the Stripe form in the same Payment step — PayPal's own
 * Orders v2 flow, not routed through Stripe. `createOrder` calls
 * /api/checkout/paypal/order (same gating as the Stripe route) on demand
 * when the buyer clicks the button; `onApprove` calls
 * /api/checkout/paypal/capture, a trusted server-to-server call — the
 * capture route's own response, not this client code, is what decides
 * whether the order actually gets fulfilled.
 */
export default function PayPalSection({ items, shippingAddress, notes, phone, guestEmail, guestName }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (!clientId) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-caption font-body text-neutral-silver">
        <div className="h-px flex-1 bg-neutral-titanium/20" />
        <span>Or pay with PayPal</span>
        <div className="h-px flex-1 bg-neutral-titanium/20" />
      </div>

      {error && (
        <p role="alert" className="text-body-sm font-body text-error">
          {error}
        </p>
      )}

      <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'capture' }}>
        <PayPalButtons
          style={{ layout: 'horizontal', height: 45 }}
          createOrder={async () => {
            setError(null);
            const response = await fetch('/api/checkout/paypal/order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items, shippingAddress, notes, phone, email: guestEmail, name: guestName }),
            });
            const data = (await response.json().catch(() => null)) as { orderId?: string; error?: string } | null;
            if (!response.ok || !data?.orderId) {
              const message = data?.error ?? 'Something went wrong starting PayPal checkout.';
              setError(message);
              throw new Error(message);
            }
            return data.orderId;
          }}
          onApprove={async (data) => {
            const response = await fetch('/api/checkout/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const result = (await response.json().catch(() => null)) as { status?: string; error?: string } | null;
            if (!response.ok || !result?.status) {
              setError(result?.error ?? 'Something went wrong completing your PayPal payment.');
              return;
            }
            router.push('/checkout/success');
          }}
          onError={(err) => {
            console.error('[paypal] Buttons error:', err);
            setError('Something went wrong with PayPal. Please try again, or pay by card above.');
          }}
        />
      </PayPalScriptProvider>

      <p className="flex items-start gap-2 text-caption font-body text-neutral-silver">
        <Lock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>You&apos;ll approve the payment on PayPal&apos;s secure site — a PayPal account isn&apos;t required, you can also pay by card there.</span>
      </p>
    </div>
  );
}
