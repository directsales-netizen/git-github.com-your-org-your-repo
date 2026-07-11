'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void): () => void {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Tracks whether the page has scrolled past `threshold`, for the sticky
 * navbar's glass-morph/blur-on-scroll treatment. Kept in components/animations
 * (per MOTION_SYSTEM.md's file list) but exported as a hook rather than a
 * wrapper component — Navigation.tsx already owns its own <header> markup,
 * so a wrapping component would mean restructuring it for no reason.
 * useSyncExternalStore rather than effect+setState, matching this
 * codebase's established pattern (see src/hooks/useReducedMotion.ts).
 */
export function useScrolled(threshold = 8): boolean {
  const scrollY = useSyncExternalStore(subscribe, () => window.scrollY, getServerSnapshot);
  return scrollY > threshold;
}
