import type { Metadata } from 'next';
import { Truck, MapPin, Clock } from 'lucide-react';
import { spacing, cardVariants, cn } from '@/design';
import { getBusinessSettings } from '@/lib/admin/settings';

export const metadata: Metadata = {
  title: 'Shipping Info — Premium TechNoir',
  description: 'Delivery timeframes, tracking, and shipping details for Premium TechNoir orders.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-heading font-bold text-neutral-white">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-md font-body text-neutral-light-gray">{children}</div>
    </section>
  );
}

export default async function ShippingInfoPage() {
  const settings = await getBusinessSettings();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-3xl')}>
      <h1 className="text-h1 font-heading font-bold text-neutral-white">Shipping Info</h1>
      <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
        Here&apos;s what to expect once your order ships from our facility in Austin, TX.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <div className={cn(cardVariants.base, 'flex items-start gap-3')}>
          <Truck size={22} className="mt-1 shrink-0 text-accent-primary" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-body text-neutral-silver">Processing time</p>
            <p className="text-body-md font-body font-semibold text-neutral-white">1–2 business days</p>
          </div>
        </div>
        <div className={cn(cardVariants.base, 'flex items-start gap-3')}>
          <Clock size={22} className="mt-1 shrink-0 text-accent-primary" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-body text-neutral-silver">Delivery time</p>
            <p className="text-body-md font-body font-semibold text-neutral-white">3–7 business days</p>
          </div>
        </div>
        <div className={cn(cardVariants.base, 'flex items-start gap-3')}>
          <MapPin size={22} className="mt-1 shrink-0 text-accent-primary" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-body text-neutral-silver">Ships from</p>
            <p className="text-body-md font-body font-semibold text-neutral-white">{settings.address}</p>
          </div>
        </div>
      </div>

      <Section title="Tracking your order">
        <p>
          As soon as your order ships, we&apos;ll email you a tracking number. You can also check order status
          anytime from your account.
        </p>
      </Section>

      <Section title="Packaging">
        <p>
          Every device is carefully packed to protect it in transit, with padding around the device and its
          original accessories where included.
        </p>
      </Section>

      <Section title="Shipping issues">
        <p>
          If a package is delayed, lost, or arrives damaged, contact our support team as soon as possible so we
          can help — we won&apos;t make you chase down the carrier alone.
        </p>
      </Section>

      <Section title="Questions?">
        <p>
          Reach us at{' '}
          <a href={`mailto:${settings.supportEmail}`} className="font-semibold text-accent-primary hover:underline">
            {settings.supportEmail}
          </a>{' '}
          or through our{' '}
          <a href="/support/contact" className="font-semibold text-accent-primary hover:underline">
            contact page
          </a>
          .
        </p>
      </Section>
    </section>
  );
}
