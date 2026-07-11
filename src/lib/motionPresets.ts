import type { Variants } from 'framer-motion';
import { durations, staggerStep } from './durations';
import { easeOut } from './easing';

export type FadeDirection = 'up' | 'down' | 'left' | 'right';

const OFFSET = 24;

function directionOffset(direction: FadeDirection): { x?: number; y?: number } {
  switch (direction) {
    case 'up':
      return { y: OFFSET };
    case 'down':
      return { y: -OFFSET };
    case 'left':
      return { x: OFFSET };
    case 'right':
      return { x: -OFFSET };
  }
}

export function fadeVariants(direction: FadeDirection = 'up', duration: number = durations.reveal): Variants {
  return {
    hidden: { opacity: 0, ...directionOffset(direction) },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration, ease: easeOut } },
  };
}

export function scaleVariants(duration: number = durations.reveal): Variants {
  return {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration, ease: easeOut } },
  };
}

export function blurVariants(duration: number = durations.reveal): Variants {
  return {
    hidden: { opacity: 0, filter: 'blur(12px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration, ease: easeOut } },
  };
}

/** Reveals a mask (clip-path inset) from bottom to top — used for TextReveal/MaskReveal. */
export function maskVariants(duration: number = durations.reveal): Variants {
  return {
    hidden: { clipPath: 'inset(100% 0 0 0)' },
    visible: { clipPath: 'inset(0% 0 0 0)', transition: { duration, ease: easeOut } },
  };
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: staggerStep } },
};

/**
 * Collapses any variant set to an instant, opacity-only transition.
 * Every animation component in src/components/animations/ routes its
 * variants through this when useReducedMotion() is true, so reduced-motion
 * support is inherited automatically rather than re-implemented per
 * component (see MOTION_SYSTEM.md's Accessibility section).
 */
export function withReducedMotion(variants: Variants, reduced: boolean): Variants {
  if (!reduced) return variants;

  const collapsed: Variants = {};
  for (const [key, state] of Object.entries(variants)) {
    if (state && typeof state === 'object') {
      const opacity = 'opacity' in state ? (state as { opacity?: number }).opacity : 1;
      collapsed[key] = { opacity: opacity ?? 1, transition: { duration: 0.01 } };
    }
  }
  return collapsed;
}
