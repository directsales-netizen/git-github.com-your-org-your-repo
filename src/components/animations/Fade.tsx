'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { fadeVariants, scaleVariants, withReducedMotion, type FadeDirection } from '@/lib/motionPresets';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FadeProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'whileInView'> {
  /** Covers FadeUp/FadeDown/FadeLeft/FadeRight/ScaleIn from MOTION_SYSTEM.md's Scroll System list via one component. */
  variant?: FadeDirection | 'scale';
  duration?: number;
  /** Re-trigger every time the element re-enters the viewport instead of once. */
  once?: boolean;
  /** IntersectionObserver threshold (0-1) for when the reveal fires. */
  amount?: number;
}

export default function Fade({
  variant = 'up',
  duration,
  once = true,
  amount = 0.2,
  children,
  ...props
}: FadeProps) {
  const reduced = useReducedMotion();
  const variants = variant === 'scale' ? scaleVariants(duration) : fadeVariants(variant, duration);

  return (
    <motion.div
      variants={withReducedMotion(variants, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
