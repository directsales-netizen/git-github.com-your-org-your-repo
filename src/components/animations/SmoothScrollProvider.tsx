'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { registerGsap } from '@/lib/animationConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Mounts Lenis smooth-scroll and wires it to GSAP's ticker so
 * ScrollTrigger-based animations (useParallax, useScrollReveal) stay in
 * sync with Lenis's virtual scroll position — the standard Lenis+GSAP
 * integration recipe (autoRaf: false, drive Lenis from gsap.ticker instead
 * of its own internal rAF loop). Renders nothing. Mounted in the
 * (storefront) layout only — the admin dashboard keeps native scroll.
 */
export default function SmoothScrollProvider() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let lenis: Lenis | undefined;
    let tickerFn: ((time: number) => void) | undefined;
    let cancelled = false;

    registerGsap().then(async () => {
      if (cancelled) return;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      lenis = new Lenis({ autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);

      tickerFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    });

    return () => {
      cancelled = true;
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
    };
  }, [reduced]);

  return null;
}
