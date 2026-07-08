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

export const PRODUCT_GRADE_DESCRIPTIONS: Record<ProductGrade, string> = {
  A: 'Minimal signs of use, 85%+ battery health, and a near-perfect screen. Full original accessories included.',
  B: 'Light signs of use, such as small scratches or minor marks, with 75–85% battery health and an excellent screen.',
  C: 'Visible signs of use with 65–74% battery health. Screen is in good condition and may show minor wear.',
  D: 'Heavy signs of use with 50–64% battery health. Fully functional, with limited included accessories.',
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
  stock: number;
  lowStockThreshold: number;
}

export type StockAvailability = 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * What public storefront pages/components receive — never the exact `stock`
 * count or `lowStockThreshold` (those are internal inventory signals; only
 * admin-facing code should see them). See toPublicProduct() in src/lib/api.ts.
 */
export type PublicProduct = Omit<Product, 'stock' | 'lowStockThreshold'> & {
  availability: StockAvailability;
};

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
