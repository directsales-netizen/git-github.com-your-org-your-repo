'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '@/types/cart';
import type { PublicProduct } from '@/types/product';

const STORAGE_KEY = 'ptn_cart';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: PublicProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  ordersPaused: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children, ordersPaused = false }: { children: ReactNode; ordersPaused?: boolean }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage only on the client, after mount — avoids an
  // SSR/client markup mismatch (the server always renders an empty cart).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Hydration must happen after mount so the server and first client render both start empty.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt/inaccessible storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(product: PublicProduct, quantity = 1) {
    if (ordersPaused) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          imageAlt: product.imageAlt,
          imageColor: product.imageColor,
          imageUrl: product.imageUrl,
          quantity,
          availability: product.availability,
          grade: product.grade,
          category: product.category,
        },
      ];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return removeItem(productId);
    setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  }

  function clear() {
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQuantity, clear, subtotal, count, ordersPaused }),
    [items, subtotal, count, ordersPaused]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
