import { NextResponse, type NextRequest } from 'next/server';
import { requireAuthorizeNetConfigured, getHostedPaymentPageToken } from '@/lib/authorizenet/client';
import { getPendingCheckout } from '@/lib/checkout/pendingCheckouts';

export const runtime = 'nodejs';

/**
 * Mints a fresh, short-lived Authorize.net hosted-payment-page token for an
 * already-approved purchase inquiry, on demand. Authorize.net's hosted
 * payment tokens expire after ~15 minutes, but an emailed approval link
 * (src/app/api/admin/purchase-inquiries/[id]/route.ts) can sit unopened for
 * hours — so the durable, emailable part of the link is our own `ref` (the
 * PendingCheckout's key), and the actual Authorize.net token is only
 * requested here, right as the customer opens the page
 * (src/app/(storefront)/checkout/pay/[ref]/page.tsx), so it's always fresh.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;

  const configured = requireAuthorizeNetConfigured();
  if (!configured.ok) return configured.response;

  const pending = getPendingCheckout(ref);
  if (!pending) {
    return NextResponse.json({ error: 'This payment link has expired or was already used. Please contact support for a new one.' }, { status: 410 });
  }

  const origin = new URL(request.url).origin;
  const tokenResult = await getHostedPaymentPageToken({
    amount: pending.subtotal,
    invoiceNumber: `PINQ-${ref.slice(0, 15)}`,
    description: `Premium TechNoir order — ${pending.items.length} item(s)`,
    origin,
  });
  if (!tokenResult.ok) {
    return NextResponse.json({ error: tokenResult.errorText }, { status: 502 });
  }

  return NextResponse.json({ token: tokenResult.token });
}
