'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface WishlistContextValue {
  productIds: Set<string>;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => void;
  isAuthenticated: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * Fetches the signed-in customer's wishlist once (mirrors CartContext's
 * shape, src/lib/cart/CartContext.tsx) so every ProductCard's heart button
 * doesn't need its own network request — no-ops entirely for guests, since
 * there's no guest wishlist (matches this app's "no guest checkout" stance:
 * wishlist requires an account too).
 */
export function WishlistProvider({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  const [productIds, setProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    fetch('/api/customer/wishlist')
      .then((res) => (res.ok ? res.json() : []))
      .then((items: { productId: string }[]) => {
        if (!cancelled) setProductIds(new Set(items.map((i) => i.productId)));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function toggle(productId: string) {
    if (!isAuthenticated) return;
    const currentlyIn = productIds.has(productId);

    setProductIds((prev) => {
      const next = new Set(prev);
      if (currentlyIn) next.delete(productId);
      else next.add(productId);
      return next;
    });

    if (currentlyIn) {
      fetch(`/api/customer/wishlist/${productId}`, { method: 'DELETE' }).catch(() => {});
    } else {
      fetch('/api/customer/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    }
  }

  const value = useMemo(
    () => ({ productIds, isWishlisted: (id: string) => productIds.has(id), toggle, isAuthenticated }),
    [productIds, isAuthenticated]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
