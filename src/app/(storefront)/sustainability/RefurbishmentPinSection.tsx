'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Recycle, SearchCheck, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { RefurbishmentStep } from '@/lib/sustainability';
import { cn, spacing } from '@/design';
import { easeOut } from '@/lib/easing';
import PinSection from '@/components/animations/PinSection';
import ParallaxLayer from '@/components/animations/ParallaxLayer';

const STEP_ICONS: LucideIcon[] = [Recycle, SearchCheck, ShieldCheck, BadgeCheck];

/**
 * Pinned, scroll-driven walkthrough of the refurbishment process — the
 * "cinematic storytelling section" pattern from MOTION_SYSTEM.md. Client
 * component isolated from page.tsx (a Server Component) since it needs
 * PinSection's scroll-trigger/state.
 */
export default function RefurbishmentPinSection({ steps }: { steps: RefurbishmentStep[] }) {
  return (
    <PinSection steps={steps.length} lengthPerStep={1.1} className="relative">
      {(activeStep) => {
        const step = steps[activeStep];
        const Icon = STEP_ICONS[activeStep] ?? STEP_ICONS[0];

        return (
          <div
            className={cn(
              spacing.containerPadding,
              'relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 desktop:grid-cols-2'
            )}
          >
            <ParallaxLayer
              speed={0.15}
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_50%_50%,rgba(47,231,242,0.12),transparent_65%)]"
            />
            <div>
              <div className="flex items-center gap-2" role="tablist" aria-label="Refurbishment step">
                {steps.map((s, i) => (
                  <span
                    key={s.title}
                    role="tab"
                    aria-selected={i === activeStep}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      i === activeStep ? 'w-8 bg-accent-primary' : 'w-4 bg-neutral-titanium/40'
                    )}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                >
                  <Icon size={40} className="mt-6 text-accent-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-h3 font-heading font-bold text-neutral-white">
                    {activeStep + 1}. {step.title}
                  </h3>
                  <p className="mt-3 max-w-md text-body-lg font-body text-neutral-light-gray">{step.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              animate={{ rotate: activeStep * 90 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="relative aspect-square w-full max-w-md justify-self-center rounded-xl border border-neutral-titanium/20 bg-gradient-to-br from-accent-primary/20 via-secondary-primary/10 to-bg-tertiary shadow-elevation desktop:justify-self-end"
              role="img"
              aria-label={`Step ${activeStep + 1}: ${step.title}`}
            />
          </div>
        );
      }}
    </PinSection>
  );
}
