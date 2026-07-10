import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getAllOrders, setReviewStatus } from '@/lib/chat/orders';
import { issueRefund } from '@/lib/admin/refunds';

export const runtime = 'nodejs';

/**
 * Rejects a held (extreme-risk) order — money was already captured (see
 * the "capture now, gate fulfillment" design in fulfillPendingCheckout.ts),
 * so "reject" means a full refund, never fulfillment. This is the one place
 * this fraud system's flags turn into a customer-facing outcome, and even
 * then it's an admin's explicit decision, not an automatic reject.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const { id } = await params;

  const orders = await getAllOrders();
  const order = orders.find((o) => o.id === id && o.reviewStatus === 'held');
  if (!order) {
    return NextResponse.json({ error: 'No held order found with that id.' }, { status: 404 });
  }

  const result = await issueRefund(order);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const updated = await setReviewStatus(id, 'blocked');

  await logActivity({
    actor: session.sub,
    action: 'fraud-reject',
    target: `order ${id}`,
    detail: `Refunded $${(result.amountCents / 100).toFixed(2)} — fulfillment withheld.`,
  });

  return NextResponse.json(updated);
}
