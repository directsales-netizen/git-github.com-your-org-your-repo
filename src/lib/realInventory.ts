import type { Product } from '@/types/product';

type ProductRecord = Omit<Product, 'stock' | 'lowStockThreshold'>;

/**
 * Real on-hand inventory imported from Inventory_Sales_Analytics.xlsx
 * (Inventory tab). Price = the sheet's "Resale Mid" rounded up to the dollar.
 * Grade is a default (the sheet has no condition column): B for working
 * units, D for for-parts units — adjust per item in the admin dashboard.
 * imageUrl is only set where an existing /products photo matches the model;
 * the rest fall back to the gradient placeholder until real photos are added.
 */
const ADDED = '2026-10-17';

export const REAL_INVENTORY: ProductRecord[] = [
  { id: '101', slug: 'imac-27-2009', title: 'iMac 27" (2009)', category: 'iMacs', grade: 'B', price: 55, imageAlt: 'iMac 27 inch, 2009', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', imageUrl: '/products/inventory-references/iMac_27_2009.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '102', slug: 'imac-27-2014', title: 'iMac 27" (2014)', category: 'iMacs', grade: 'B', price: 150, imageAlt: 'iMac 27 inch, 2014, silver', imageColor: 'from-neutral-silver/30 to-bg-tertiary', imageUrl: '/products/inventory-references/iMac_27_2014.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '103', slug: 'imac-27-2013-needs-logic-board', title: 'iMac 27" (2013) — Needs Logic Board', category: 'iMacs', grade: 'D', price: 105, imageAlt: 'iMac 27 inch, 2013', imageColor: 'from-neutral-silver/30 to-bg-tertiary', imageUrl: '/products/inventory-references/iMac_27_2014.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '104', slug: 'imac-21-5', title: 'iMac 21.5"', category: 'iMacs', grade: 'B', price: 45, imageAlt: 'iMac 21.5 inch', imageColor: 'from-accent-primary/30 to-bg-tertiary', dateAdded: ADDED, popularity: 50 },
  { id: '105', slug: 'imac-21-5-2011', title: 'iMac 21.5" (2011)', category: 'iMacs', grade: 'B', price: 40, imageAlt: 'iMac 21.5 inch, 2011', imageColor: 'from-accent-primary/30 to-bg-tertiary', imageUrl: '/products/inventory-references/iMac_21_5_2011.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '106', slug: 'imac-21-5-2009', title: 'iMac 21.5" (2009)', category: 'iMacs', grade: 'B', price: 33, imageAlt: 'iMac 21.5 inch, 2009', imageColor: 'from-accent-primary/30 to-bg-tertiary', imageUrl: '/products/inventory-references/iMac_21_5_2009.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '107', slug: 'imac-21-5-2014-for-parts', title: 'iMac 21.5" (2014) — For Parts / Not Working', category: 'iMacs', grade: 'D', price: 23, imageAlt: 'iMac 21.5 inch, 2014', imageColor: 'from-neutral-silver/30 to-bg-tertiary', imageUrl: '/products/inventory-references/iMac_21_5_2014.jpg', dateAdded: ADDED, popularity: 50 },

  { id: '108', slug: 'iphone-13-unit', title: 'iPhone 13', category: 'iPhones', grade: 'B', price: 255, imageAlt: 'iPhone 13', imageColor: 'from-secondary-primary/20 to-bg-tertiary', imageUrl: '/products/inventory-references/iPhone_13_reference.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '109', slug: 'iphone-6s-plus', title: 'iPhone 6S Plus (Silver / Gold / Rose Gold)', category: 'iPhones', grade: 'B', price: 33, imageAlt: 'iPhone 6S Plus', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: ADDED, popularity: 50 },
  { id: '110', slug: 'iphone-5-unlocked', title: 'iPhone 5 — Unlocked, Modified OS (No Box)', category: 'iPhones', grade: 'C', price: 80, imageAlt: 'iPhone 5', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', imageUrl: '/products/inventory-references/iPhone_5_model_colors.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '111', slug: 'iphone-7', title: 'iPhone 7', category: 'iPhones', grade: 'B', price: 53, imageAlt: 'iPhone 7', imageColor: 'from-secondary-primary/30 to-bg-tertiary', imageUrl: '/products/inventory-references/iPhone_7_model_colors.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '112', slug: 'iphone-7-plus-product-red', title: 'iPhone 7 Plus (PRODUCT)RED', category: 'iPhones', grade: 'B', price: 65, imageAlt: 'iPhone 7 Plus, red', imageColor: 'from-accent-dark/30 to-bg-tertiary', imageUrl: '/products/inventory-references/iPhone_7_Plus_PRODUCT_RED.jpg', dateAdded: ADDED, popularity: 50 },

  { id: '113', slug: 'macbook-pro-2017', title: 'MacBook Pro (2017)', category: 'MacBooks', grade: 'B', price: 220, imageAlt: 'MacBook Pro, 2017', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: ADDED, popularity: 50 },
  { id: '114', slug: 'macbook-pro-2016', title: 'MacBook Pro (2016)', category: 'MacBooks', grade: 'B', price: 205, imageAlt: 'MacBook Pro, 2016', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: ADDED, popularity: 50 },
  { id: '115', slug: 'macbook-pro-2019-touch-bar', title: 'MacBook Pro (2019) — Touch Bar', category: 'MacBooks', grade: 'B', price: 330, imageAlt: 'MacBook Pro 2019 with Touch Bar, space gray', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', dateAdded: ADDED, popularity: 50 },
  { id: '116', slug: 'macbook-air-2014', title: 'MacBook Air (2014)', category: 'MacBooks', grade: 'B', price: 115, imageAlt: 'MacBook Air, 2014, silver', imageColor: 'from-neutral-silver/30 to-bg-tertiary', dateAdded: ADDED, popularity: 50 },

  { id: '117', slug: 'airpods-4th-gen', title: 'AirPods (4th Gen)', category: 'Accessories', grade: 'B', price: 75, imageAlt: 'AirPods 4th generation, white', imageColor: 'from-neutral-silver/30 to-bg-tertiary', imageUrl: '/products/inventory-references/AirPods_4_reference.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '118', slug: 'airpods-pro-2', title: 'AirPods Pro (2nd Gen)', category: 'Accessories', grade: 'B', price: 85, imageAlt: 'AirPods Pro 2nd generation, white', imageColor: 'from-neutral-silver/30 to-bg-tertiary', imageUrl: '/products/inventory-references/AirPods_Pro_2nd_Gen_reference.jpg', dateAdded: ADDED, popularity: 50 },
  { id: '119', slug: 'apple-thunderbolt-display', title: 'Apple Thunderbolt Display', category: 'Accessories', grade: 'B', price: 55, imageAlt: 'Apple Thunderbolt Display', imageColor: 'from-neutral-titanium/40 to-bg-tertiary', imageUrl: '/products/inventory-references/Thunderbolt_Display_reference.png', dateAdded: ADDED, popularity: 50 },
];

/** On-hand quantities from the sheet's Qty column (the two 21.5" 2011 rows are merged into one listing). */
export const REAL_INVENTORY_STOCK: Record<string, number> = {
  '101': 1, '102': 1, '103': 1, '104': 1, '105': 2, '106': 1, '107': 1,
  '108': 1, '109': 3, '110': 6, '111': 3, '112': 2,
  '113': 1, '114': 1, '115': 1, '116': 1,
  '117': 6, '118': 6, '119': 2,
};
