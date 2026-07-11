'use client';

import { useState } from 'react';
import type { PublicProduct } from '@/types/product';
import { PRODUCT_GRADE_LABELS } from '@/types/product';
import { buttonVariants, cn, spacing } from '@/design';
import { useCart } from '@/lib/cart/CartContext';
import GlassCard from '@/components/animations/GlassCard';
import WishlistButton from './WishlistButton';

const AVAILABILITY_LABEL: Record<PublicProduct['availability'], string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

export default function ProductCard({ product }: { product: PublicProduct }) {
  const { addItem, ordersPaused } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <GlassCard className="flex flex-col p-6">
      <div
        role="img"
        aria-label={product.imageAlt}
        className={cn('relative aspect-[4/3] w-full rounded-md bg-gradient-to-br', product.imageColor)}
      >
        <div className="absolute right-2 top-2">
          <WishlistButton productId={product.id} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="w-fit rounded-full bg-bg-primary px-3 py-1 text-caption font-body text-accent-primary">
          {PRODUCT_GRADE_LABELS[product.grade]}
        </span>
        {product.availability !== 'in-stock' && (
          <span className={cn('text-caption font-body font-medium', product.availability === 'out-of-stock' ? 'text-error' : 'text-warning')}>
            {AVAILABILITY_LABEL[product.availability]}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-h6 font-heading font-semibold text-neutral-white">{product.title}</h3>
      <p className="mt-1 text-body-sm font-body text-neutral-silver">{product.category}</p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-h5 font-heading font-bold text-neutral-white">${product.price}</span>
        {product.originalPrice && (
          <span className="text-body-sm font-body text-neutral-gray line-through">${product.originalPrice}</span>
        )}
      </div>

      <button
        type="button"
        disabled={product.availability === 'out-of-stock' || ordersPaused}
        onClick={handleAdd}
        className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-4 text-body-sm')}
      >
        {ordersPaused ? 'Ordering paused' : product.availability === 'out-of-stock' ? 'Out of stock' : added ? 'Added to cart' : 'Quick Add'}
      </button>
    </GlassCard>
  );
}
