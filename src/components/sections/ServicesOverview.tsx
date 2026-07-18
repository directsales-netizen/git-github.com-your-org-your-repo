import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bot, Building2, Gauge, LockKeyhole, Network, Wrench } from 'lucide-react';
import Fade from '@/components/animations/Fade';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { accessibility, cn, spacing } from '@/design';

const STORYBOARD_IMAGE = '/images/technoir-storyboard.jpeg';

const SYSTEM_AREAS = [
  {
    title: 'Inventory Network',
    description: 'Explore professionally tested devices with clear condition, pricing, warranty, and availability details.',
    href: '/shop',
    row: 1,
    column: 3,
    Icon: Network,
    layout: 'desktop:col-span-7 desktop:row-span-2',
  },
  {
    title: 'AI Support',
    description: 'Get product guidance, service answers, and help finding the right technology for your needs.',
    href: '/support',
    row: 1,
    column: 2,
    Icon: Bot,
    layout: 'desktop:col-span-5',
  },
  {
    title: 'Admin Dashboard',
    description: 'Protected operations access for inventory, orders, customer requests, and business analytics.',
    href: '/admin',
    row: 2,
    column: 3,
    Icon: Gauge,
    layout: 'desktop:col-span-5',
  },
  {
    title: 'Repair Laboratory',
    description: 'Diagnostic-led repair support designed to extend the useful life of every serviceable device.',
    href: '/support/contact',
    row: 2,
    column: 0,
    Icon: Wrench,
    layout: 'desktop:col-span-4',
  },
  {
    title: 'Business Solutions',
    description: 'Sustainable technology sourcing and support for entrepreneurs, teams, and community organizations.',
    href: '/partnerships',
    row: 2,
    column: 1,
    Icon: Building2,
    layout: 'desktop:col-span-4',
  },
  {
    title: 'Secure Checkout',
    description: 'Move from product selection to protected payment with transparent order and support information.',
    href: '/shop',
    row: 2,
    column: 2,
    Icon: LockKeyhole,
    layout: 'desktop:col-span-4',
  },
] as const;

function storyboardPanelStyle(row: number, column: number): CSSProperties {
  return {
    backgroundImage: `url(${STORYBOARD_IMAGE})`,
    backgroundPosition: `${(column / 3) * 100}% ${(row / 3) * 100}%`,
    backgroundSize: '400% 400%',
  };
}

export default function ServicesOverview() {
  return (
    <section
      id="technoir-system"
      aria-labelledby="technoir-system-heading"
      className={cn(spacing.containerPadding, 'mx-auto max-w-[1440px] py-24 tablet:py-28 desktop:py-32')}
    >
      <ScrollReveal className="max-w-3xl">
        <p className="text-label-sm font-body font-semibold uppercase text-accent-primary">The TechNoir system</p>
        <h2
          id="technoir-system-heading"
          className="mt-3 text-[clamp(2.4rem,4.8vw,4.2rem)] font-heading font-bold leading-none text-neutral-white"
        >
          One connected technology ecosystem.
        </h2>
        <p className="mt-5 max-w-2xl text-body-lg font-body leading-8 text-neutral-silver">
          From inventory and repair to protected purchasing and ongoing support, every part of the experience works together.
        </p>
      </ScrollReveal>

      <div className="mt-14 grid grid-cols-1 gap-3 tablet:grid-cols-2 desktop:grid-cols-12 desktop:auto-rows-[220px]">
        {SYSTEM_AREAS.map(({ title, description, href, row, column, Icon, layout }, index) => (
          <Fade key={title} variant="up" className={cn('min-h-[230px] tablet:min-h-[240px] desktop:min-h-0', layout)} transition={{ delay: index * 0.06 }}>
            <Link
              href={href}
              aria-label={`${title}: ${description}`}
              className={cn(
                'group relative isolate block h-full overflow-hidden rounded-md border border-neutral-titanium/30 bg-bg-secondary',
                accessibility.focusRing
              )}
            >
              <span
                aria-hidden="true"
                style={storyboardPanelStyle(row, column)}
                className="absolute inset-0 bg-no-repeat transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-bg-primary/20 transition-colors duration-300 group-hover:bg-bg-primary/5" />

              <span className="absolute inset-x-0 top-0 flex min-h-14 items-center gap-3 bg-bg-primary/95 px-5 py-3">
                <Icon size={20} className="shrink-0 text-accent-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-body-md font-heading font-semibold text-neutral-white">{title}</span>
                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-neutral-silver transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-primary"
                  aria-hidden="true"
                />
              </span>

              <span className="absolute inset-x-0 bottom-0 bg-bg-primary/90 px-5 py-4 text-body-sm font-body leading-6 text-neutral-light-gray">
                {description}
              </span>
            </Link>
          </Fade>
        ))}
      </div>
    </section>
  );
}
