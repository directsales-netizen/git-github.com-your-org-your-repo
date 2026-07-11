'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from './useReducedMotion';

const PROXIMITY_PX = 80;
const STRENGTH = 0.35;

/**
 * Attaches to a button/element: it eases toward the cursor within a
 * proximity radius and springs back on mouse-leave. Pure GSAP tweening —
 * no ScrollTrigger involved, so no plugin registration needed. No-ops
 * entirely under prefers-reduced-motion.
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    function handleMove(event: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = event.clientX - centerX;
      const distY = event.clientY - centerY;
      const radius = Math.max(rect.width, rect.height) / 2 + PROXIMITY_PX;

      if (Math.hypot(distX, distY) < radius) {
        gsap.to(el, { x: distX * STRENGTH, y: distY * STRENGTH, duration: 0.4, ease: 'power3.out' });
      } else {
        gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'power3.out' });
      }
    }

    function handleLeave() {
      gsap.to(el!, { x: 0, y: 0, duration: 0.4, ease: 'power3.out' });
    }

    window.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      gsap.killTweensOf(el);
    };
  }, [reduced]);

  return ref;
}
