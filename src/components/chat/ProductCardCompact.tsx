import Link from 'next/link';
import type { PublicProduct } from '@/types/product';
import { PRODUCT_GRADE_LABELS } from '@/types/product';
import { cardVariants, cn } from '@/design';
import ProductImage from '@/components/shop/ProductImage';

export default function ProductCardCompact({ product }: { product: PublicProduct }) {
  return (
    <Link
      href={`/shop?search=${encodeURIComponent(product.title)}`}
      className={cn(cardVariants.minimal, 'flex gap-3 bg-bg-primary transition-colors duration-300 hover:border-accent-primary')}
    >
      <ProductImage
        imageUrl={product.imageUrl}
        imageAlt={product.imageAlt}
        imageColor={product.imageColor}
        sizes="64px"
        className="h-16 w-16 shrink-0"
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
