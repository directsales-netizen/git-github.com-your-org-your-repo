import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getAllOrders } from '@/lib/chat/orders';
import { issueRefund } from '@/lib/admin/refunds';

export const runtime = 'nodejs';

/** Full or partial refund, provider-aware — same admin bar as the order-status route. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;

  let body: { amountCents?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const orders = await getAllOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const result = await issueRefund(order, body.amountCents);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await logActivity({
    actor: session.sub,
    action: 'refund',
    target: `order ${id}`,
    detail: `${order.paymentProvider} — $${(result.amountCents / 100).toFixed(2)}`,
  });

  return NextResponse.json(result.order);
}
