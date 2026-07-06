export type ProductGrade = 'A' | 'B' | 'C' | 'D';

export type ProductCategory =
  | 'MacBooks'
  | 'iMacs'
  | 'iPads'
  | 'iPhones'
  | 'Windows PCs'
  | 'Accessories';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'MacBooks',
  'iMacs',
  'iPads',
  'iPhones',
  'Windows PCs',
  'Accessories',
];

export const PRODUCT_GRADE_LABELS: Record<ProductGrade, string> = {
  A: 'Grade A · Like New',
  B: 'Grade B · Good',
  C: 'Grade C · Fair',
  D: 'Grade D · Acceptable',
};

export type ProductSortOption = 'price-asc' | 'price-desc' | 'newest' | 'popular';

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  grade: ProductGrade;
  price: number;
  originalPrice?: number;
  imageAlt: string;
  imageColor: string;
  dateAdded: string;
  popularity: number;
}

export interface ProductFilters {
  category?: ProductCategory;
  grade?: ProductGrade;
  priceMin?: number;
  priceMax?: number;
  discounted?: boolean;
  search?: string;
  sort?: ProductSortOption;
  page?: number;
}
