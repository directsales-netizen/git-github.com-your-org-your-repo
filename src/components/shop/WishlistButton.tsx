'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/customer/WishlistContext';
import { accessibility, cn } from '@/design';

export default function WishlistButton({ productId }: { productId: string }) {
  const { isWishlisted, toggle, isAuthenticated } = useWishlist();
  if (!isAuthenticated) return null;

  const active = isWishlisted(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-bg-primary/70 text-neutral-silver transition-colors duration-300 hover:text-accent-primary',
        accessibility.focusRing,
        active && 'text-accent-primary'
      )}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
