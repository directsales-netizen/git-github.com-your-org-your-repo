'use client';

import { useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AlertCircle, Lock } from 'lucide-react';
import { buttonVariants, cn, spacing } from '@/design';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise: Promise<Stripe | null> | null = publishableKey ? loadStripe(publishableKey) : null;

export interface BillingDetails {
  name: string;
  email: string;
  address: { line1: string; line2?: string; city: string; state: string; postal_code: string; country: string };
}

interface Props {
  clientSecret: string | null;
  isLoading: boolean;
  error: string | null;
  billingDetails: BillingDetails;
  totalLabel: string;
}

/**
 * Renders Stripe's Express Checkout Element (Apple Pay / Google Pay / PayPal
 * / Link one-tap) above the Payment Element (card fields), the layout Stripe
 * itself recommends for a premium single-page checkout. `clientSecret` comes
 * from a PaymentIntent created server-side in
 * src/app/api/checkout/session/route.ts once Shipping + Billing are
 * complete — card data never reaches this app, only Stripe's iframe.
 */
export default function PaymentSection({ clientSecret, isLoading, error, billingDetails, totalLabel }: Props) {
  if (!publishableKey || !stripePromise) {
    return (
      <p className="flex items-center gap-2 text-body-sm font-body text-neutral-silver">
        <AlertCircle size={16} className="shrink-0 text-warning" aria-hidden="true" />
        Payments are not configured yet.
      </p>
    );
  }

  if (error) {
    return <p role="alert" className="text-body-sm font-body text-error">{error}</p>;
  }

  if (isLoading || !clientSecret) {
    return (
      <div aria-live="polite" aria-busy="true" className="flex flex-col gap-3">
        <div className="h-11 animate-pulse rounded-md bg-bg-tertiary" />
        <div className="h-32 animate-pulse rounded-md bg-bg-tertiary" />
        <p className="text-body-sm font-body text-neutral-silver">Preparing secure payment…</p>
      </div>
    );
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorBackground: '#0D1117',
      colorText: '#FFFFFF',
      colorTextSecondary: '#C5CBD3',
      colorPrimary: '#2FE7F2',
      colorDanger: '#EF4444',
      fontFamily: '"Inter", sans-serif',
      borderRadius: '8px',
      spacingUnit: '4px',
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm billingDetails={billingDetails} totalLabel={totalLabel} />
    </Elements>
  );
}

function PaymentForm({ billingDetails, totalLabel }: { billingDetails: BillingDetails; totalLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function confirm() {
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: { billing_details: billingDetails },
      },
    });

    // Only reached on immediate failure (declined card, validation, etc.) —
    // a successful confirmation navigates the browser away to return_url and
    // this component unmounts. Real fulfillment only ever happens in the
    // signature-verified webhook (src/app/api/webhooks/stripe/route.ts),
    // never from this client-side result.
    if (error) {
      setSubmitError(error.message ?? 'Payment failed. Please check your details and try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ExpressCheckoutElement onConfirm={confirm} />

      <div className="flex items-center gap-3 text-caption font-body text-neutral-silver">
        <div className="h-px flex-1 bg-neutral-titanium/20" />
        <span>Or pay with card</span>
        <div className="h-px flex-1 bg-neutral-titanium/20" />
      </div>

      <PaymentElement options={{ fields: { billingDetails: { name: 'never', email: 'never', address: 'never' } } }} />

      <p className="flex items-start gap-2 text-caption font-body text-neutral-silver">
        <Lock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>Your card details are encrypted and sent directly to Stripe — Premium TechNoir never sees or stores your card number.</span>
      </p>

      {submitError && (
        <p role="alert" className="text-body-sm font-body text-error">
          {submitError}
        </p>
      )}

      <button
        type="button"
        disabled={isSubmitting}
        onClick={confirm}
        className={cn(buttonVariants.primary, spacing.buttonPadding, 'flex items-center justify-center gap-2 text-body-md')}
      >
        <Lock size={16} aria-hidden="true" />
        {isSubmitting ? 'Processing…' : `Pay ${totalLabel} securely`}
      </button>
      <p className="text-center text-caption font-body text-neutral-silver">You&apos;ll only be charged once, right when you click Pay.</p>
    </div>
  );
}
