import type { Product } from '@/types/product';
import type { Testimonial } from '@/types/testimonial';

// Placeholder data until the catalog API is wired up.
const FEATURED_PRODUCTS: Product[] = [
  { id: '1', slug: 'macbook-pro-14-m2', title: 'MacBook Pro 14" M2', category: 'MacBooks', grade: 'A', price: 1449, originalPrice: 1999, imageAlt: 'MacBook Pro 14 inch, space gray', imageColor: 'from-neutral-titanium/40 to-bg-tertiary' },
  { id: '2', slug: 'iphone-14-pro', title: 'iPhone 14 Pro', category: 'iPhones', grade: 'A', price: 649, originalPrice: 999, imageAlt: 'iPhone 14 Pro, deep purple', imageColor: 'from-secondary-primary/30 to-bg-tertiary' },
  { id: '3', slug: 'ipad-air-5th-gen', title: 'iPad Air (5th Gen)', category: 'iPads', grade: 'B', price: 429, originalPrice: 599, imageAlt: 'iPad Air, blue finish', imageColor: 'from-accent-primary/30 to-bg-tertiary' },
  { id: '4', slug: 'macbook-air-m1', title: 'MacBook Air M1', category: 'MacBooks', grade: 'B', price: 749, originalPrice: 999, imageAlt: 'MacBook Air M1, silver', imageColor: 'from-neutral-silver/30 to-bg-tertiary' },
  { id: '5', slug: 'iphone-13', title: 'iPhone 13', category: 'iPhones', grade: 'B', price: 399, originalPrice: 599, imageAlt: 'iPhone 13, midnight', imageColor: 'from-secondary-primary/20 to-bg-tertiary' },
  { id: '6', slug: 'imac-24-m1', title: 'iMac 24" M1', category: 'iMacs', grade: 'A', price: 999, originalPrice: 1299, imageAlt: 'iMac 24 inch, blue', imageColor: 'from-accent-dark/30 to-bg-tertiary' },
];

const TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Maria S.', location: 'Austin, TX', quote: 'The MacBook Pro I bought looked and performed like new. Grading was spot on, and the 30-day warranty gave me real peace of mind.', rating: 5, device: 'MacBook Pro 14"' },
  { id: '2', name: 'Devon K.', location: 'Portland, OR', quote: 'Every port worked, battery health was exactly as listed, and it shipped faster than expected. Easy way to save money without a compromise.', rating: 5, device: 'iPhone 14 Pro' },
  { id: '3', name: 'Priya R.', location: 'Chicago, IL', quote: 'I liked knowing exactly what “Grade B” meant before I bought — no surprises when it arrived. Will buy from them again.', rating: 4, device: 'iPad Air' },
];

export async function getFeaturedProducts(): Promise<Product[]> {
  return FEATURED_PRODUCTS;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS;
}
