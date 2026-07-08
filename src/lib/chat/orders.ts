import type { OrderSummary } from '@/types/chat';

// Placeholder order data until a real orders/checkout backend exists —
// see src/lib/api.ts for the same in-memory-array pattern.
interface OrderRecord extends OrderSummary {
  email: string;
  zip: string;
}

const MOCK_ORDERS: OrderRecord[] = [
  {
    id: 'PTN-48213',
    email: 'jordan.lee@example.com',
    zip: '78701',
    status: 'shipped',
    items: [{ title: 'MacBook Pro 14" M2', price: 1449 }],
    placedDate: '2026-06-28',
    estimatedDelivery: '2026-07-08',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
  },
  {
    id: 'PTN-48310',
    email: 'devon.k@example.com',
    zip: '97201',
    status: 'delivered',
    items: [{ title: 'iPhone 14 Pro', price: 649 }],
    placedDate: '2026-06-20',
    estimatedDelivery: '2026-06-25',
    trackingNumber: '9400111899223197428170',
    carrier: 'USPS',
  },
  {
    id: 'PTN-48455',
    email: 'priya.r@example.com',
    zip: '60601',
    status: 'processing',
    items: [{ title: 'iPad Air (5th Gen)', price: 429 }],
    placedDate: '2026-07-05',
    estimatedDelivery: '2026-07-12',
  },
  {
    id: 'PTN-48501',
    email: 'sam.t@example.com',
    zip: '10001',
    status: 'out-for-delivery',
    items: [
      { title: 'MacBook Air M2', price: 899 },
      { title: 'Apple Magic Keyboard', price: 275 },
    ],
    placedDate: '2026-07-01',
    estimatedDelivery: '2026-07-07',
    trackingNumber: '772819200145',
    carrier: 'FedEx',
  },
];

export async function lookupOrder(orderId: string, secondaryId: string): Promise<OrderSummary | null> {
  const normalizedId = orderId.trim().toUpperCase();
  const normalizedSecondary = secondaryId.trim().toLowerCase();

  const order = MOCK_ORDERS.find(
    (record) =>
      record.id.toUpperCase() === normalizedId &&
      (record.email.toLowerCase() === normalizedSecondary || record.zip === secondaryId.trim())
  );

  if (!order) return null;

  return {
    id: order.id,
    status: order.status,
    items: order.items,
    placedDate: order.placedDate,
    estimatedDelivery: order.estimatedDelivery,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
  };
}

export const ORDER_STATUS_COPY: Record<OrderSummary['status'], string> = {
  processing: "Your order is being prepared for shipment.",
  shipped: "Your order is on its way.",
  'out-for-delivery': "Your order is out for delivery today.",
  delivered: "Your order has been delivered.",
};
