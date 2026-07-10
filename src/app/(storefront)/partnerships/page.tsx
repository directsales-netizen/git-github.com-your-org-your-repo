import type { Metadata } from 'next';
import { Building2, Recycle, Repeat } from 'lucide-react';
import { spacing, cardVariants, grid, buttonVariants, cn } from '@/design';
import { getBusinessSettings } from '@/lib/admin/settings';

export const metadata: Metadata = {
  title: 'Partnerships — Premium TechNoir',
  description: 'Partner with Premium TechNoir on trade-in, corporate refresh, and recycling programs.',
};

const PARTNERSHIP_TYPES = [
  {
    title: 'Corporate Refresh Programs',
    description: 'Retiring fleet devices? We handle secure data wiping, fair valuation, and responsible resale or recycling.',
    Icon: Building2,
  },
  {
    title: 'Trade-In & Buyback',
    description: 'Ongoing buyback arrangements for schools, IT resellers, and businesses upgrading hardware regularly.',
    Icon: Repeat,
  },
  {
    title: 'Recycling & Sustainability',
    description: 'Partner with us on e-waste diversion initiatives and measurable sustainability reporting.',
    Icon: Recycle,
  },
];

export default async function PartnershipsPage() {
  const settings = await getBusinessSettings();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <h1 className="max-w-3xl text-h1 font-heading font-bold text-neutral-white">Partnerships</h1>
      <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
        We work with businesses, schools, and organizations that want to responsibly source or retire technology
        at scale. Here&apos;s how we typically partner.
      </p>

      <div className={cn(grid.threeCol, 'mt-12')}>
        {PARTNERSHIP_TYPES.map(({ title, description, Icon }) => (
          <div key={title} className={cardVariants.base}>
            <Icon size={24} className="text-accent-primary" aria-hidden="true" />
            <h2 className="mt-4 text-h5 font-heading font-semibold text-neutral-white">{title}</h2>
            <p className="mt-2 text-body-sm font-body text-neutral-silver">{description}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-neutral-titanium/20 bg-bg-secondary p-8 text-center tablet:p-12">
        <h2 className="text-h4 font-heading font-bold text-neutral-white">Let&apos;s talk</h2>
        <p className="mt-3 text-body-md font-body text-neutral-light-gray">
          Tell us about your organization and what you&apos;re looking for, and our team will follow up.
        </p>
        <a
          href={`mailto:${settings.supportEmail}?subject=Partnership%20Inquiry`}
          className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-6 inline-flex items-center justify-center text-body-md')}
        >
          Email {settings.supportEmail}
        </a>
      </div>
    </section>
  );
}
