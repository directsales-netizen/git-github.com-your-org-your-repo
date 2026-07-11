import Link from 'next/link';
import { IMPACT_METRICS } from '@/lib/sustainability';
import { cn, grid, spacing } from '@/design';
import Fade from '@/components/animations/Fade';
import GlassCard from '@/components/animations/GlassCard';

export default function Sustainability() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <div className="grid grid-cols-1 gap-12 desktop:grid-cols-2 desktop:items-center">
        <Fade variant="left">
          <h2 className="text-h2 font-heading font-bold text-neutral-white">
            Extending the life of technology responsibly.
          </h2>
          <p className="mt-4 text-body-lg font-body text-neutral-light-gray">
            Every refurbished device we sell goes through professional testing and repair rather than
            being discarded. That means fewer raw materials mined, less energy spent manufacturing new
            devices, and less electronic waste headed to landfills.
          </p>
          <Link
            href="/sustainability"
            className="mt-6 inline-block text-body-md font-body font-semibold text-accent-primary hover:underline"
          >
            See our full refurbishment process &rarr;
          </Link>
        </Fade>

        <div className={grid.container + ' grid-cols-1 tablet:grid-cols-3'}>
          {IMPACT_METRICS.map((metric, index) => (
            <Fade key={metric.label} variant="right" transition={{ delay: index * 0.08 }}>
              <GlassCard className="p-6 text-center">
                <p className="text-h3 font-heading font-bold text-accent-primary">{metric.value}</p>
                <p className="mt-2 text-body-sm font-body text-neutral-silver">{metric.label}</p>
              </GlassCard>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
