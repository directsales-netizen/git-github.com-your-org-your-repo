/**
 * Motion durations, in seconds (Framer Motion + GSAP both take seconds).
 * `fast`/`base`/`slow` intentionally match the ms values already defined in
 * src/design/tokens.ts (micro-interactions: hovers, toggles, focus states) —
 * this file adds the longer, cinematic durations that belong to page-level
 * motion (hero reveals, scroll-triggered sequences) rather than component
 * micro-interactions, which stay on the design-token durations.
 */

export const durations = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
  reveal: 0.8,
  cinematic: 1.2,
} as const;

export const staggerStep = 0.08;
