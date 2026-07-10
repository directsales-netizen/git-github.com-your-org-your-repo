import type { OrderSummary } from '@/types/chat';
import type { AdminOrderSummary, PaymentProvider, PaymentStatus, ReturnStatus, WarrantyStatus } from '@/types/admin';
import type { DisputeRecord } from '@/types/fraud';
import type { BadgeTone } from '@/components/admin/StatusBadge';

/** No server-only deps — safe to import from client components, same convention as src/lib/admin/requestLabels.ts. */
export const PROVIDER_LABEL: Record<PaymentProvider, string> = { stripe: 'Stripe', paypal: 'PayPal' };

/** Derived, never stored — canonical implementation shared by the CSV export route and every admin order UI; see the PaymentStatus doc comment in src/types/admin.ts. */
export function getPaymentStatus(order: AdminOrderSummary, disputes: DisputeRecord[]): PaymentStatus {
  const hasActiveDispute = order.providerReference != null && disputes.some((d) => d.providerReference === order.providerReference);
  if (hasActiveDispute) return 'disputed';

  const totalCents = Math.round(order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0) * 100);
  const refundedCents = order.refundedAmount ?? 0;
  if (refundedCents > 0 && refundedCents >= totalCents) return 'refunded';
  if (refundedCents > 0) return 'partially_refunded';
  return 'paid';
}

export const SHIPMENT_STATUS_LABEL: Record<OrderSummary['status'], string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const SHIPMENT_STATUS_TONE: Record<OrderSummary['status'], BadgeTone> = {
  processing: 'info',
  shipped: 'warning',
  'out-for-delivery': 'warning',
  delivered: 'success',
  cancelled: 'neutral',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  partially_refunded: 'Partially Refunded',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  paid: 'success',
  partially_refunded: 'warning',
  refunded: 'neutral',
  disputed: 'error',
};

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  none: 'No return',
  requested: 'Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

export const WARRANTY_STATUS_LABEL: Record<WarrantyStatus, string> = {
  none: 'No claim',
  claimed: 'Claimed',
  approved: 'Approved',
  rejected: 'Rejected',
  resolved: 'Resolved',
};
