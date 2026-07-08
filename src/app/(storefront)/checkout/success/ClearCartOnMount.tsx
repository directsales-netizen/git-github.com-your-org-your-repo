'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart/CartContext';

/** Payment succeeded (this page only renders after Stripe's redirect) — safe to clear the local cart. */
export default function ClearCartOnMount() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
