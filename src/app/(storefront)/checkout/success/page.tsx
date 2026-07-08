import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonVariants, spacing, cn } from '@/design';
import ClearCartOnMount from './ClearCartOnMount';

export const metadata: Metadata = {
  title: 'Order Confirmed — Premium TechNoir',
};

export default function CheckoutSuccessPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-xl text-center')}>
      <ClearCartOnMount />
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Thank you for your order</h1>
      <p className="mt-4 text-body-md font-body text-neutral-light-gray">
        Your payment was successful. A confirmation email is on its way, and you can track your order from your
        account&apos;s order history once it&apos;s processed.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account/orders" className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
          View Order History
        </Link>
        <Link href="/shop" className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
