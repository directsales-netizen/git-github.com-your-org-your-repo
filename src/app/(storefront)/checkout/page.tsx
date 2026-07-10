import type { Metadata } from 'next';
import { getCustomerSession } from '@/lib/customer/getSession';
import { findCustomerAccountByEmail } from '@/lib/customer/store';
import { getBusinessSettings } from '@/lib/admin/settings';
import { spacing, cn } from '@/design';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout — Premium TechNoir',
  description: 'Complete your purchase.',
};

export default async function CheckoutPage() {
  const [session, settings] = await Promise.all([getCustomerSession(), getBusinessSettings()]);
  const account = session ? await findCustomerAccountByEmail(session.sub) : null;

  return (
    <section className={cn(spacing.containerPadding, 'mx-auto my-12 max-w-6xl tablet:my-16')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Checkout</h1>
      <div className="mt-8">
        <CheckoutClient
          isAuthenticated={Boolean(session)}
          prefillEmail={session?.sub}
          prefillName={account?.name}
          requireAccount={settings.requireAccountForCheckout}
          ordersPaused={settings.ordersPaused}
          inquiryOnlyMode={settings.inquiryOnlyMode}
          supportEmail={settings.supportEmail}
          supportPhone={settings.supportPhone}
          businessHours={settings.businessHours}
        />
      </div>
    </section>
  );
}
