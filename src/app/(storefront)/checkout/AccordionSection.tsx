'use client';

import { useId, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn, accessibility } from '@/design';

interface AccordionSectionProps {
  title: string;
  stepNumber: number;
  isOpen: boolean;
  isComplete: boolean;
  disabled?: boolean;
  summary?: ReactNode;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * Apple-checkout-style collapsible step: a completed step collapses to a
 * one-line summary with an edit affordance instead of staying expanded,
 * so the page never shows more than one active form at a time.
 */
export default function AccordionSection({ title, stepNumber, isOpen, isComplete, disabled, summary, onToggle, children }: AccordionSectionProps) {
  const panelId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn('overflow-hidden rounded-lg border border-neutral-titanium/15 bg-bg-secondary transition-colors duration-300', isOpen && 'border-accent-primary/40')}>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn('flex w-full items-center justify-between gap-4 px-5 py-4 text-left', accessibility.focusRing, disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-sm font-heading font-semibold transition-colors duration-300',
              isComplete ? 'bg-accent-primary text-bg-primary' : isOpen ? 'border-2 border-accent-primary text-accent-primary' : 'border border-neutral-titanium text-neutral-silver'
            )}
          >
            {isComplete ? <Check size={14} /> : stepNumber}
          </span>
          <span className="text-body-md font-heading font-semibold text-neutral-white">{title}</span>
        </span>
        {!disabled && (
          <ChevronDown size={18} aria-hidden="true" className={cn('shrink-0 text-neutral-silver transition-transform duration-300', isOpen && 'rotate-180')} />
        )}
      </button>

      {isComplete && !isOpen && summary && (
        <div className="border-t border-neutral-titanium/10 px-5 py-3 text-body-sm font-body text-neutral-light-gray">{summary}</div>
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            key="content"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-titanium/10 px-5 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
