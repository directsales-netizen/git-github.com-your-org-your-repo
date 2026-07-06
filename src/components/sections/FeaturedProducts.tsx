import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import { cn, grid, spacing } from '@/design';

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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
