'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { easeOut } from '@/lib/easing';

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

/** Animated number counter — counts up once its container scrolls into view. */
export default function Counter({ value, duration = 1.5, className, formatter }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => (formatter ? formatter(latest) : Math.round(latest).toLocaleString()));

  useEffect(() => {
    if (!isInView) return;
    if (reduced) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: easeOut });
    return () => controls.stop();
  }, [isInView, value, duration, reduced, count]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
