import { paypalFetch } from './client';

interface ShippingAddressInput {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

interface CreatePayPalOrderInput {
  /** Dollars, not cents — matches validateCartItems()'s subtotal shape. */
  amount: number;
  shippingAddress: ShippingAddressInput;
}

export interface PayPalOrder {
  id: string;
  status: string;
}

/**
 * Creates a PayPal Order (Orders v2 API, intent CAPTURE). Deliberately omits
 * a per-item `items`/`breakdown` array — PayPal requires those to
 * reconcile exactly against `amount.value` (item totals + tax + shipping),
 * and this app has no tax engine to feed that reconciliation honestly (see
 * the same "Tax calculated at payment" placeholder used in the Stripe
 * checkout). A single `amount.value` is simpler and avoids a whole class of
 * "UNPROCESSABLE_ENTITY" bugs for no real feature loss today.
 */
export async function createPayPalOrder(input: CreatePayPalOrderInput): Promise<PayPalOrder> {
  return paypalFetch<PayPalOrder>('/v2/checkout/orders', {
    method: 'POST',
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: input.amount.toFixed(2) },
          shipping: {
            address: {
              address_line_1: input.shippingAddress.line1,
              address_line_2: input.shippingAddress.line2 || undefined,
              admin_area_2: input.shippingAddress.city,
              admin_area_1: input.shippingAddress.state,
              postal_code: input.shippingAddress.zip,
              country_code: 'US',
            },
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            // We already collected/validated the shipping address ourselves.
            shipping_preference: 'SET_PROVIDED_ADDRESS',
            // Leads with PayPal's guest/card option rather than forcing login.
            landing_page: 'GUEST_CHECKOUT',
            user_action: 'PAY_NOW',
          },
        },
      },
    }),
  });
}

interface PayPalCaptureResponse {
  status?: string;
  purchase_units?: { payments?: { captures?: { id: string; status: string }[] } }[];
}

export interface PayPalCaptureResult {
  status: string;
  captureId: string | null;
}

/**
 * Server-to-server capture call — trusted (this app talking directly to
 * PayPal over OAuth2), not a claim relayed from the browser. `COMPLETED` can
 * fulfill immediately from the route that calls this; the webhook
 * (PAYMENT.CAPTURE.COMPLETED) is the idempotent backstop for the rarer
 * PENDING → COMPLETED async case.
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
  const data = await paypalFetch<PayPalCaptureResponse>(`/v2/checkout/orders/${orderId}/capture`, { method: 'POST' });
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  return { status: capture?.status ?? data.status ?? 'UNKNOWN', captureId: capture?.id ?? null };
}
