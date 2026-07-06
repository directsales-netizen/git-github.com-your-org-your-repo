import Link from 'next/link';
import type { Product } from '@/types/product';
import ProductCard from '@/components/shop/ProductCard';
import { cn, grid } from '@/design';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-body-lg font-body font-semibold text-neutral-white">
          No products match your filters.
        </p>
        <p className="text-body-sm font-body text-neutral-silver">
          Try adjusting or clearing your filters to see more devices.
        </p>
        <Link href="/shop" className="mt-2 text-body-md font-body font-semibold text-accent-primary hover:underline">
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(grid.fourCol, 'mt-8')}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
