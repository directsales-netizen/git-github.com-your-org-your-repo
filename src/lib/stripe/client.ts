import { NextResponse } from 'next/server';
import Stripe from 'stripe';

let client: Stripe | null = null;

/**
 * Same "disabled until configured" shape as requireAdminSession()/
 * requireCustomerSession() — every Stripe-touching route calls this first
 * and returns its 503 response as-is if Stripe isn't configured, rather
 * than throwing.
 */
export function requireStripeConfigured(): { stripe: Stripe; response: null } | { stripe: null; response: NextResponse } {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn('[stripe] STRIPE_SECRET_KEY is not set — payments are disabled until configured.');
    return { stripe: null, response: NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 }) };
  }

  if (!client) client = new Stripe(secretKey);
  return { stripe: client, response: null };
}
