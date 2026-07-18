'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TRUST_POINTS = [
  'Professionally tested',
  'Transparent condition grading',
  'Minimum 30-day warranty',
  '30-day returns',
  'Responsible refurbishment',
  'Customer-first support',
] as const;

export default function TrustTicker() {
  const reducedMotion = useReducedMotion();
  const repeated = [...TRUST_POINTS, ...TRUST_POINTS];

  return (
    <section
      aria-label="Premium TechNoir purchase standards"
      className="overflow-hidden border-y border-accent-primary/10 bg-bg-primary/35 py-6 backdrop-blur-sm"
    >
      <ul className="sr-only">
        {TRUST_POINTS.map((point) => <li key={point}>{point}</li>)}
      </ul>
      <motion.div
        aria-hidden="true"
        className="flex w-max items-center"
        animate={reducedMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={reducedMotion ? undefined : { duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {repeated.map((point, index) => (
          <div key={`${point}-${index}`} className="flex shrink-0 items-center gap-2 px-7 tablet:px-12">
            <Check size={15} className="text-accent-primary" />
            <span className="whitespace-nowrap text-label-sm font-body font-semibold uppercase tracking-[0.18em] text-neutral-silver">
              {point}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
