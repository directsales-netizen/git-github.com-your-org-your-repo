import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { spacing, cardVariants, grid, buttonVariants, cn } from '@/design';
import { getBusinessSettings } from '@/lib/admin/settings';

export const metadata: Metadata = {
  title: 'Careers — Premium TechNoir',
  description: 'Join the Premium TechNoir team and help make technology more accessible and sustainable.',
};

const WHY_JOIN = [
  { title: 'Mission-driven work', description: 'Every role directly supports keeping usable technology out of landfills.' },
  { title: 'Room to grow', description: 'We’re a growing team, which means real ownership and new opportunities.' },
  { title: 'Community-first culture', description: 'We value transparency, honesty, and long-term relationships — with customers and with each other.' },
];

export default async function CareersPage() {
  const settings = await getBusinessSettings();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <h1 className="max-w-3xl text-h1 font-heading font-bold text-neutral-white">Careers at Premium TechNoir</h1>
      <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
        We&apos;re a small, growing team working to make technology more accessible, affordable, and sustainable.
        We don&apos;t have open roles listed right now, but we&apos;re always glad to hear from people who share
        our mission.
      </p>

      <div className={cn(grid.threeCol, 'mt-12')}>
        {WHY_JOIN.map((item) => (
          <div key={item.title} className={cardVariants.base}>
            <h2 className="text-h5 font-heading font-semibold text-neutral-white">{item.title}</h2>
            <p className="mt-2 text-body-sm font-body text-neutral-silver">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-neutral-titanium/20 bg-bg-secondary p-8 text-center tablet:p-12">
        <Mail size={28} className="mx-auto text-accent-primary" aria-hidden="true" />
        <h2 className="mt-4 text-h4 font-heading font-bold text-neutral-white">No open roles right now?</h2>
        <p className="mt-3 text-body-md font-body text-neutral-light-gray">
          Send us your resume and a note about what you&apos;re interested in — we keep it on file for when a
          relevant role opens up.
        </p>
        <a
          href={`mailto:${settings.supportEmail}?subject=Careers%20Interest`}
          className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-6 inline-flex items-center justify-center text-body-md')}
        >
          Email {settings.supportEmail}
        </a>
      </div>
    </section>
  );
}
