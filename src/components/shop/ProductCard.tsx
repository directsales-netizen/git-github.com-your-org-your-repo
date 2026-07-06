import type { Product } from '@/types/product';
import { PRODUCT_GRADE_LABELS } from '@/types/product';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className={cn(cardVariants.base, 'flex flex-col')}>
      <div
        role="img"
        aria-label={product.imageAlt}
        className={cn('aspect-[4/3] w-full rounded-md bg-gradient-to-br', product.imageColor)}
      />
      <span className="mt-4 w-fit rounded-full bg-bg-primary px-3 py-1 text-caption font-body text-accent-primary">
        {PRODUCT_GRADE_LABELS[product.grade]}
      </span>
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
        className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-4 text-body-sm')}
      >
        Quick Add
      </button>
    </div>
  );
}
