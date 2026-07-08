import Link from 'next/link';
import type { Product } from '@/types/product';
import { PRODUCT_GRADE_LABELS } from '@/types/product';
import { cardVariants, cn } from '@/design';

export default function ProductCardCompact({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop?search=${encodeURIComponent(product.title)}`}
      className={cn(cardVariants.minimal, 'flex gap-3 bg-bg-primary transition-colors duration-300 hover:border-accent-primary')}
    >
      <div
        role="img"
        aria-label={product.imageAlt}
        className={cn('h-16 w-16 shrink-0 rounded-md bg-gradient-to-br', product.imageColor)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-body font-semibold text-neutral-white">{product.title}</p>
        <p className="text-caption font-body text-neutral-silver">{PRODUCT_GRADE_LABELS[product.grade]}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-body-sm font-heading font-bold text-neutral-white">${product.price}</span>
          {product.originalPrice && (
            <span className="text-caption font-body text-neutral-gray line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
