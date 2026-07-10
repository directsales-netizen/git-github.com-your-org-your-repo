import type { OrderSummary } from '@/types/chat';
import type { AdminOrderSummary, PaymentProvider, ShippingAddress, ReturnStatus, WarrantyStatus } from '@/types/admin';
import type { ReviewStatus, RiskLevel } from '@/types/fraud';
import { globalSingleton, globalBox } from '@/lib/globalStore';
// Re-exported for existing importers (e.g. the CSV export route) — canonical implementation now lives alongside the other order label/derivation helpers.
export { getPaymentStatus } from '@/lib/admin/orderLabels';

// Placeholder order data until a real orders/checkout backend exists —
// see src/lib/api.ts for the same in-memory-array pattern. Stored via
// globalSingleton (see src/lib/globalStore.ts) so admin API route writes
// are visible to page reads within the same server process.
export interface OrderRecord extends OrderSummary {
  email: string;
  /** Undefined for the seeded placeholder rows below — real orders always carry it (needed to re-run rewards/CRM if fulfillment is deferred behind a fraud hold). */
  name?: string;
  shippingAddress: ShippingAddress;
  /** Which payment rail fulfilled this order, and the id a refund is issued against — undefined for the seeded placeholder rows below. */
  paymentProvider?: PaymentProvider;
  providerReference?: string;
  refundedAmount?: number;
  reviewStatus: ReviewStatus;
  riskScore?: number;
  riskLevel?: RiskLevel;
  riskReasons?: string[];
  clientIp?: string;
  /** Set only when this order originated from an approved purchase inquiry — converted only once fulfillment actually runs (immediately, or later via the fraud-hold approval). */
  sourceInquiryId?: string;
  /** Captured verbatim from the checkout Order Notes field — customer-authored, read-only from the admin side. */
  customerNotes?: string;
  /** Admin-only, never shown to the customer. */
  internalNotes?: string;
  returnStatus: ReturnStatus;
  warrantyStatus: WarrantyStatus;
}

function toAdminSummary(order: OrderRecord): AdminOrderSummary {
  return {
    id: order.id,
    email: order.email,
    status: order.status,
    items: order.items,
    placedDate: order.placedDate,
    estimatedDelivery: order.estimatedDelivery,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    shippingAddress: order.shippingAddress,
    paymentProvider: order.paymentProvider,
    providerReference: order.providerReference,
    refundedAmount: order.refundedAmount,
    reviewStatus: order.reviewStatus,
    riskScore: order.riskScore,
    riskLevel: order.riskLevel,
    riskReasons: order.riskReasons,
    clientIp: order.clientIp,
    customerNotes: order.customerNotes,
    internalNotes: order.internalNotes,
    returnStatus: order.returnStatus,
    warrantyStatus: order.warrantyStatus,
  };
}

const SEED_ORDERS: Omit<OrderRecord, 'reviewStatus' | 'returnStatus' | 'warrantyStatus'>[] = [
  {
    id: 'PTN-48213',
    email: 'jordan.lee@example.com',
    shippingAddress: { line1: '100 Congress Ave', city: 'Austin', state: 'TX', zip: '78701' },
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
    shippingAddress: { line1: '200 SW Market St', city: 'Portland', state: 'OR', zip: '97201' },
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
    shippingAddress: { line1: '300 N Michigan Ave', city: 'Chicago', state: 'IL', zip: '60601' },
    status: 'processing',
    items: [{ title: 'iPad Air (5th Gen)', price: 429 }],
    placedDate: '2026-07-05',
    estimatedDelivery: '2026-07-12',
  },
  {
    id: 'PTN-48501',
    email: 'sam.t@example.com',
    shippingAddress: { line1: '400 5th Ave', city: 'New York', state: 'NY', zip: '10001' },
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

const MOCK_ORDERS = globalSingleton('orders', (): OrderRecord[] =>
  SEED_ORDERS.map((order) => ({ ...order, reviewStatus: 'none', returnStatus: 'none', warrantyStatus: 'none' }))
);

const nextOrderIdBox = globalBox('nextRealOrderId', () => 48600);

/** Called only from a verified, paid-payment webhook/capture handler (Stripe or PayPal) — never from a client-side redirect. */
export async function createOrder(input: {
  email: string;
  name?: string;
  shippingAddress: ShippingAddress;
  items: { title: string; price: number; quantity: number; productId: string }[];
  paymentProvider?: PaymentProvider;
  providerReference?: string;
  reviewStatus?: ReviewStatus;
  riskScore?: number;
  riskLevel?: RiskLevel;
  riskReasons?: string[];
  clientIp?: string;
  sourceInquiryId?: string;
  customerNotes?: string;
}): Promise<OrderSummary> {
  const placed = new Date();
  const estimated = new Date(placed);
  estimated.setDate(estimated.getDate() + 7);

  const record: OrderRecord = {
    id: `PTN-${nextOrderIdBox.current++}`,
    email: input.email,
    name: input.name,
    shippingAddress: input.shippingAddress,
    status: 'processing',
    items: input.items,
    placedDate: placed.toISOString().slice(0, 10),
    estimatedDelivery: estimated.toISOString().slice(0, 10),
    paymentProvider: input.paymentProvider,
    providerReference: input.providerReference,
    reviewStatus: input.reviewStatus ?? 'none',
    riskScore: input.riskScore,
    riskLevel: input.riskLevel,
    riskReasons: input.riskReasons,
    clientIp: input.clientIp,
    sourceInquiryId: input.sourceInquiryId,
    customerNotes: input.customerNotes,
    returnStatus: 'none',
    warrantyStatus: 'none',
  };
  MOCK_ORDERS.push(record);

  return {
    id: record.id,
    status: record.status,
    items: record.items,
    placedDate: record.placedDate,
    estimatedDelivery: record.estimatedDelivery,
  };
}

export async function lookupOrder(orderId: string, secondaryId: string): Promise<OrderSummary | null> {
  const normalizedId = orderId.trim().toUpperCase();
  const normalizedSecondary = secondaryId.trim().toLowerCase();

  const order = MOCK_ORDERS.find(
    (record) =>
      record.id.toUpperCase() === normalizedId &&
      (record.email.toLowerCase() === normalizedSecondary || record.shippingAddress.zip === secondaryId.trim())
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

export async function getOrdersByEmail(email: string): Promise<OrderSummary[]> {
  const normalized = email.trim().toLowerCase();
  return MOCK_ORDERS.filter((record) => record.email.toLowerCase() === normalized)
    .map((order) => ({
      id: order.id,
      status: order.status,
      items: order.items,
      placedDate: order.placedDate,
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
    }))
    .sort((a, b) => b.placedDate.localeCompare(a.placedDate));
}

/** Admin-only — the only call sites are the admin Orders pages, so this is the one place provider/refund/risk internals are exposed. */
export async function getAllOrders(): Promise<AdminOrderSummary[]> {
  return MOCK_ORDERS.map(toAdminSummary).sort((a, b) => b.placedDate.localeCompare(a.placedDate));
}

/** Full record (admin-only) for the order detail page — includes fields (customerNotes, internalNotes, full address) not needed by the list view. */
export async function getOrderById(id: string): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  return order ? toAdminSummary(order) : null;
}

/**
 * A customer may only ever see their own order — every customer-facing
 * route (invoice/receipt downloads, return/refund/warranty/support
 * requests) calls this rather than getOrderById, so a customer can never
 * enumerate or read another customer's order by guessing an id.
 */
export async function getOrderForCustomer(id: string, email: string): Promise<AdminOrderSummary | null> {
  const normalized = email.trim().toLowerCase();
  const order = MOCK_ORDERS.find((record) => record.id === id && record.email.toLowerCase() === normalized);
  return order ? toAdminSummary(order) : null;
}

/** The Fraud Dashboard's review queue — orders held (fulfillment withheld) or merely flagged (fulfilled, just visible for awareness). */
export async function getReviewQueue(): Promise<AdminOrderSummary[]> {
  return MOCK_ORDERS.filter((record) => record.reviewStatus === 'held' || record.reviewStatus === 'flagged')
    .map(toAdminSummary)
    .sort((a, b) => b.placedDate.localeCompare(a.placedDate));
}

/** Finds a held order by id — used by the approve/reject fraud routes to run the deferred fulfillment side effects or confirm eligibility for a refund. */
export async function getHeldOrder(id: string): Promise<OrderRecord | null> {
  return MOCK_ORDERS.find((record) => record.id === id && record.reviewStatus === 'held') ?? null;
}

export async function setReviewStatus(id: string, reviewStatus: ReviewStatus): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return null;
  order.reviewStatus = reviewStatus;
  return toAdminSummary(order);
}

/** Used by the PayPal webhook to reconcile a refund issued directly from PayPal's own dashboard (not through our admin refund route) back to the order it belongs to. */
export async function findOrderByProviderReference(providerReference: string): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.providerReference === providerReference);
  return order ? toAdminSummary(order) : null;
}

/** Records a refund already issued against the provider (Stripe/PayPal) — this does not call any payment API itself, see src/lib/admin/refunds.ts. */
export async function recordRefund(id: string, amountCents: number): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return null;
  order.refundedAmount = (order.refundedAmount ?? 0) + amountCents;
  return toAdminSummary(order);
}

/** Admin-only (see getAllOrders) — returns the admin shape so OrdersClient's row state keeps its provider/refund fields after a status change. */
export async function updateOrderStatus(id: string, status: OrderSummary['status']): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return null;
  order.status = status;
  return toAdminSummary(order);
}

export async function updateOrderNotes(id: string, patch: { internalNotes?: string }): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return null;
  if (patch.internalNotes !== undefined) order.internalNotes = patch.internalNotes;
  return toAdminSummary(order);
}

export type ShipOrderResult = { ok: true; order: AdminOrderSummary } | { ok: false; error: string };

export async function shipOrder(id: string, input: { trackingNumber: string; carrier: string }): Promise<ShipOrderResult> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return { ok: false, error: 'Order not found.' };
  if (order.status === 'cancelled') return { ok: false, error: 'This order is cancelled and cannot be shipped.' };

  order.status = 'shipped';
  order.trackingNumber = input.trackingNumber;
  order.carrier = input.carrier;
  return { ok: true, order: toAdminSummary(order) };
}

export type CancelOrderResult = { ok: true; order: AdminOrderSummary } | { ok: false; error: string };

/** Only cancellable before it ships — once shipped, use a return instead. Does not itself call any refund API; the caller (src/app/api/admin/orders/[id]/cancel/route.ts) issues the refund first. */
export async function cancelOrder(id: string): Promise<CancelOrderResult> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return { ok: false, error: 'Order not found.' };
  if (order.status !== 'processing') return { ok: false, error: `Only orders still processing can be cancelled (this one is ${order.status}).` };

  order.status = 'cancelled';
  return { ok: true, order: toAdminSummary(order) };
}

export async function setReturnStatus(id: string, returnStatus: ReturnStatus): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return null;
  order.returnStatus = returnStatus;
  return toAdminSummary(order);
}

export async function setWarrantyStatus(id: string, warrantyStatus: WarrantyStatus): Promise<AdminOrderSummary | null> {
  const order = MOCK_ORDERS.find((record) => record.id === id);
  if (!order) return null;
  order.warrantyStatus = warrantyStatus;
  return toAdminSummary(order);
}

export const ORDER_STATUS_COPY: Record<OrderSummary['status'], string> = {
  processing: 'Your order is being prepared for shipment.',
  shipped: 'Your order is on its way.',
  'out-for-delivery': 'Your order is out for delivery today.',
  delivered: 'Your order has been delivered.',
  cancelled: 'This order has been cancelled.',
};
