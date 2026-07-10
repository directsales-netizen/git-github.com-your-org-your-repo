import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getOrderById, cancelOrder } from '@/lib/chat/orders';
import { issueRefund } from '@/lib/admin/refunds';

export const runtime = 'nodejs';

/** Cancel is only offered for orders still 'processing' (not yet shipped) — issues a full refund first via the same provider-aware helper the Orders/Fraud-reject actions use, then marks the order cancelled. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;

  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.status !== 'processing') {
    return NextResponse.json({ error: `Only orders still processing can be cancelled (this one is ${order.status}).` }, { status: 409 });
  }

  const refundResult = await issueRefund(order);
  // A 409 here just means there's nothing left to refund (no payment on
  // record, or already fully refunded) — safe to still cancel. Any other
  // failure means money wasn't actually returned, so don't mark it cancelled.
  if (!refundResult.ok && refundResult.status !== 409) {
    return NextResponse.json({ error: refundResult.error }, { status: refundResult.status });
  }

  const result = await cancelOrder(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  await logActivity({
    actor: session.sub,
    action: 'cancel',
    target: `order ${id}`,
    detail: refundResult.ok ? `Refunded $${(refundResult.amountCents / 100).toFixed(2)}` : 'No refund issued (nothing outstanding).',
  });

  return NextResponse.json(result.order);
}
