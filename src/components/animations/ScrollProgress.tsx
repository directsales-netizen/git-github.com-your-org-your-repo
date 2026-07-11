'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Fixed top progress bar tracking scroll position across the whole page. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 top-0 z-tooltip h-0.5 w-full origin-left bg-accent-primary"
    />
  );
}
