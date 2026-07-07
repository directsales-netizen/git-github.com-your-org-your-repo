import type { ProductCategory } from '@/types/product';

export interface CollectionMeta {
  slug: string;
  category: ProductCategory;
  title: string;
  description: string;
  heroGradient: string;
}

export const COLLECTIONS: CollectionMeta[] = [
  {
    slug: 'macbooks',
    category: 'MacBooks',
    title: 'MacBooks',
    description: 'Professionally tested MacBook Air and MacBook Pro models, honestly graded and backed by a 30-day warranty.',
    heroGradient: 'from-neutral-titanium/40 to-bg-tertiary',
  },
  {
    slug: 'imacs',
    category: 'iMacs',
    title: 'iMacs',
    description: 'Refurbished iMac desktops, fully tested for display quality and performance before they ship.',
    heroGradient: 'from-accent-dark/30 to-bg-tertiary',
  },
  {
    slug: 'ipads',
    category: 'iPads',
    title: 'iPads',
    description: 'iPad and iPad Pro models across every grade, with battery health and screen condition clearly listed.',
    heroGradient: 'from-accent-primary/30 to-bg-tertiary',
  },
  {
    slug: 'iphones',
    category: 'iPhones',
    title: 'iPhones',
    description: 'Professionally graded iPhones with verified battery health, full functionality testing, and honest condition photos.',
    heroGradient: 'from-secondary-primary/30 to-bg-tertiary',
  },
  {
    slug: 'windows-pcs',
    category: 'Windows PCs',
    title: 'Windows PCs',
    description: 'Refurbished laptops and desktops from Dell, Lenovo, and HP, tested and graded for reliable everyday use.',
    heroGradient: 'from-secondary-primary/20 to-bg-tertiary',
  },
  {
    slug: 'accessories',
    category: 'Accessories',
    title: 'Accessories',
    description: 'Chargers, keyboards, watches, and other tested accessories to go with your next device.',
    heroGradient: 'from-neutral-silver/30 to-bg-tertiary',
  },
];

export function getCollectionBySlug(slug: string): CollectionMeta | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}
