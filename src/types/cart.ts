import type { StockAvailability } from './product';

/**
 * `price` here is a display cache only, populated from the PublicProduct at
 * the moment it was added to the cart. Checkout never trusts it — the
 * checkout-session route always re-derives price/stock from the real
 * catalog server-side (see src/app/api/checkout/session/route.ts).
 */
export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  imageAlt: string;
  imageColor: string;
  quantity: number;
  availability: StockAvailability;
}
