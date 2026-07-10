import { getProductById } from '@/lib/api';

export interface RequestedCartItem {
  productId: string;
  quantity: number;
}

export interface ValidatedCartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export type ValidateCartItemsResult =
  | { ok: true; items: ValidatedCartItem[]; subtotal: number }
  | { ok: false; status: 400; error: string };

/**
 * Server-side source of truth for price/stock — never trust client-supplied
 * prices. Shared by the direct checkout route and the purchase-inquiry
 * submit/approve routes, since stock and price can drift between when a
 * customer submits a cart and when a SuperAdmin later approves it.
 */
export async function validateCartItems(requested: RequestedCartItem[]): Promise<ValidateCartItemsResult> {
  if (requested.length === 0) {
    return { ok: false, status: 400, error: 'Cart is empty.' };
  }

  const items: ValidatedCartItem[] = [];
  for (const item of requested) {
    if (!item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0) {
      return { ok: false, status: 400, error: 'Invalid line item.' };
    }

    const product = await getProductById(item.productId);
    if (!product) {
      return { ok: false, status: 400, error: `Product ${item.productId} not found.` };
    }
    if (product.stock < item.quantity) {
      return { ok: false, status: 400, error: `${product.title} only has ${product.stock} in stock.` };
    }

    items.push({ productId: product.id, title: product.title, price: product.price, quantity: item.quantity });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { ok: true, items, subtotal };
}
