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

const HIDE_REVEAL_THRESHOLD = 80;
let lastScrollY = 0;
let isHidden = false;

function subscribeHide(callback: () => void): () => void {
  function handleScroll() {
    const currentY = window.scrollY;
    const next = currentY > lastScrollY && currentY > HIDE_REVEAL_THRESHOLD;
    lastScrollY = currentY;
    if (next !== isHidden) {
      isHidden = next;
      callback();
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}

function getHideSnapshot(): boolean {
  return isHidden;
}

function getHideServerSnapshot(): boolean {
  return false;
}

/**
 * True while the page is being scrolled down past HIDE_REVEAL_THRESHOLD —
 * false near the top or while scrolling up, so the nav reappears the moment
 * the visitor starts scrolling back toward it. Same useSyncExternalStore
 * pattern as useScrolled above, but only notifies React when the boolean
 * actually flips (not on every scroll pixel) — the direction/threshold
 * comparison lives in the native scroll listener, not a React effect body.
 */
export function useHideOnScroll(): boolean {
  return useSyncExternalStore(subscribeHide, getHideSnapshot, getHideServerSnapshot);
}
