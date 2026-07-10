import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getHeldOrder, setReviewStatus } from '@/lib/chat/orders';
import { runFulfillmentSideEffects } from '@/lib/checkout/fulfillPendingCheckout';

export const runtime = 'nodejs';

/** Releases a held (extreme-risk) order — runs the stock/rewards/CRM/email side effects that were withheld pending review. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const { id } = await params;

  const order = await getHeldOrder(id);
  if (!order) {
    return NextResponse.json({ error: 'No held order found with that id.' }, { status: 404 });
  }

  await runFulfillmentSideEffects({
    id: order.id,
    email: order.email,
    name: order.name ?? order.email,
    items: order.items.map((item) => ({ title: item.title, price: item.price, quantity: item.quantity ?? 1, productId: item.productId ?? '' })),
    sourceInquiryId: order.sourceInquiryId,
  });

  const updated = await setReviewStatus(id, 'cleared');

  await logActivity({
    actor: session.sub,
    action: 'fraud-approve',
    target: `order ${id}`,
    detail: 'Fulfillment released after manual review.',
  });

  return NextResponse.json(updated);
}
