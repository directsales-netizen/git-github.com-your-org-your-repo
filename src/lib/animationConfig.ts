import { gsap } from 'gsap';

let scrollTriggerRegistered = false;

/**
 * Registers GSAP's ScrollTrigger plugin exactly once, on demand, client-side
 * only. Called from hooks (useParallax, useScrollReveal) rather than at
 * module load, since ScrollTrigger touches the DOM and this file may be
 * imported transitively before hydration.
 */
export async function registerGsap(): Promise<typeof gsap> {
  if (!scrollTriggerRegistered && typeof window !== 'undefined') {
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
  return gsap;
}

/** Shared ScrollTrigger defaults — one enter point, one re-trigger policy, no debug markers. */
export const scrollTriggerDefaults = {
  start: 'top 85%',
  toggleActions: 'play none none reverse',
  markers: false,
} as const;
