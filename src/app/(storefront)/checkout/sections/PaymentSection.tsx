'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { buttonVariants, cn, spacing } from '@/design';

const clientKey = process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY;
const apiLoginId = process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID;
const isProduction = process.env.NEXT_PUBLIC_AUTHORIZENET_ENVIRONMENT === 'production';
const ACCEPT_JS_SRC = isProduction ? 'https://js.authorize.net/v1/Accept.js' : 'https://jstest.authorize.net/v1/Accept.js';

export interface BillingDetails {
  name: string;
  email: string;
  address: { line1: string; line2?: string; city: string; state: string; postal_code: string; country: string };
}

interface Props {
  isLoading: boolean;
  error: string | null;
  billingDetails: BillingDetails;
  totalLabel: string;
  onSubmit: (opaqueData: { dataDescriptor: string; dataValue: string }) => void | Promise<void>;
}

// Authorize.net's own Accept.js global — loaded via the <script> tag below.
// Card data goes straight from this form to Authorize.net's servers inside
// dispatchData(); the opaque dataDescriptor/dataValue it returns is the only
// payment data that ever reaches our own backend (see
// src/app/api/checkout/authorizenet/route.ts). Never give these inputs a
// `name` attribute, which would let a browser extension or the surrounding
// <form> submit the raw PAN anywhere.
declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: { cardNumber: string; month: string; year: string; cardCode: string; zip?: string };
        },
        responseHandler: (response: AcceptJsResponse) => void
      ) => void;
    };
  }
}

interface AcceptJsResponse {
  messages: { resultCode: 'Ok' | 'Error'; message: { code: string; text: string }[] };
  opaqueData?: { dataDescriptor: string; dataValue: string };
}

/**
 * Renders a plain, uncontrolled card form and tokenizes it via Authorize.net's
 * Accept.js before this component's parent ever sees a payment method —
 * the browser hands the PAN/CVV straight to Authorize.net's script and gets
 * back an opaque dataDescriptor/dataValue pair, which is all that's POSTed to
 * our own /api/checkout/authorizenet route. This keeps the storefront out of
 * full PCI SAQ-D scope (SAQ A-EP territory instead), the same reasoning that
 * led to Stripe's PaymentElement/Elements.js approach before it.
 */
export default function PaymentSection({ isLoading, error, totalLabel, onSubmit }: Props) {
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!clientKey || !apiLoginId) return;
    if (window.Accept) {
      // Already loaded by an earlier mount of this component — defer the
      // state update to a microtask so it's not synchronous within the
      // effect body itself.
      queueMicrotask(() => setScriptReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = ACCEPT_JS_SRC;
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setScriptError(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!clientKey || !apiLoginId) {
    return (
      <p className="flex items-center gap-2 text-body-sm font-body text-neutral-silver">
        <AlertCircle size={16} className="shrink-0 text-warning" aria-hidden="true" />
        Payments are not configured yet.
      </p>
    );
  }

  if (scriptError) {
    return (
      <p role="alert" className="flex items-center gap-2 text-body-sm font-body text-error">
        <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
        Could not load the secure payment form. Please refresh and try again.
      </p>
    );
  }

  if (error) {
    return <p role="alert" className="text-body-sm font-body text-error">{error}</p>;
  }

  if (!scriptReady) {
    return (
      <div aria-live="polite" aria-busy="true" className="flex flex-col gap-3">
        <div className="h-11 animate-pulse rounded-md bg-bg-tertiary" />
        <div className="h-32 animate-pulse rounded-md bg-bg-tertiary" />
        <p className="text-body-sm font-body text-neutral-silver">Preparing secure payment…</p>
      </div>
    );
  }

  return <CardForm isLoading={isLoading} totalLabel={totalLabel} onSubmit={onSubmit} />;
}

function CardForm({ isLoading, totalLabel, onSubmit }: Pick<Props, 'isLoading' | 'totalLabel' | 'onSubmit'>) {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function tokenizeAndSubmit() {
    if (!window.Accept || !clientKey || !apiLoginId) return;

    const cardNumber = cardNumberRef.current?.value.replace(/\s+/g, '') ?? '';
    const month = monthRef.current?.value.trim() ?? '';
    const year = yearRef.current?.value.trim() ?? '';
    const cardCode = cvvRef.current?.value.trim() ?? '';
    const zip = zipRef.current?.value.trim() ?? '';

    if (cardNumber.length < 13 || month.length !== 2 || year.length !== 4 || cardCode.length < 3) {
      setSubmitError('Please check your card number, expiration date, and security code.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    window.Accept.dispatchData(
      { authData: { clientKey, apiLoginID: apiLoginId }, cardData: { cardNumber, month, year, cardCode, zip } },
      async (response) => {
        if (response.messages.resultCode !== 'Ok' || !response.opaqueData) {
          setSubmitError(response.messages.message[0]?.text ?? 'Could not process your card. Please check your details and try again.');
          setIsSubmitting(false);
          return;
        }

        // Clear the raw card fields immediately — they've done their job and
        // nothing past this point should ever read them again.
        if (cardNumberRef.current) cardNumberRef.current.value = '';
        if (cvvRef.current) cvvRef.current.value = '';

        try {
          await onSubmit(response.opaqueData);
        } catch {
          setSubmitError('Something went wrong submitting your order. Please try again.');
          setIsSubmitting(false);
        }
      }
    );
  }

  const busy = isSubmitting || isLoading;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        tokenizeAndSubmit();
      }}
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-body-sm font-body text-neutral-light-gray">
          Card number
          <input
            ref={cardNumberRef}
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4111 1111 1111 1111"
            maxLength={23}
            disabled={busy}
            className="rounded-md border border-neutral-titanium/30 bg-bg-tertiary px-4 py-2.5 text-body-md text-neutral-white outline-none focus:border-accent-primary"
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5 text-body-sm font-body text-neutral-light-gray">
            MM
            <input
              ref={monthRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp-month"
              placeholder="MM"
              maxLength={2}
              disabled={busy}
              className="rounded-md border border-neutral-titanium/30 bg-bg-tertiary px-4 py-2.5 text-body-md text-neutral-white outline-none focus:border-accent-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-body-sm font-body text-neutral-light-gray">
            YYYY
            <input
              ref={yearRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp-year"
              placeholder="YYYY"
              maxLength={4}
              disabled={busy}
              className="rounded-md border border-neutral-titanium/30 bg-bg-tertiary px-4 py-2.5 text-body-md text-neutral-white outline-none focus:border-accent-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-body-sm font-body text-neutral-light-gray">
            CVV
            <input
              ref={cvvRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              disabled={busy}
              className="rounded-md border border-neutral-titanium/30 bg-bg-tertiary px-4 py-2.5 text-body-md text-neutral-white outline-none focus:border-accent-primary"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-body-sm font-body text-neutral-light-gray">
          Billing ZIP
          <input
            ref={zipRef}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="94105"
            maxLength={10}
            disabled={busy}
            className="rounded-md border border-neutral-titanium/30 bg-bg-tertiary px-4 py-2.5 text-body-md text-neutral-white outline-none focus:border-accent-primary"
          />
        </label>
      </div>

      <p className="flex items-start gap-2 text-caption font-body text-neutral-silver">
        <Lock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>Your card details are sent directly to Authorize.net — Premium TechNoir never sees or stores your card number.</span>
      </p>

      {submitError && (
        <p role="alert" className="text-body-sm font-body text-error">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className={cn(buttonVariants.primary, spacing.buttonPadding, 'flex items-center justify-center gap-2 text-body-md')}
      >
        <Lock size={16} aria-hidden="true" />
        {busy ? 'Processing…' : `Pay ${totalLabel} securely`}
      </button>
      <p className="text-center text-caption font-body text-neutral-silver">You&apos;ll only be charged once, right when you click Pay.</p>
    </form>
  );
}
