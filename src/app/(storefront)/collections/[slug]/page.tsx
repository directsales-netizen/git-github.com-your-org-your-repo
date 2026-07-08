import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/api';
import { getCollectionBySlug } from '@/lib/collections';
import { parseListingFilters, type RawSearchParams } from '@/lib/filters';
import Filters from '@/components/shop/Filters';
import SortDropdown from '@/components/shop/SortDropdown';
import ProductGrid from '@/components/shop/ProductGrid';
import Pagination from '@/components/shop/Pagination';
import { cn, flex, spacing } from '@/design';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Collection Not Found — Premium TechNoir' };
  }

  return {
    title: `${collection.title} — Premium TechNoir`,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const rawSearchParams = await searchParams;
  const filters = parseListingFilters(rawSearchParams);
  const { products, total, page, totalPages } = await getProducts({
    ...filters,
    category: collection.category,
  });

  const rangeStart = total === 0 ? 0 : (page - 1) * 20 + 1;
  const rangeEnd = Math.min(page * 20, total);
  const basePath = `/collections/${collection.slug}`;

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <div
        aria-hidden="true"
        className={cn('h-32 w-full rounded-xl bg-gradient-to-br', collection.heroGradient)}
      />

      <h1 className="mt-8 text-h2 font-heading font-bold text-neutral-white">{collection.title}</h1>
      <p className="mt-2 max-w-2xl text-body-lg font-body text-neutral-light-gray">
        {collection.description}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 desktop:grid-cols-[260px_1fr]">
        <aside>
          <Filters showCategoryFilter={false} clearAllHref={basePath} />
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

          <ProductGrid products={products} clearFiltersHref={basePath} />

          <Pagination page={page} totalPages={totalPages} searchParams={rawSearchParams} basePath={basePath} />
        </div>
      </div>
    </section>
  );
}
