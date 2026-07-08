import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonVariants, spacing, cn } from '@/design';

export const metadata: Metadata = {
  title: 'Checkout Cancelled — Premium TechNoir',
};

export default function CheckoutCancelPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-xl text-center')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Checkout cancelled</h1>
      <p className="mt-4 text-body-md font-body text-neutral-light-gray">
        No payment was made. Your cart is still saved if you&apos;d like to try again.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/checkout" className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
          Return to Checkout
        </Link>
        <Link href="/shop" className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
