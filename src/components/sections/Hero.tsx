'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { buttonVariants, cn, flex, spacing } from '@/design';

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = {
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-bg-secondary to-bg-primary">
      <div className={cn(spacing.containerPadding, 'mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 py-20 tablet:py-24 desktop:grid-cols-2 desktop:py-32')}>
        <motion.div
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className={cn(flex.center, 'w-fit gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-4 py-1.5')}>
            <ShieldCheck size={16} className="text-accent-primary" aria-hidden="true" />
            <span className="text-label-sm font-body font-medium text-accent-primary">Professionally tested &amp; graded</span>
          </div>

          <h1 className="mt-6 text-display-2 font-heading font-bold text-neutral-white tablet:text-display-1">
            Premium Technology. Smarter Value. Sustainable Impact.
          </h1>

          <p className="mt-6 max-w-xl text-body-lg font-body text-neutral-light-gray">
            Shop professionally tested, responsibly sourced refurbished MacBooks, iPhones, iPads, and more —
            backed by a 30-day warranty and honest, transparent grading.
          </p>

          <div className="mt-8 flex flex-col gap-4 tablet:flex-row">
            <Link
              href="/shop"
              className={cn(buttonVariants.primary, spacing.buttonPadding, 'inline-flex items-center justify-center text-body-md')}
            >
              Shop Now
            </Link>
            <Link
              href="/refurbished"
              className={cn(buttonVariants.ghost, spacing.buttonPadding, 'inline-flex items-center justify-center text-body-md')}
            >
              How Refurbishment Works
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="relative aspect-square w-full max-w-md justify-self-center rounded-xl border border-neutral-titanium/20 bg-gradient-to-br from-accent-primary/20 via-secondary-primary/10 to-bg-tertiary shadow-elevation desktop:justify-self-end"
          role="img"
          aria-label="Showcase of refurbished MacBook, iPhone, and iPad devices"
        />
      </div>
    </section>
  );
}
