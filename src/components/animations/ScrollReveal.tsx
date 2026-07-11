'use client';

import { gsap } from 'gsap';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/design';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  /** ScrollTrigger start/end — defaults match MOTION_SYSTEM.md's scrub pattern. */
  start?: string;
  end?: string;
}

/**
 * GSAP scroll-SCRUBBED reveal — the animation progress is tied directly to
 * scroll position through the trigger zone (scrub), not a fixed-duration
 * tween like Fade/Reveal (Framer Motion whileInView, one-shot once
 * triggered). Use this specifically when you want the reveal to feel
 * continuously driven by the scrollbar; use Fade/Reveal for everything
 * else — most section/card reveals across the site use those, not this.
 */
export default function ScrollReveal({
  children,
  className,
  from = { opacity: 0, y: 60 },
  to = { opacity: 1, y: 0 },
  start = 'top 90%',
  end = 'bottom 30%',
}: ScrollRevealProps) {
  // useScrollReveal keeps its own ref to the latest `build` closure (synced
  // in an effect, not during render) — so this callback always sees current
  // props without this component needing its own ref-mutation-during-render.
  const ref = useScrollReveal<HTMLDivElement>((el) => {
    gsap.fromTo(el, from, {
      ...to,
      ease: 'none',
      scrollTrigger: { trigger: el, scrub: 1, start, end },
    });
  });

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
