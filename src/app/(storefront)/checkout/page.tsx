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
  const authorizeNetEnabled = Boolean(
    process.env.AUTHORIZENET_API_LOGIN_ID &&
      process.env.AUTHORIZENET_TRANSACTION_KEY &&
      process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID &&
      process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY
  );
  // A visitor should always have a working way to submit their cart. When no
  // provider is configured, automatically use the review/request workflow.
  const inquiryOnlyMode = settings.inquiryOnlyMode || !authorizeNetEnabled;

  return (
    <section className={cn(spacing.containerPadding, 'mx-auto my-12 max-w-6xl tablet:my-16')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Checkout</h1>
      <div className="mt-8">
        <CheckoutClient
          isAuthenticated={Boolean(session?.sub)}
          prefillEmail={session?.sub}
          prefillName={account?.name}
          requireAccount={settings.requireAccountForCheckout}
          ordersPaused={settings.ordersPaused}
          inquiryOnlyMode={inquiryOnlyMode}
          authorizeNetEnabled={authorizeNetEnabled}
          supportEmail={settings.supportEmail}
          supportPhone={settings.supportPhone}
          businessHours={settings.businessHours}
        />
      </div>
    </section>
  );
}
