'use client';

import { useParallax } from '@/hooks/useParallax';
import { cn } from '@/design';

interface ParallaxLayerProps {
  /** Optional — a ParallaxLayer can be purely decorative (e.g. a background glow with no content). */
  children?: React.ReactNode;
  className?: string;
  /**
   * -1..1. Background layers ~0.2-0.3 (drift slowly, opposite direction),
   * foreground/product imagery ~0.5-0.8 (drift more, same direction) — the
   * MOTION_SYSTEM.md data-speed convention, expressed as a prop instead of a
   * data-attribute since this project drives motion from hooks, not a
   * generic DOM-scanning parallax library.
   */
  speed?: number;
}

/** Declarative wrapper around useParallax for depth-layered scroll motion. */
export default function ParallaxLayer({ children, className, speed = 0.3 }: ParallaxLayerProps) {
  const ref = useParallax<HTMLDivElement>({ speed });
  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
