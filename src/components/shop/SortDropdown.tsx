'use client';

import type { ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ProductSortOption } from '@/types/product';
import { cn, inputVariants } from '@/design';

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get('sort') as ProductSortOption | null) ?? 'newest';

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', event.target.value);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="shop-sort" className="sr-only">
        Sort products by
      </label>
      <select
        id="shop-sort"
        value={currentSort}
        onChange={handleChange}
        className={cn(inputVariants.base, 'w-auto py-2')}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
