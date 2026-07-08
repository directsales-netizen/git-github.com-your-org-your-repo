'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';
import { accessibility, buttonVariants, cardVariants, cn, spacing } from '@/design';
import EmptyState from '@/components/admin/EmptyState';

export default function CartClient() {
  const { items, removeItem, setQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the shop to find your next device."
        action={
          <Link href="/shop" className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
            Shop Devices
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.productId} className={cn(cardVariants.base, 'flex items-center gap-4')}>
            <div className={cn('h-16 w-16 shrink-0 rounded-md bg-gradient-to-br', item.imageColor)} role="img" aria-label={item.imageAlt} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading font-semibold text-neutral-white">{item.title}</p>
              <p className="text-body-sm font-body text-neutral-silver">${item.price} each</p>
              {item.availability !== 'in-stock' && (
                <p className={cn('text-caption font-body', item.availability === 'out-of-stock' ? 'text-error' : 'text-warning')}>
                  {item.availability === 'out-of-stock' ? 'Out of stock' : 'Low stock'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.title}`}
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className={cn('flex h-8 w-8 items-center justify-center rounded-md border border-neutral-titanium/30 text-neutral-light-gray hover:text-accent-primary', accessibility.focusRing)}
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <span className="w-6 text-center text-body-sm font-body text-neutral-white">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.title}`}
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className={cn('flex h-8 w-8 items-center justify-center rounded-md border border-neutral-titanium/30 text-neutral-light-gray hover:text-accent-primary', accessibility.focusRing)}
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>

            <p className="w-20 text-right font-heading font-semibold text-neutral-white">${(item.price * item.quantity).toFixed(2)}</p>

            <button
              type="button"
              aria-label={`Remove ${item.title} from cart`}
              onClick={() => removeItem(item.productId)}
              className={cn('rounded-md p-1.5 text-neutral-silver hover:text-error', accessibility.focusRing)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className={cn(cardVariants.base, 'flex items-center justify-between')}>
        <div>
          <p className="text-body-sm font-body text-neutral-silver">Subtotal</p>
          <p className="text-h4 font-heading font-bold text-neutral-white">${subtotal.toFixed(2)}</p>
          <p className="mt-1 text-caption font-body text-neutral-silver">Final price and stock are confirmed at checkout.</p>
        </div>
        <Link href="/checkout" className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-md')}>
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
