import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Recycle, SearchCheck, ShieldCheck } from 'lucide-react';
import { IMPACT_METRICS, REFURBISHMENT_STEPS } from '@/lib/sustainability';
import { PRODUCT_GRADE_DESCRIPTIONS, PRODUCT_GRADE_LABELS, type ProductGrade } from '@/types/product';
import { buttonVariants, cardVariants, cn, grid, spacing } from '@/design';

export const metadata: Metadata = {
  title: 'Sustainability — Premium TechNoir',
  description:
    'How Premium TechNoir extends the life of technology responsibly — our refurbishment process, honest condition grading, and measurable environmental impact.',
};

const STEP_ICONS = [Recycle, SearchCheck, ShieldCheck, BadgeCheck] as const;
const GRADES: ProductGrade[] = ['A', 'B', 'C', 'D'];

export default function SustainabilityPage() {
  return (
    <>
      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <h1 className="max-w-3xl text-h1 font-heading font-bold text-neutral-white">
          Extending the life of technology, responsibly.
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
          Every device we sell goes through professional testing and repair rather than being discarded —
          fewer raw materials mined, less energy spent manufacturing new devices, and less electronic waste
          headed to landfills.
        </p>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <div className={cn(grid.threeCol)}>
          {IMPACT_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-neutral-titanium/20 bg-bg-secondary p-6 text-center"
            >
              <p className="text-h3 font-heading font-bold text-accent-primary">{metric.value}</p>
              <p className="mt-2 text-body-sm font-body text-neutral-silver">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <h2 className="text-h2 font-heading font-bold text-neutral-white">How Refurbishment Works</h2>
        <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
          Every device follows the same four-step process before it&apos;s listed for sale.
        </p>

        <div className={cn(grid.fourCol, 'mt-12')}>
          {REFURBISHMENT_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <div key={step.title} className={cardVariants.base}>
                <Icon size={28} className="text-accent-primary" aria-hidden="true" />
                <h3 className="mt-4 text-h5 font-heading font-semibold text-neutral-white">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-2 text-body-sm font-body text-neutral-silver">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <h2 className="text-h2 font-heading font-bold text-neutral-white">What Our Grades Mean</h2>
        <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
          Every listing shows a transparent condition grade so you know exactly what you&apos;re getting —
          no surprises when it arrives.
        </p>

        <div className={cn(grid.fourCol, 'mt-12')}>
          {GRADES.map((grade) => (
            <div key={grade} className={cardVariants.base}>
              <span className="w-fit rounded-full bg-bg-primary px-3 py-1 text-caption font-body text-accent-primary">
                {PRODUCT_GRADE_LABELS[grade]}
              </span>
              <p className="mt-3 text-body-sm font-body text-neutral-silver">
                {PRODUCT_GRADE_DESCRIPTIONS[grade]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <div className="mx-auto max-w-2xl rounded-xl border border-neutral-titanium/20 bg-bg-secondary p-8 text-center tablet:p-12">
          <h2 className="text-h3 font-heading font-bold text-neutral-white">
            Extending the life of technology responsibly.
          </h2>
          <p className="mt-4 text-body-md font-body text-neutral-light-gray">
            Every refurbished device you choose helps prevent electronic waste from entering landfills and
            reduces the raw materials and energy required to manufacture something new.
          </p>
          <Link
            href="/shop"
            className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-6 inline-flex items-center justify-center text-body-md')}
          >
            Shop Refurbished Devices
          </Link>
        </div>
      </section>
    </>
  );
}
