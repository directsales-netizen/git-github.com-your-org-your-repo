'use client';

import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { PublicProduct } from '@/types/product';
import ProductCard from '@/components/shop/ProductCard';
import { accessibility, buttonVariants, cn } from '@/design';

export default function FeaturedProductRail({ products }: { products: PublicProduct[] }) {
  const railRef = useRef<HTMLUListElement>(null);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.min(rail.clientWidth * 0.82, 420);
    rail.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <ul
        ref={railRef}
        aria-label="Featured devices"
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-color:rgba(47,231,242,0.32)_transparent] tablet:gap-6"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[min(84vw,24rem)] shrink-0 snap-start">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Scroll featured devices left"
          className={cn(buttonVariants.ghost, accessibility.focusRing, 'flex h-11 w-11 items-center justify-center rounded-full p-0')}
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Scroll featured devices right"
          className={cn(buttonVariants.ghost, accessibility.focusRing, 'flex h-11 w-11 items-center justify-center rounded-full p-0')}
        >
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
