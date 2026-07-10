import { NextResponse } from 'next/server';
import { globalBox } from '@/lib/globalStore';

/**
 * Same "disabled until configured" shape as requireStripeConfigured() —
 * every PayPal-touching route calls this first and returns its 503 response
 * as-is if PayPal isn't configured, rather than throwing.
 */
export function requirePayPalConfigured(): { ok: true } | { ok: false; response: NextResponse } {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.warn('[paypal] PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET not set — PayPal checkout disabled until configured.');
    return { ok: false, response: NextResponse.json({ error: 'PayPal is not configured yet.' }, { status: 503 }) };
  }
  return { ok: true };
}

/**
 * Unlike Stripe (where test/live is encoded in the key prefix), PayPal uses
 * the same client id/secret shape for both — the environment is selected by
 * which API host you call, hence this explicit flag.
 */
export function paypalApiBase(): string {
  return process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export class PayPalApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'PayPalApiError';
    this.status = status;
    this.details = details;
  }
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const tokenBox = globalBox('paypalAccessToken', (): CachedToken | null => null);

async function fetchNewAccessToken(): Promise<string> {
  const basicAuth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');

  let lastError: unknown;
  // One retry with a short backoff — enough to ride out a transient network
  // blip on the token endpoint without building a general job-retry system
  // this app has no other basis for.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
        method: 'POST',
        headers: { Authorization: `Basic ${basicAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
      });
      if (!response.ok) throw new PayPalApiError(`PayPal OAuth token request failed (${response.status})`, response.status);

      const data = (await response.json()) as { access_token: string; expires_in: number };
      // Expire 60s early so a token never gets used right at the edge of validity.
      tokenBox.current = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 - 60_000 };
      return data.access_token;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('PayPal OAuth token request failed.');
}

async function getAccessToken(): Promise<string> {
  const cached = tokenBox.current;
  if (cached && cached.expiresAt > Date.now()) return cached.accessToken;
  return fetchNewAccessToken();
}

/**
 * Shared request helper for every PayPal API call — centralizes auth,
 * base-URL selection, and error shaping so route handlers just catch
 * PayPalApiError and return a clean message instead of a raw fetch error.
 */
export async function paypalFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${paypalApiBase()}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error_description || `PayPal API error (${response.status})`;
    throw new PayPalApiError(message, response.status, data);
  }

  return data as T;
}

export interface PayPalWebhookHeaders {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
}

/**
 * PayPal verifies webhook authenticity via a server-to-server API call
 * (unlike Stripe's locally-computed HMAC) — this posts the raw signature
 * headers plus the parsed event body back to PayPal and trusts its verdict.
 */
export async function verifyWebhookSignature(headers: PayPalWebhookHeaders, webhookEvent: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const result = await paypalFetch<{ verification_status: string }>('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      auth_algo: headers.authAlgo,
      cert_url: headers.certUrl,
      transmission_id: headers.transmissionId,
      transmission_sig: headers.transmissionSig,
      transmission_time: headers.transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  });

  return result.verification_status === 'SUCCESS';
}
