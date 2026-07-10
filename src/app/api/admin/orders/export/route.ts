import { NextResponse } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { getAllOrders } from '@/lib/chat/orders';
import { getPaymentStatus } from '@/lib/admin/orderLabels';
import { getAllDisputes } from '@/lib/fraud/disputes';

export const runtime = 'nodejs';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const COLUMNS = [
  'Order ID',
  'Email',
  'Placed Date',
  'Items',
  'Total',
  'Payment Status',
  'Refunded',
  'Shipment Status',
  'Return Status',
  'Warranty Status',
  'Provider',
  'Tracking Number',
  'Carrier',
] as const;

export async function GET() {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const [orders, disputes] = await Promise.all([getAllOrders(), getAllDisputes()]);

  const rows = orders.map((order) => {
    const total = order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
    return [
      order.id,
      order.email,
      order.placedDate,
      order.items.map((item) => `${item.title} x${item.quantity ?? 1}`).join('; '),
      total.toFixed(2),
      getPaymentStatus(order, disputes),
      ((order.refundedAmount ?? 0) / 100).toFixed(2),
      order.status,
      order.returnStatus,
      order.warrantyStatus,
      order.paymentProvider ?? '',
      order.trackingNumber ?? '',
      order.carrier ?? '',
    ];
  });

  const csv = [COLUMNS.join(','), ...rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
