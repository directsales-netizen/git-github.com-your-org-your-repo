import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/api';
import { buttonVariants, cardVariants, cn, grid, spacing } from '@/design';

const GRADE_LABEL: Record<string, string> = {
  A: 'Grade A · Like New',
  B: 'Grade B · Good',
  C: 'Grade C · Fair',
  D: 'Grade D · Acceptable',
};

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <div className="flex flex-col items-start justify-between gap-4 tablet:flex-row tablet:items-end">
        <div>
          <h2 className="text-h2 font-heading font-bold text-neutral-white">Featured Devices</h2>
          <p className="mt-2 text-body-lg font-body text-neutral-light-gray">
            Hand-picked, professionally graded, ready to ship.
          </p>
        </div>
        <Link href="/shop" className="text-body-md font-body font-semibold text-accent-primary hover:underline">
          Shop all devices &rarr;
        </Link>
      </div>

      <div className={cn(grid.threeCol, 'mt-10')}>
        {products.map((product) => (
          <div key={product.id} className={cn(cardVariants.base, 'flex flex-col')}>
            <div
              role="img"
              aria-label={product.imageAlt}
              className={cn('aspect-[4/3] w-full rounded-md bg-gradient-to-br', product.imageColor)}
            />
            <span className="mt-4 w-fit rounded-full bg-bg-primary px-3 py-1 text-caption font-body text-accent-primary">
              {GRADE_LABEL[product.grade]}
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
        ))}
      </div>
    </section>
  );
}
