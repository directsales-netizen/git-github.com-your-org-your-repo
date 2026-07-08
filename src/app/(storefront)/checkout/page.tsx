import type { Metadata } from 'next';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getBusinessSettings } from '@/lib/admin/settings';
import { spacing, cn } from '@/design';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout — Premium TechNoir',
  description: 'Complete your purchase.',
};

export default async function CheckoutPage() {
  const [session, settings] = await Promise.all([getCustomerSession(), getBusinessSettings()]);

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-xl')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Checkout</h1>
      <div className="mt-8">
        <CheckoutClient
          isAuthenticated={Boolean(session)}
          prefillEmail={session?.sub}
          requireAccount={settings.requireAccountForCheckout}
        />
      </div>
    </section>
  );
}
