import { paypalFetch } from './client';

export interface PayPalRefundResult {
  id: string;
  status: string;
}

/**
 * Omit `amountCents` for a full refund of the capture; pass it for a partial
 * refund. `captureId` is the id returned by capturePayPalOrder(), stored on
 * the order record as `providerReference`.
 */
export async function refundCapture(captureId: string, amountCents?: number): Promise<PayPalRefundResult> {
  const body = amountCents != null ? { amount: { value: (amountCents / 100).toFixed(2), currency_code: 'USD' } } : {};
  return paypalFetch<PayPalRefundResult>(`/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
