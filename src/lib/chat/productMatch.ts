import { getProducts } from '@/lib/api';
import type { ProductCategory, PublicProduct } from '@/types/product';

const MAX_RESULTS = 3;

const CATEGORY_KEYWORDS: { pattern: RegExp; category: ProductCategory }[] = [
  { pattern: /macbook/i, category: 'MacBooks' },
  { pattern: /\bimac\b/i, category: 'iMacs' },
  { pattern: /\bipad\b/i, category: 'iPads' },
  { pattern: /\biphone\b/i, category: 'iPhones' },
  { pattern: /windows (pc|laptop)|\bdell\b|\blenovo\b|thinkpad|\bhp\b(?! )/i, category: 'Windows PCs' },
  { pattern: /accessor|keyboard|mouse|airpods|apple watch|\bhub\b|\bcable\b/i, category: 'Accessories' },
];

/** Use-cases that benefit from newer/better-condition hardware. */
const DEMANDING_USE_CASE_PATTERN = /graphic design|video edit|photo edit|programming|coding|development|gaming|music production/i;

interface ParsedNeed {
  categories: ProductCategory[];
  priceMax?: number;
  priceMin?: number;
  demanding: boolean;
}

export function parseNeed(text: string): ParsedNeed {
  const categories = CATEGORY_KEYWORDS.filter((entry) => entry.pattern.test(text)).map((entry) => entry.category);

  // Bare "laptop" with no Apple/Windows signal — search both laptop categories.
  if (categories.length === 0 && /\blaptop\b/i.test(text)) {
    categories.push('MacBooks', 'Windows PCs');
  }

  let priceMax: number | undefined;
  let priceMin: number | undefined;

  const underMatch = text.match(/(?:under|less than|below|budget of)\s*\$?(\d[\d,]*)/i);
  if (underMatch) {
    priceMax = Number(underMatch[1].replace(/,/g, ''));
  }

  const aroundMatch = text.match(/(?:around|about)\s*\$?(\d[\d,]*)/i);
  if (aroundMatch) {
    const value = Number(aroundMatch[1].replace(/,/g, ''));
    priceMin = Math.round(value * 0.85);
    priceMax = Math.round(value * 1.15);
  }

  return {
    categories: [...new Set(categories)],
    priceMax,
    priceMin,
    demanding: DEMANDING_USE_CASE_PATTERN.test(text),
  };
}

export async function matchProducts(text: string): Promise<{ products: PublicProduct[]; need: ParsedNeed }> {
  const need = parseNeed(text);

  const categoryQueries = need.categories.length > 0 ? need.categories : [undefined];
  const results = await Promise.all(
    categoryQueries.map((category) =>
      getProducts({
        category,
        priceMin: need.priceMin,
        priceMax: need.priceMax,
        sort: 'popular',
      })
    )
  );

  let products = results.flatMap((result) => result.products);

  if (need.demanding) {
    products = [...products].sort((a, b) => {
      const gradeRank: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      return gradeRank[a.grade] - gradeRank[b.grade] || b.popularity - a.popularity;
    });
  }

  const seen = new Set<string>();
  const deduped = products.filter((product) => (seen.has(product.id) ? false : (seen.add(product.id), true)));

  return { products: deduped.slice(0, MAX_RESULTS), need };
}
