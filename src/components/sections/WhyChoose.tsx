import { CheckCircle2, Leaf, ShieldCheck, Wallet } from 'lucide-react';
import { cardVariants, cn, grid, spacing } from '@/design';

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
    description: 'Get premium technology at 20-60% below retail, with transparent pricing tied directly to condition grade.',
  },
  {
    icon: Leaf,
    heading: 'Sustainable Impact',
    description: 'Every refurbished device you choose extends its useful life and helps prevent electronic waste from entering landfills.',
  },
] as const;

export default function WhyChoose() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <h2 className="text-center text-h2 font-heading font-bold text-neutral-white">Why Choose Premium TechNoir</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-body-lg font-body text-neutral-light-gray">
        Trust, transparency, and quality guide every device we sell.
      </p>

      <div className={cn(grid.fourCol, 'mt-12')}>
        {VALUES.map(({ icon: Icon, heading, description }) => (
          <div key={heading} className={cardVariants.base}>
            <Icon size={28} className="text-accent-primary" aria-hidden="true" />
            <h3 className="mt-4 text-h5 font-heading font-semibold text-neutral-white">{heading}</h3>
            <p className="mt-2 text-body-sm font-body text-neutral-silver">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
