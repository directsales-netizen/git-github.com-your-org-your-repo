import { NextResponse, type NextRequest } from 'next/server';
import { getBusinessSettings } from '@/lib/admin/settings';
import { getCustomerSession } from '@/lib/customer/getSession';
import { findCustomerAccountByEmail } from '@/lib/customer/store';
import { validateCartItems, type ValidatedCartItem } from '@/lib/checkout/validateCartItems';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { isSameOriginRequest } from '@/lib/security/sameOrigin';
import { isIpBlocked } from '@/lib/fraud/blocklists';
import { recordAttempt } from '@/lib/fraud/velocity';
import { fingerprintCheckout, recordCheckoutFingerprint } from '@/lib/fraud/duplicateDetection';
import type { CustomerAccount } from '@/types/customer';

const checkoutLimiter = createRateLimiter(10, 10 * 60 * 1000);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CheckoutRequestBody {
  // Deliberately no `price` field anywhere in this shape — there is nothing
  // for this route to trust or ignore from the client about cost.
  items?: { productId: string; quantity: number }[];
  email?: string;
  /** Guest checkout only — logged-in name comes from the account record, never the client. */
  name?: string;
  shippingAddress?: { line1: string; line2?: string; city: string; state: string; zip: string };
  notes?: string;
  phone?: string;
}

export type PrepareCheckoutResult =
  | {
      ok: true;
      email: string;
      name: string;
      /** null for guest checkout — see settings.requireAccountForCheckout. */
      account: CustomerAccount | null;
      items: ValidatedCartItem[];
      subtotal: number;
      notes?: string;
      phone?: string;
      shippingAddress: NonNullable<CheckoutRequestBody['shippingAddress']>;
      clientIp: string;
    }
  | { ok: false; response: NextResponse };

/**
 * Shared gating for every direct-checkout payment route (Stripe PaymentIntent
 * creation, PayPal Order creation) — rate limit, cart/address presence,
 * orders-paused/inquiry-only-mode settings, identity resolution (logged-in
 * account or guest — gated by settings.requireAccountForCheckout, see
 * resolveIdentity below), and the server-side price/stock re-validation
 * that is the entire tamper-prevention mechanism for both providers.
 * Extracted so a second (PayPal) payment route doesn't re-implement this
 * ~40-line chain.
 */
export async function prepareDirectCheckout(request: NextRequest, body: CheckoutRequestBody): Promise<PrepareCheckoutResult> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (checkoutLimiter.isRateLimited(ip)) {
    return { ok: false, response: NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 }) };
  }

  // Defense-in-depth on top of SameSite=Lax session cookies (which already
  // block cross-site requests from ever carrying the session) — rejects
  // any request whose own Origin/Referer points somewhere else entirely.
  if (!isSameOriginRequest(request)) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 }) };
  }

  // The one and only pre-payment hard block — a deliberate admin decision
  // (an IP already added to the blocklist), never an algorithmic reject.
  // Every other fraud signal only ever flags or holds post-payment (see
  // src/lib/fraud/riskEngine.ts).
  if (await isIpBlocked(ip)) {
    return { ok: false, response: NextResponse.json({ error: 'Unable to process checkout from this connection.' }, { status: 403 }) };
  }

  const items = body.items ?? [];
  if (items.length === 0) {
    return { ok: false, response: NextResponse.json({ error: 'Cart is empty.' }, { status: 400 }) };
  }
  if (!body.shippingAddress?.line1 || !body.shippingAddress.city || !body.shippingAddress.state || !body.shippingAddress.zip) {
    return { ok: false, response: NextResponse.json({ error: 'A complete shipping address is required.' }, { status: 400 }) };
  }

  const settings = await getBusinessSettings();
  if (settings.ordersPaused) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Online ordering is temporarily paused. Please email support or use the AI assistant to place an order.' }, { status: 503 }),
    };
  }
  if (settings.inquiryOnlyMode) {
    return { ok: false, response: NextResponse.json({ error: 'Direct checkout is disabled. Please submit a purchase inquiry instead.' }, { status: 503 }) };
  }

  const identity = await resolveIdentity(body, settings.requireAccountForCheckout);
  if (!identity.ok) return identity;
  const { email, name, account } = identity;

  // --- The entire tamper-prevention mechanism lives here: every
  // price/title/stock check comes from a fresh server-side catalog lookup,
  // never from anything the client sent. ---
  const validation = await validateCartItems(items);
  if (!validation.ok) {
    return { ok: false, response: NextResponse.json({ error: validation.error }, { status: validation.status }) };
  }

  // Recorded on every attempt (not just successful payments) so velocity
  // reflects retries/abandonment too — read back later at fulfillment time
  // by riskEngine.assessRisk().
  recordAttempt(`email:${email}`);
  recordAttempt(`ip:${ip}`);
  const fingerprint = fingerprintCheckout(email, validation.subtotal, validation.items.map((item) => item.productId));
  recordCheckoutFingerprint(fingerprint);

  return {
    ok: true,
    email,
    name,
    account,
    items: validation.items,
    subtotal: validation.subtotal,
    notes: body.notes?.trim().slice(0, 500) || undefined,
    phone: body.phone?.trim().slice(0, 30) || undefined,
    shippingAddress: body.shippingAddress,
    clientIp: ip,
  };
}

type IdentityResult =
  | { ok: true; email: string; name: string; account: CustomerAccount | null }
  | { ok: false; response: NextResponse };

/**
 * Logged-in customers always use their account (email verification still
 * required — the one identity guarantee this app can make). Otherwise,
 * guest checkout is allowed unless an admin has turned
 * settings.requireAccountForCheckout on, in which case a session is
 * mandatory. Guest identity comes straight from the request body — there is
 * no account record to look up, so no email-verification step applies to it.
 */
async function resolveIdentity(body: CheckoutRequestBody, requireAccount: boolean): Promise<IdentityResult> {
  const customerSession = await getCustomerSession();
  if (customerSession) {
    const email = customerSession.sub;
    const account = await findCustomerAccountByEmail(email);
    if (!account?.emailVerified) {
      return { ok: false, response: NextResponse.json({ error: 'Please verify your email before completing checkout.' }, { status: 403 }) };
    }
    return { ok: true, email, name: account.name, account };
  }

  if (requireAccount) {
    return { ok: false, response: NextResponse.json({ error: 'An account is required to check out.' }, { status: 401 }) };
  }

  const guestEmail = body.email?.trim().toLowerCase();
  const guestName = body.name?.trim();
  if (!guestEmail || !EMAIL_PATTERN.test(guestEmail)) {
    return { ok: false, response: NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 }) };
  }
  if (!guestName) {
    return { ok: false, response: NextResponse.json({ error: 'Your name is required.' }, { status: 400 }) };
  }

  return { ok: true, email: guestEmail, name: guestName, account: null };
}
