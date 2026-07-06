import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductFilters,
  type ProductGrade,
  type ProductSortOption,
} from '@/types/product';
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

const SORT_OPTIONS: ProductSortOption[] = ['price-asc', 'price-desc', 'newest', 'popular'];
const GRADES: ProductGrade[] = ['A', 'B', 'C', 'D'];

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(raw: RawSearchParams): ProductFilters {
  const category = first(raw.category);
  const grade = first(raw.grade);
  const sort = first(raw.sort);
  const search = first(raw.search);
  const priceMin = first(raw.priceMin);
  const priceMax = first(raw.priceMax);
  const discounted = first(raw.discounted);
  const page = first(raw.page);

  const parsedPriceMin = priceMin !== undefined ? Number(priceMin) : undefined;
  const parsedPriceMax = priceMax !== undefined ? Number(priceMax) : undefined;
  const parsedPage = page !== undefined ? Number(page) : undefined;

  return {
    category: PRODUCT_CATEGORIES.includes(category as ProductCategory)
      ? (category as ProductCategory)
      : undefined,
    grade: GRADES.includes(grade as ProductGrade) ? (grade as ProductGrade) : undefined,
    priceMin: parsedPriceMin !== undefined && Number.isFinite(parsedPriceMin) ? parsedPriceMin : undefined,
    priceMax: parsedPriceMax !== undefined && Number.isFinite(parsedPriceMax) ? parsedPriceMax : undefined,
    discounted: discounted === 'true' ? true : undefined,
    search: search?.trim() ? search.trim() : undefined,
    sort: SORT_OPTIONS.includes(sort as ProductSortOption) ? (sort as ProductSortOption) : undefined,
    page: parsedPage !== undefined && Number.isFinite(parsedPage) ? parsedPage : undefined,
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

          <Pagination page={page} totalPages={totalPages} searchParams={rawSearchParams} />
        </div>
      </div>
    </section>
  );
}
