import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/api';
import { cn, spacing } from '@/design';
import ScrollReveal from '@/components/animations/ScrollReveal';
import FeaturedProductRail from './FeaturedProductRail';

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className={cn(spacing.containerPadding, 'mx-auto max-w-[1440px] py-24 tablet:py-28 desktop:py-32')}>
      <ScrollReveal className="flex flex-col items-start justify-between gap-6 tablet:flex-row tablet:items-end">
        <div>
          <p className="text-label-sm font-body font-semibold uppercase tracking-[0.24em] text-accent-primary">Collection</p>
          <h2 className="mt-3 text-[clamp(2.5rem,5vw,4.5rem)] font-heading font-bold leading-none text-neutral-white">Featured Devices</h2>
          <p className="mt-4 max-w-xl text-body-lg font-body leading-8 text-neutral-silver">
            Hand-picked, professionally graded, ready to ship.
          </p>
        </div>
        <Link href="/shop" className="rounded-full border border-accent-primary/20 px-5 py-3 text-body-sm font-body font-semibold text-accent-primary transition-colors duration-300 hover:bg-accent-primary hover:text-bg-primary">
          Shop all devices &rarr;
        </Link>
      </ScrollReveal>

      <ScrollReveal className="mt-12" from={{ opacity: 0, x: 80 }} to={{ opacity: 1, x: 0 }} start="top 92%" end="bottom 45%">
        <FeaturedProductRail products={products} />
      </ScrollReveal>
    </section>
  );
}
