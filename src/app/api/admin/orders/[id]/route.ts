import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateOrderStatus } from '@/lib/chat/orders';
import type { OrderSummary } from '@/types/chat';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const { status } = (await request.json()) as { status: OrderSummary['status'] };
  const order = await updateOrderStatus(id, status);
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'update status', target: `order ${id}`, detail: status });
  return NextResponse.json(order);
}
