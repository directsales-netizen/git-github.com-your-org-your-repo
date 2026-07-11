'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { registerGsap, scrollTriggerDefaults } from '@/lib/animationConfig';
import { useReducedMotion } from './useReducedMotion';

type TimelineBuilder = (el: HTMLElement) => void;

/**
 * Imperative GSAP escape hatch for reveals that need more than a single
 * Framer Motion variant — pinned sections, multi-step timeline sequences.
 * For a plain fade/scale/blur reveal, prefer the Fade/Reveal components
 * (Framer Motion whileInView) instead — this hook is for the cases those
 * can't express. Pass a builder that sets up whatever GSAP timeline/tween
 * you need against `el`; ScrollTrigger defaults (src/lib/animationConfig.ts)
 * are there to spread into your own `scrollTrigger: {}` config.
 */
export function useScrollReveal<T extends HTMLElement>(build: TimelineBuilder) {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();
  const buildRef = useRef(build);
  useEffect(() => {
    buildRef.current = build;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.opacity = '1';
      return;
    }

    let ctx: ReturnType<typeof gsap.context> | undefined;
    let cancelled = false;

    registerGsap().then(() => {
      if (cancelled || !el) return;
      ctx = gsap.context(() => buildRef.current(el));
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return ref;
}

export { scrollTriggerDefaults };
