import type { SiteContentSettings } from '@/types/admin';
import type { Testimonial } from '@/types/testimonial';
import { addTestimonialRecord, deleteTestimonialRecord, updateTestimonialRecord } from '@/lib/api';
import { globalBox } from '@/lib/globalStore';

const contentBox = globalBox('siteContent', (): SiteContentSettings => ({
  heroHeadline: 'Premium Technology. Smarter Value. Sustainable Impact.',
  heroSubheadline: 'Professionally tested, responsibly sourced refurbished devices — backed by honest grading and a 30-day warranty.',
  heroCtaLabel: 'Shop All Devices',
  promoBannerEnabled: false,
  promoBannerText: 'Free shipping on all orders this week.',
}));

export async function getSiteContent(): Promise<SiteContentSettings> {
  return contentBox.current;
}

export async function updateSiteContent(patch: Partial<SiteContentSettings>): Promise<SiteContentSettings> {
  contentBox.current = { ...contentBox.current, ...patch };
  return contentBox.current;
}

// Testimonials CRUD — src/lib/api.ts's TESTIMONIALS array is the read path
// used by the storefront; these functions mutate that same store so admin
// edits show up there immediately (single source of truth, no duplication).
export async function addTestimonial(input: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  return addTestimonialRecord(input);
}

export async function updateTestimonial(id: string, patch: Partial<Omit<Testimonial, 'id'>>): Promise<Testimonial | null> {
  return updateTestimonialRecord(id, patch);
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  return deleteTestimonialRecord(id);
}
