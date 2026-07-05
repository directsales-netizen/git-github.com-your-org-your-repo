export type ProductGrade = 'A' | 'B' | 'C' | 'D';

export type ProductCategory =
  | 'MacBooks'
  | 'iMacs'
  | 'iPads'
  | 'iPhones'
  | 'Windows PCs'
  | 'Accessories';

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
}
