import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { shipOrder, getOrderById } from '@/lib/chat/orders';
import { sendShipmentNotificationEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;

  let body: { trackingNumber?: string; carrier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!body.trackingNumber?.trim() || !body.carrier?.trim()) {
    return NextResponse.json({ error: 'Tracking number and carrier are required.' }, { status: 400 });
  }

  const result = await shipOrder(id, { trackingNumber: body.trackingNumber.trim(), carrier: body.carrier.trim() });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const order = await getOrderById(id);
  if (order) void sendShipmentNotificationEmail(order.email, id, body.trackingNumber.trim(), body.carrier.trim());

  await logActivity({ actor: session.sub, action: 'ship', target: `order ${id}`, detail: `${body.carrier.trim()} — ${body.trackingNumber.trim()}` });
  return NextResponse.json(result.order);
}
