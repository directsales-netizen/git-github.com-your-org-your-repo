import type { ProductGrade, ProductSortOption } from '@/types/product';

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ListingFilters = {
  grade?: ProductGrade;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: ProductSortOption;
  page?: number;
};

const SORT_OPTIONS: ProductSortOption[] = ['price-asc', 'price-desc', 'newest', 'popular'];
const GRADES: ProductGrade[] = ['A', 'B', 'C', 'D'];

export function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListingFilters(raw: RawSearchParams): ListingFilters {
  const grade = first(raw.grade);
  const sort = first(raw.sort);
  const search = first(raw.search);
  const priceMin = first(raw.priceMin);
  const priceMax = first(raw.priceMax);
  const page = first(raw.page);

  const parsedPriceMin = priceMin !== undefined ? Number(priceMin) : undefined;
  const parsedPriceMax = priceMax !== undefined ? Number(priceMax) : undefined;
  const parsedPage = page !== undefined ? Number(page) : undefined;

  return {
    grade: GRADES.includes(grade as ProductGrade) ? (grade as ProductGrade) : undefined,
    priceMin: parsedPriceMin !== undefined && Number.isFinite(parsedPriceMin) ? parsedPriceMin : undefined,
    priceMax: parsedPriceMax !== undefined && Number.isFinite(parsedPriceMax) ? parsedPriceMax : undefined,
    search: search?.trim() ? search.trim() : undefined,
    sort: SORT_OPTIONS.includes(sort as ProductSortOption) ? (sort as ProductSortOption) : undefined,
    page: parsedPage !== undefined && Number.isFinite(parsedPage) ? parsedPage : undefined,
  };
}
