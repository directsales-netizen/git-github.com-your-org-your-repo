'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/design';

interface FloatingElementProps {
  children?: React.ReactNode;
  className?: string;
  /** Vertical drift distance in px. */
  distance?: number;
  /** Seconds for one direction of the float (yoyo doubles this for a full cycle). */
  duration?: number;
  /** Stagger start time when placing a few of these together. */
  delay?: number;
}

/**
 * Continuous ambient float loop — NOT scroll-driven (no ScrollTrigger),
 * unlike everything else in this animation system. Plain infinite
 * yoyo tween, for decorative glow orbs / floating glass panels ("Floating
 * UI elements" in MOTION_SYSTEM.md). Use sparingly — one or two per section,
 * this is atmosphere, not a focal point.
 */
export default function FloatingElement({ children, className, distance = 20, duration = 2, delay = 0 }: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const tween = gsap.to(el, { y: -distance, duration, delay, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    return () => {
      tween.kill();
    };
  }, [reduced, distance, duration, delay]);

  return (
    <div ref={ref} aria-hidden="true" className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
