'use client';

import { gsap } from 'gsap';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/design';

interface MotionTimelineProps {
  children: React.ReactNode;
  className?: string;
  /** Build whatever GSAP timeline/tween sequence you need against `el`, scoped to a scroll trigger or not. */
  build: (gsapInstance: typeof gsap, el: HTMLElement) => void;
}

/**
 * Component form of useScrollReveal, for multi-step imperative sequences
 * that don't fit a single Fade/ScrollReveal call — e.g. a timeline with
 * several `.to()` steps and labels. Prefer Fade/Reveal/ScrollReveal first;
 * reach for this only when composing a real GSAP timeline.
 */
export default function MotionTimeline({ children, className, build }: MotionTimelineProps) {
  const ref = useScrollReveal<HTMLDivElement>((el) => build(gsap, el));

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
