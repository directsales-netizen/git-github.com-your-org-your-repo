import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Leaf, Lightbulb, ShieldCheck, Users } from 'lucide-react';
import { buttonVariants, cardVariants, grid, spacing, cn } from '@/design';

export const metadata: Metadata = {
  title: 'About Us — Premium TechNoir',
  description:
    'Premium TechNoir makes technology accessible, affordable, and sustainable through responsible sourcing, refurbishment, and resale.',
};

const VALUES = [
  { title: 'Sustainability', description: 'Extending the life of technology instead of sending it to a landfill.', Icon: Leaf },
  { title: 'Integrity', description: 'Honest condition grading and no exaggerated claims — what you see is what you get.', Icon: ShieldCheck },
  { title: 'Innovation', description: 'Constantly improving how we test, refurbish, and support every device.', Icon: Lightbulb },
  { title: 'Value', description: 'Premium technology at a smarter price, without cutting corners on quality.', Icon: Heart },
  { title: 'Community', description: 'Building lasting relationships with customers, partners, and the planet.', Icon: Users },
];

export default function AboutPage() {
  return (
    <>
      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <h1 className="max-w-3xl text-h1 font-heading font-bold text-neutral-white">
          Premium Technology. Smarter Value. Sustainable Impact.
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
          Premium TechNoir makes technology accessible, affordable, and sustainable through responsible sourcing,
          refurbishment, resale, and recycling.
        </p>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
          <div className={cardVariants.base}>
            <h2 className="text-h4 font-heading font-bold text-neutral-white">Our Mission</h2>
            <p className="mt-3 text-body-md font-body text-neutral-light-gray">
              To make technology accessible, affordable, and sustainable through responsible sourcing,
              refurbishment, resale, and recycling.
            </p>
          </div>
          <div className={cardVariants.base}>
            <h2 className="text-h4 font-heading font-bold text-neutral-white">Our Vision</h2>
            <p className="mt-3 text-body-md font-body text-neutral-light-gray">
              To become a trusted leader in sustainable technology commerce by delivering premium products,
              exceptional service, and lasting customer relationships.
            </p>
          </div>
        </div>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <h2 className="text-h2 font-heading font-bold text-neutral-white">What We Stand For</h2>
        <div className={cn(grid.threeCol, 'mt-10')}>
          {VALUES.map(({ title, description, Icon }) => (
            <div key={title} className={cardVariants.base}>
              <Icon size={24} className="text-accent-primary" aria-hidden="true" />
              <h3 className="mt-4 text-h5 font-heading font-semibold text-neutral-white">{title}</h3>
              <p className="mt-2 text-body-sm font-body text-neutral-silver">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <div className="mx-auto max-w-2xl rounded-xl border border-neutral-titanium/20 bg-bg-secondary p-8 text-center tablet:p-12">
          <h2 className="text-h3 font-heading font-bold text-neutral-white">
            Curious how our refurbishment process works?
          </h2>
          <p className="mt-4 text-body-md font-body text-neutral-light-gray">
            See the four-step process every device goes through, and what our condition grades actually mean.
          </p>
          <Link
            href="/sustainability"
            className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-6 inline-flex items-center justify-center text-body-md')}
          >
            Explore Sustainability
          </Link>
        </div>
      </section>
    </>
  );
}
