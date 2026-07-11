'use client';

import { useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/design';

interface HoverTiltProps extends HTMLMotionProps<'div'> {
  /** Max tilt in degrees. */
  maxTilt?: number;
}

/** 3D tilt-toward-cursor wrapper, spring-damped, off entirely under reduced motion. */
export default function HoverTilt({ maxTilt = 8, className, children, ...props }: HoverTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), { stiffness: 300, damping: 30 });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 800 }}
      className={cn('will-change-transform', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
