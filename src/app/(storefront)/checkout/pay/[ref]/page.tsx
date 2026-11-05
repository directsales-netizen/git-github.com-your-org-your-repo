'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { spacing, cn } from '@/design';

// Mirrors src/lib/authorizenet/client.ts#hostedPaymentPageFormUrl() — kept as
// a separate, client-safe copy because that module imports 'next/server' and
// can't be bundled into this client component.
const isProduction = process.env.NEXT_PUBLIC_AUTHORIZENET_ENVIRONMENT === 'production';
const HOSTED_PAYMENT_FORM_URL = isProduction ? 'https://accept.authorize.net/payment/payment' : 'https://test.authorize.net/payment/payment';

interface TransactResponseMessage {
  action: 'transactResponse' | 'successfulSave' | 'resizeWindow' | 'cancel';
  response?: { transId?: string; responseCode?: string; messages?: { resultCode?: string } };
}

/**
 * Renders Authorize.net's hosted payment page inside an iframe. `ref` is our
 * own durable, emailable reference (the PendingCheckout's key, stashed at
 * approval time by src/app/api/admin/purchase-inquiries/[id]/route.ts) — it
 * never expires on its own, unlike an Authorize.net hosted-payment token
 * (~15 minutes), so this page fetches a *fresh* token right before
 * submitting the form, rather than relying on one baked into the emailed
 * link. The form then POSTs that token to Authorize.net's own endpoint,
 * targeting a named iframe — the customer's card details go straight to
 * Authorize.net from inside that iframe, never through this app. When
 * Authorize.net's page finishes, its IFrame Communicator
 * (../communicator/page.tsx) relays a status message up via postMessage;
 * this page uses that only as a signal to ask our own backend to verify and
 * fulfill (src/app/api/checkout/pay/[ref]/complete), never as proof of
 * payment on its own.
 */
export default function HostedPaymentPage() {
  const params = useParams<{ ref: string }>();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'completing' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/checkout/pay/${params.ref}/token`)
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as { token?: string; error?: string } | null;
        if (cancelled) return;
        if (!response.ok || !data?.token) {
          setStatus('error');
          setError(data?.error ?? 'This payment link could not be loaded. Please contact support.');
          return;
        }
        setToken(data.token);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
          setError('This payment link could not be loaded. Please check your connection and try again.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params.ref]);

  useEffect(() => {
    if (status === 'ready' && token) formRef.current?.submit();
  }, [status, token]);

  const handleMessage = useCallback(
    (event: MessageEvent<string>) => {
      let parsed: TransactResponseMessage;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return; // not one of ours
      }

      if (parsed.action !== 'transactResponse') return;

      const transId = parsed.response?.transId;
      if (!transId) {
        setStatus('error');
        setError('Payment was not completed. Please try again or contact support.');
        return;
      }

      setStatus('completing');
      fetch(`/api/checkout/pay/${params.ref}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transId }),
      })
        .then(async (response) => {
          const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
          if (!response.ok || !data?.ok) {
            setStatus('error');
            setError(data?.error ?? 'We could not confirm your payment. Please contact support before trying again.');
            return;
          }
          router.push('/checkout/success');
        })
        .catch(() => {
          setStatus('error');
          setError('We could not confirm your payment. Please contact support before trying again.');
        });
    },
    [params.ref, router]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-2xl')}>
      <h1 className="flex items-center gap-2 text-h4 font-heading font-bold text-neutral-white">
        <Lock size={20} aria-hidden="true" />
        Secure Payment
      </h1>

      {status === 'error' ? (
        <p role="alert" className="mt-6 text-body-sm font-body text-error">
          {error}
        </p>
      ) : (
        <>
          {status === 'loading' && (
            <p aria-live="polite" className="mt-4 text-body-sm font-body text-neutral-silver">
              Preparing your secure payment form…
            </p>
          )}
          {status === 'completing' && (
            <p aria-live="polite" className="mt-4 text-body-sm font-body text-neutral-silver">
              Confirming your payment…
            </p>
          )}
          <form ref={formRef} method="post" action={HOSTED_PAYMENT_FORM_URL} target="authorizeNetHostedFrame" className="hidden">
            <input type="hidden" name="token" value={token ?? ''} />
          </form>
          <iframe
            name="authorizeNetHostedFrame"
            title="Secure payment form"
            className="mt-6 h-[640px] w-full rounded-md border border-neutral-titanium/20 bg-white"
          />
        </>
      )}
    </section>
  );
}
