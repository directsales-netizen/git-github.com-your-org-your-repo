import type { Metadata } from 'next';
import Link from 'next/link';
import { IMPACT_METRICS, REFURBISHMENT_STEPS } from '@/lib/sustainability';
import { PRODUCT_GRADE_DESCRIPTIONS, PRODUCT_GRADE_LABELS, type ProductGrade } from '@/types/product';
import { buttonVariants, cn, grid, spacing } from '@/design';
import Fade from '@/components/animations/Fade';
import GlassCard from '@/components/animations/GlassCard';
import RefurbishmentPinSection from './RefurbishmentPinSection';

export const metadata: Metadata = {
  title: 'Sustainability — Premium TechNoir',
  description:
    'How Premium TechNoir extends the life of technology responsibly — our refurbishment process, honest condition grading, and measurable environmental impact.',
};

const GRADES: ProductGrade[] = ['A', 'B', 'C', 'D'];

export default function SustainabilityPage() {
  return (
    <>
      <Fade variant="up">
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
      </Fade>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <div className={cn(grid.threeCol)}>
          {IMPACT_METRICS.map((metric, index) => (
            <Fade key={metric.label} variant="up" transition={{ delay: index * 0.08 }}>
              <GlassCard className="p-6 text-center">
                <p className="text-h3 font-heading font-bold text-accent-primary">{metric.value}</p>
                <p className="mt-2 text-body-sm font-body text-neutral-silver">{metric.label}</p>
              </GlassCard>
            </Fade>
          ))}
        </div>
      </section>

      <Fade variant="up">
        <section className={cn(spacing.containerPadding, 'mx-auto max-w-[1440px]')}>
          <h2 className="text-h2 font-heading font-bold text-neutral-white">How Refurbishment Works</h2>
          <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
            Every device follows the same four-step process before it&apos;s listed for sale. Scroll to walk
            through it.
          </p>
        </section>
      </Fade>

      <RefurbishmentPinSection steps={REFURBISHMENT_STEPS} />

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <Fade variant="up">
          <h2 className="text-h2 font-heading font-bold text-neutral-white">What Our Grades Mean</h2>
          <p className="mt-4 max-w-2xl text-body-lg font-body text-neutral-light-gray">
            Every listing shows a transparent condition grade so you know exactly what you&apos;re getting —
            no surprises when it arrives.
          </p>
        </Fade>

        <div className={cn(grid.fourCol, 'mt-12')}>
          {GRADES.map((grade, index) => (
            <Fade key={grade} variant="up" transition={{ delay: index * 0.08 }}>
              <GlassCard className="p-6">
                <span className="w-fit rounded-full bg-bg-primary px-3 py-1 text-caption font-body text-accent-primary">
                  {PRODUCT_GRADE_LABELS[grade]}
                </span>
                <p className="mt-3 text-body-sm font-body text-neutral-silver">
                  {PRODUCT_GRADE_DESCRIPTIONS[grade]}
                </p>
              </GlassCard>
            </Fade>
          ))}
        </div>
      </section>

      <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
        <Fade variant="scale" className="mx-auto max-w-2xl">
          <GlassCard className="p-8 text-center tablet:p-12">
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
          </GlassCard>
        </Fade>
      </section>
    </>
  );
}
