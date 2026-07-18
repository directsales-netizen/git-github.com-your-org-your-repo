import { CheckCircle2, Leaf, ShieldCheck, Wallet } from 'lucide-react';
import { cn, grid, spacing } from '@/design';
import Fade from '@/components/animations/Fade';
import GlassCard from '@/components/animations/GlassCard';

const VALUES = [
  {
    icon: CheckCircle2,
    heading: 'Professionally Tested',
    description: 'Every device passes a multi-point inspection covering battery health, screen condition, and full functionality before it ships.',
  },
  {
    icon: ShieldCheck,
    heading: 'Responsibly Sourced',
    description: 'We source devices through trusted channels and grade them honestly, so you always know exactly what you’re getting.',
  },
  {
    icon: Wallet,
    heading: 'Smarter Value',
    description: 'Get dependable technology at a transparent price, with value tied directly to condition and testing.',
  },
  {
    icon: Leaf,
    heading: 'Sustainable Impact',
    description: 'Every refurbished device you choose extends its useful life and helps prevent electronic waste from entering landfills.',
  },
] as const;

export default function WhyChoose() {
  return (
    <section className={cn(spacing.containerPadding, 'mx-auto max-w-[1440px] py-24 tablet:py-28 desktop:py-32')}>
      <Fade variant="up">
        <p className="text-center text-label-sm font-body font-semibold uppercase tracking-[0.24em] text-accent-primary">Why choose us</p>
        <h2 className="mt-3 text-center text-[clamp(2.4rem,4.8vw,4.2rem)] font-heading font-bold leading-none text-neutral-white">Built for trust.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-body-lg font-body leading-8 text-neutral-silver">
          Trust, transparency, and quality guide every device we sell.
        </p>
      </Fade>

      <div className={cn(grid.fourCol, 'mt-14')}>
        {VALUES.map(({ icon: Icon, heading, description }, index) => (
          <Fade key={heading} variant="up" transition={{ delay: index * 0.08 }}>
            <GlassCard className="h-full rounded-lg border-accent-primary/10 bg-bg-secondary/45 p-6 transition-transform duration-300 hover:-translate-y-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-md border border-accent-primary/20 bg-accent-primary/10">
                <Icon size={26} className="text-accent-primary" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-h5 font-heading font-semibold text-neutral-white">{heading}</h3>
              <p className="mt-3 text-body-sm font-body leading-6 text-neutral-silver">{description}</p>
            </GlassCard>
          </Fade>
        ))}
      </div>
    </section>
  );
}
