import type { Metadata } from 'next';
import { spacing, cn } from '@/design';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'Cart — Premium TechNoir',
  description: 'Review the items in your cart before checking out.',
};

export default function CartPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Your Cart</h1>
      <div className="mt-8">
        <CartClient />
      </div>
    </section>
  );
}
