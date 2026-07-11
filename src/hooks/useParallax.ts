'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { registerGsap } from '@/lib/animationConfig';
import { useReducedMotion } from './useReducedMotion';

interface ParallaxOptions {
  /** -1..1: negative drifts opposite to scroll direction, positive drifts with it. */
  speed?: number;
}

/**
 * Scroll-scrubbed vertical parallax on the returned ref's element. Uses
 * GSAP ScrollTrigger (not Framer Motion's useScroll) because it needs
 * scrub-tied-to-scroll-position, not a one-shot enter/exit transition.
 * No-ops under prefers-reduced-motion.
 */
export function useParallax<T extends HTMLElement>({ speed = 0.3 }: ParallaxOptions = {}) {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let ctx: ReturnType<typeof gsap.context> | undefined;
    let cancelled = false;

    registerGsap().then(() => {
      if (cancelled || !el) return;
      ctx = gsap.context(() => {
        gsap.to(el, {
          yPercent: speed * 20,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, speed]);

  return ref;
}
