import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { first, parseListingFilters, type RawSearchParams } from '@/lib/filters';
import { PRODUCT_CATEGORIES, type ProductCategory, type ProductFilters } from '@/types/product';
import Filters from '@/components/shop/Filters';
import SortDropdown from '@/components/shop/SortDropdown';
import ProductGrid from '@/components/shop/ProductGrid';
import Pagination from '@/components/shop/Pagination';
import { cn, flex, spacing } from '@/design';

export const metadata: Metadata = {
  title: 'Shop All Devices — Premium TechNoir',
  description:
    'Browse professionally tested, responsibly sourced refurbished MacBooks, iPhones, iPads, iMacs, Windows PCs, and accessories.',
};

function parseFilters(raw: RawSearchParams): ProductFilters {
  const category = first(raw.category);
  const discounted = first(raw.discounted);

  return {
    ...parseListingFilters(raw),
    category: PRODUCT_CATEGORIES.includes(category as ProductCategory)
      ? (category as ProductCategory)
      : undefined,
    discounted: discounted === 'true' ? true : undefined,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawSearchParams = await searchParams;
  const filters = parseFilters(rawSearchParams);
  const { products, total, page, totalPages } = await getProducts(filters);

  const rangeStart = total === 0 ? 0 : (page - 1) * 20 + 1;
  const rangeEnd = Math.min(page * 20, total);

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Shop All Devices</h1>
      <p className="mt-2 text-body-lg font-body text-neutral-light-gray">
        Professionally tested, responsibly sourced, and honestly graded.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 desktop:grid-cols-[260px_1fr]">
        <aside>
          <Filters />
        </aside>

        <div>
          <div className={cn(flex.between, 'flex-wrap gap-4')}>
            <p role="status" aria-live="polite" className="text-body-sm font-body text-neutral-silver">
              {total === 0
                ? 'No results'
                : `Showing ${rangeStart}–${rangeEnd} of ${total} results`}
            </p>
            <SortDropdown />
          </div>

          <ProductGrid products={products} />

          <Pagination page={page} totalPages={totalPages} searchParams={rawSearchParams} basePath="/shop" />
        </div>
      </div>
    </section>
  );
}
