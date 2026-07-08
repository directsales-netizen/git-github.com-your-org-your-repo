import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import { COLLECTIONS } from '@/lib/collections';
import { accessibility, cardVariants, cn, grid, spacing } from '@/design';

export const metadata: Metadata = {
  title: 'Collections — Premium TechNoir',
  description: 'Browse refurbished devices by category — MacBooks, iMacs, iPads, iPhones, Windows PCs, and accessories.',
};

export default async function CollectionsPage() {
  const counts = await Promise.all(
    COLLECTIONS.map((collection) => getProducts({ category: collection.category }))
  );

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Collections</h1>
      <p className="mt-2 max-w-2xl text-body-lg font-body text-neutral-light-gray">
        Browse professionally tested, honestly graded devices by category.
      </p>

      <div className={cn(grid.threeCol, 'mt-10')}>
        {COLLECTIONS.map((collection, index) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className={cn(cardVariants.base, 'flex flex-col', accessibility.focusRing)}
          >
            <div
              aria-hidden="true"
              className={cn('aspect-[3/1] w-full rounded-md bg-gradient-to-br', collection.heroGradient)}
            />
            <h2 className="mt-4 text-h5 font-heading font-semibold text-neutral-white">{collection.title}</h2>
            <p className="mt-2 text-body-sm font-body text-neutral-silver">{collection.description}</p>
            <p className="mt-4 text-body-sm font-body font-semibold text-accent-primary">
              {counts[index].total} {counts[index].total === 1 ? 'device' : 'devices'}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
