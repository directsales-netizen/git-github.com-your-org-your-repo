'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsap } from '@/lib/animationConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/design';

interface PinSectionProps {
  /** Render-prop: called with the active step index. Only re-renders when the index actually changes (not per scroll tick) — keeps this smooth under scrub. */
  children: (activeStep: number) => React.ReactNode;
  steps: number;
  className?: string;
  /** Viewport-heights of scroll per step. */
  lengthPerStep?: number;
}

/**
 * Pinned, scroll-driven "step scroller" — the classic cinematic-storytelling
 * GSAP ScrollTrigger pattern (pin the viewport, scrub through an extended
 * wrapper, advance a step index as the user scrolls). Genuinely something
 * Framer Motion can't do (no pinning), unlike most of this project's other
 * reveals. Under prefers-reduced-motion, renders every step stacked
 * normally instead of pinning — a pinned viewport a keyboard/screen-reader
 * user can't escape via normal scrolling is a real accessibility trap, not
 * just a motion-comfort issue.
 */
export default function PinSection({ children, steps, className, lengthPerStep = 1 }: PinSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const wrapper = wrapperRef.current;
    const pinEl = pinRef.current;
    if (!wrapper || !pinEl) return;

    let cancelled = false;
    let instance: ScrollTrigger | undefined;

    registerGsap().then(async () => {
      if (cancelled) return;
      const { ScrollTrigger: ScrollTriggerRuntime } = await import('gsap/ScrollTrigger');
      instance = ScrollTriggerRuntime.create({
        trigger: wrapper,
        pin: pinEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const next = Math.min(steps - 1, Math.floor(self.progress * steps));
          setActiveStep((prev) => (prev === next ? prev : next));
        },
      });
    });

    return () => {
      cancelled = true;
      instance?.kill();
    };
  }, [reduced, steps]);

  if (reduced) {
    return <div className={className}>{Array.from({ length: steps }, (_, i) => children(i))}</div>;
  }

  return (
    <div ref={wrapperRef} className={className} style={{ height: `${steps * lengthPerStep * 100}vh` }}>
      <div ref={pinRef} className={cn('flex h-screen items-center overflow-hidden')}>
        {children(activeStep)}
      </div>
    </div>
  );
}
