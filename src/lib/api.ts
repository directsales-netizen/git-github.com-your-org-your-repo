import type { Product, ProductFilters } from '@/types/product';
import type { Testimonial } from '@/types/testimonial';

const PAGE_SIZE = 20;

// Placeholder data until the catalog API is wired up.
// The first 6 entries are the original featured products — kept identical
// (id/slug/price/etc.) so getFeaturedProducts()'s output doesn't change.
const ALL_PRODUCTS: Product[] = [
  { id: '1', slug: 'macbook-pro-14-m2', title: 'MacBook Pro 14" M2', category: 'MacBooks', grade: 'A', price: 1449, originalPrice: 1999, imageAlt: 'MacBook Pro 14 inch, space gray', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: '2025-09-02', popularity: 88 },
  { id: '2', slug: 'iphone-14-pro', title: 'iPhone 14 Pro', category: 'iPhones', grade: 'A', price: 649, originalPrice: 999, imageAlt: 'iPhone 14 Pro, deep purple', imageColor: 'from-secondary-primary/30 to-bg-tertiary', dateAdded: '2025-09-14', popularity: 95 },
  { id: '3', slug: 'ipad-air-5th-gen', title: 'iPad Air (5th Gen)', category: 'iPads', grade: 'B', price: 429, originalPrice: 599, imageAlt: 'iPad Air, blue finish', imageColor: 'from-accent-primary/30 to-bg-tertiary', dateAdded: '2025-09-26', popularity: 72 },
  { id: '4', slug: 'macbook-air-m1', title: 'MacBook Air M1', category: 'MacBooks', grade: 'B', price: 749, originalPrice: 999, imageAlt: 'MacBook Air M1, silver', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: '2025-10-08', popularity: 65 },
  { id: '5', slug: 'iphone-13', title: 'iPhone 13', category: 'iPhones', grade: 'B', price: 399, originalPrice: 599, imageAlt: 'iPhone 13, midnight', imageColor: 'from-secondary-primary/20 to-bg-tertiary', dateAdded: '2025-10-20', popularity: 80 },
  { id: '6', slug: 'imac-24-m1', title: 'iMac 24" M1', category: 'iMacs', grade: 'A', price: 999, originalPrice: 1299, imageAlt: 'iMac 24 inch, blue', imageColor: 'from-accent-dark/30 to-bg-tertiary', dateAdded: '2025-11-01', popularity: 90 },

  { id: '7', slug: 'macbook-pro-16-m3', title: 'MacBook Pro 16" M3', category: 'MacBooks', grade: 'A', price: 2299, originalPrice: 2499, imageAlt: 'MacBook Pro 16 inch, space black', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: '2025-11-10', popularity: 76 },
  { id: '8', slug: 'macbook-air-m2', title: 'MacBook Air M2', category: 'MacBooks', grade: 'B', price: 899, imageAlt: 'MacBook Air M2, midnight', imageColor: 'from-secondary-primary/30 to-bg-tertiary', dateAdded: '2025-11-19', popularity: 60 },
  { id: '9', slug: 'macbook-pro-13-m1', title: 'MacBook Pro 13" M1', category: 'MacBooks', grade: 'C', price: 714, imageAlt: 'MacBook Pro 13 inch, silver', imageColor: 'from-accent-primary/30 to-bg-tertiary', dateAdded: '2025-11-28', popularity: 45 },
  { id: '10', slug: 'macbook-air-13-2020', title: 'MacBook Air 13" (2020)', category: 'MacBooks', grade: 'D', price: 420, imageAlt: 'MacBook Air 13 inch, gold', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: '2025-12-07', popularity: 30 },
  { id: '11', slug: 'macbook-pro-15-2019', title: 'MacBook Pro 15" (2019)', category: 'MacBooks', grade: 'C', price: 989, imageAlt: 'MacBook Pro 15 inch, space gray', imageColor: 'from-secondary-primary/20 to-bg-tertiary', dateAdded: '2025-12-16', popularity: 50 },

  { id: '12', slug: 'imac-24-m3', title: 'iMac 24" M3', category: 'iMacs', grade: 'A', price: 1379, originalPrice: 1499, imageAlt: 'iMac 24 inch, silver', imageColor: 'from-accent-dark/30 to-bg-tertiary', dateAdded: '2025-12-25', popularity: 85 },
  { id: '13', slug: 'imac-21-2019', title: 'iMac 21.5" (2019)', category: 'iMacs', grade: 'B', price: 824, imageAlt: 'iMac 21.5 inch, silver', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: '2026-01-03', popularity: 55 },
  { id: '14', slug: 'imac-27-2020', title: 'iMac 27" (2020)', category: 'iMacs', grade: 'B', price: 1349, imageAlt: 'iMac 27 inch, silver', imageColor: 'from-secondary-primary/30 to-bg-tertiary', dateAdded: '2026-01-12', popularity: 70 },
  { id: '15', slug: 'imac-21-2017', title: 'iMac 21.5" (2017)', category: 'iMacs', grade: 'C', price: 604, imageAlt: 'iMac 21.5 inch, silver', imageColor: 'from-accent-primary/30 to-bg-tertiary', dateAdded: '2026-01-21', popularity: 40 },
  { id: '16', slug: 'imac-27-2015', title: 'iMac 27" (2015)', category: 'iMacs', grade: 'D', price: 756, imageAlt: 'iMac 27 inch, silver', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: '2026-01-30', popularity: 25 },

  { id: '17', slug: 'ipad-pro-12-m2', title: 'iPad Pro 12.9" M2', category: 'iPads', grade: 'A', price: 1011, originalPrice: 1099, imageAlt: 'iPad Pro 12.9 inch, space gray', imageColor: 'from-secondary-primary/20 to-bg-tertiary', dateAdded: '2026-02-08', popularity: 82 },
  { id: '18', slug: 'ipad-pro-11-m1', title: 'iPad Pro 11" M1', category: 'iPads', grade: 'A', price: 735, imageAlt: 'iPad Pro 11 inch, silver', imageColor: 'from-accent-dark/30 to-bg-tertiary', dateAdded: '2026-02-17', popularity: 68 },
  { id: '19', slug: 'ipad-9th-gen', title: 'iPad (9th Gen)', category: 'iPads', grade: 'B', price: 247, imageAlt: 'iPad 9th generation, space gray', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: '2026-02-26', popularity: 58 },
  { id: '20', slug: 'ipad-air-4th-gen', title: 'iPad Air (4th Gen)', category: 'iPads', grade: 'C', price: 329, imageAlt: 'iPad Air 4th generation, green', imageColor: 'from-secondary-primary/30 to-bg-tertiary', dateAdded: '2026-03-07', popularity: 38 },
  { id: '21', slug: 'ipad-mini-5th-gen', title: 'iPad Mini (5th Gen)', category: 'iPads', grade: 'D', price: 168, imageAlt: 'iPad Mini 5th generation, space gray', imageColor: 'from-accent-primary/30 to-bg-tertiary', dateAdded: '2026-03-16', popularity: 20 },

  { id: '22', slug: 'iphone-15-pro', title: 'iPhone 15 Pro', category: 'iPhones', grade: 'A', price: 919, originalPrice: 999, imageAlt: 'iPhone 15 Pro, natural titanium', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: '2026-03-25', popularity: 93 },
  { id: '23', slug: 'iphone-13-mini', title: 'iPhone 13 Mini', category: 'iPhones', grade: 'B', price: 449, imageAlt: 'iPhone 13 Mini, pink', imageColor: 'from-secondary-primary/20 to-bg-tertiary', dateAdded: '2026-04-03', popularity: 62 },
  { id: '24', slug: 'iphone-12', title: 'iPhone 12', category: 'iPhones', grade: 'C', price: 384, imageAlt: 'iPhone 12, blue', imageColor: 'from-accent-dark/30 to-bg-tertiary', dateAdded: '2026-04-12', popularity: 48 },
  { id: '25', slug: 'iphone-se-2020', title: 'iPhone SE (2020)', category: 'iPhones', grade: 'D', price: 168, imageAlt: 'iPhone SE 2nd generation, white', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: '2026-04-21', popularity: 22 },
  { id: '26', slug: 'iphone-11', title: 'iPhone 11', category: 'iPhones', grade: 'C', price: 329, imageAlt: 'iPhone 11, black', imageColor: 'from-secondary-primary/30 to-bg-tertiary', dateAdded: '2026-04-30', popularity: 35 },

  { id: '27', slug: 'dell-xps-13', title: 'Dell XPS 13', category: 'Windows PCs', grade: 'A', price: 1195, originalPrice: 1299, imageAlt: 'Dell XPS 13, platinum silver', imageColor: 'from-accent-primary/30 to-bg-tertiary', dateAdded: '2026-05-09', popularity: 77 },
  { id: '28', slug: 'lenovo-thinkpad-x1-carbon', title: 'Lenovo ThinkPad X1 Carbon', category: 'Windows PCs', grade: 'A', price: 1471, imageAlt: 'Lenovo ThinkPad X1 Carbon, black', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: '2026-05-18', popularity: 83 },
  { id: '29', slug: 'hp-spectre-x360', title: 'HP Spectre x360', category: 'Windows PCs', grade: 'B', price: 1049, imageAlt: 'HP Spectre x360, nightfall black', imageColor: 'from-secondary-primary/20 to-bg-tertiary', dateAdded: '2026-05-27', popularity: 59 },
  { id: '30', slug: 'dell-latitude-7410', title: 'Dell Latitude 7410', category: 'Windows PCs', grade: 'C', price: 659, imageAlt: 'Dell Latitude 7410, black', imageColor: 'from-accent-dark/30 to-bg-tertiary', dateAdded: '2026-06-05', popularity: 41 },
  { id: '31', slug: 'lenovo-ideapad-3', title: 'Lenovo IdeaPad 3', category: 'Windows PCs', grade: 'D', price: 231, imageAlt: 'Lenovo IdeaPad 3, abyss blue', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: '2026-06-10', popularity: 27 },

  { id: '32', slug: 'apple-magic-keyboard', title: 'Apple Magic Keyboard', category: 'Accessories', grade: 'A', price: 275, originalPrice: 299, imageAlt: 'Apple Magic Keyboard, white', imageColor: 'from-secondary-primary/30 to-bg-tertiary', dateAdded: '2026-06-14', popularity: 66 },
  { id: '33', slug: 'apple-watch-series-8', title: 'Apple Watch Series 8', category: 'Accessories', grade: 'B', price: 299, imageAlt: 'Apple Watch Series 8, midnight', imageColor: 'from-accent-primary/30 to-bg-tertiary', dateAdded: '2026-06-18', popularity: 53 },
  { id: '34', slug: 'airpods-pro-2nd-gen', title: 'AirPods Pro (2nd Gen)', category: 'Accessories', grade: 'B', price: 187, imageAlt: 'AirPods Pro 2nd generation, white', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: '2026-06-22', popularity: 71 },
  { id: '35', slug: 'anker-usb-c-hub', title: 'Anker USB-C Hub', category: 'Accessories', grade: 'C', price: 32, imageAlt: 'Anker USB-C Hub, gray', imageColor: 'from-secondary-primary/20 to-bg-tertiary', dateAdded: '2026-06-26', popularity: 33 },
  { id: '36', slug: 'logitech-mx-master-3', title: 'Logitech MX Master 3', category: 'Accessories', grade: 'D', price: 42, imageAlt: 'Logitech MX Master 3, graphite', imageColor: 'from-accent-dark/30 to-bg-tertiary', dateAdded: '2026-06-30', popularity: 18 },
];

const TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Maria S.', location: 'Austin, TX', quote: 'The MacBook Pro I bought looked and performed like new. Grading was spot on, and the 30-day warranty gave me real peace of mind.', rating: 5, device: 'MacBook Pro 14"' },
  { id: '2', name: 'Devon K.', location: 'Portland, OR', quote: 'Every port worked, battery health was exactly as listed, and it shipped faster than expected. Easy way to save money without a compromise.', rating: 5, device: 'iPhone 14 Pro' },
  { id: '3', name: 'Priya R.', location: 'Chicago, IL', quote: 'I liked knowing exactly what “Grade B” meant before I bought — no surprises when it arrived. Will buy from them again.', rating: 4, device: 'iPad Air' },
];

export async function getFeaturedProducts(): Promise<Product[]> {
  return ALL_PRODUCTS.slice(0, 6);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS;
}

export async function getProducts(filters: ProductFilters = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const {
    category,
    grade,
    priceMin,
    priceMax,
    discounted,
    search,
    sort = 'newest',
    page: requestedPage,
  } = filters;

  let results = ALL_PRODUCTS;

  if (category) results = results.filter((product) => product.category === category);
  if (grade) results = results.filter((product) => product.grade === grade);
  if (priceMin !== undefined) results = results.filter((product) => product.price >= priceMin);
  if (priceMax !== undefined) results = results.filter((product) => product.price <= priceMax);
  if (discounted) {
    results = results.filter(
      (product) => product.originalPrice !== undefined && product.originalPrice > product.price
    );
  }
  if (search) {
    const query = search.trim().toLowerCase();
    if (query) {
      results = results.filter((product) => product.title.toLowerCase().includes(query));
    }
  }

  const sorted = [...results].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'popular':
        return b.popularity - a.popularity;
      case 'newest':
      default:
        return b.dateAdded.localeCompare(a.dateAdded);
    }
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(requestedPage ?? 1, 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const products = sorted.slice(start, start + PAGE_SIZE);

  return { products, total, page, pageSize: PAGE_SIZE, totalPages };
}
