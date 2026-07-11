'use client';

import { motion } from 'framer-motion';
import { fadeVariants, staggerContainer, withReducedMotion, type FadeDirection } from '@/lib/motionPresets';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeroRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mount-triggered (not scroll-triggered) staged reveal for above-the-fold
 * hero content — badge, heading, subheadline, CTAs each as a HeroRevealItem
 * child, staggered by this container. Deliberately separate from Fade
 * (which is scroll/whileInView-triggered): a hero is visible on first paint,
 * so its reveal should fire on mount, not wait for a viewport intersection.
 */
export function HeroReveal({ children, className }: HeroRevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={withReducedMotion(staggerContainer, reduced)}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

interface HeroRevealItemProps {
  children: React.ReactNode;
  className?: string;
  direction?: FadeDirection;
}

export function HeroRevealItem({ children, className, direction = 'up' }: HeroRevealItemProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} variants={withReducedMotion(fadeVariants(direction), reduced)}>
      {children}
    </motion.div>
  );
}
