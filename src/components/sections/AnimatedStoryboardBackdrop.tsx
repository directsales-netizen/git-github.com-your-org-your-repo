'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/design';

const STORYBOARD_IMAGE = '/images/technoir-storyboard.jpeg';

const FRAMES = [
  { row: 0, column: 3 },
  { row: 1, column: 3 },
  { row: 2, column: 0 },
  { row: 2, column: 1 },
  { row: 2, column: 2 },
] as const;

function frameStyle(row: number, column: number): CSSProperties {
  return {
    backgroundImage: `url(${STORYBOARD_IMAGE})`,
    backgroundPosition: `${(column / 3) * 100}% ${(row / 3) * 100}%`,
    backgroundSize: '400% 400%',
  };
}

export default function AnimatedStoryboardBackdrop({ placement = 'section' }: { placement?: 'section' | 'storefront' }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const isStorefront = placement === 'storefront';

  useEffect(() => {
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAMES.length);
    }, 4800);

    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  const frame = FRAMES[frameIndex];

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none inset-0 overflow-hidden bg-bg-primary',
        isStorefront ? 'fixed z-0' : 'absolute -z-10'
      )}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${frame.row}-${frame.column}`}
          initial={reducedMotion ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: isStorefront ? 0.42 : 0.48, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 1.15, ease: 'easeOut' }}
          style={frameStyle(frame.row, frame.column)}
          className={cn(
            'absolute inset-0 bg-no-repeat',
            isStorefront
              ? 'blur-[1px]'
              : '[mask-image:linear-gradient(to_bottom,transparent_0%,transparent_28%,black_62%)]'
          )}
        />
      </AnimatePresence>
      <div className={cn('absolute inset-0', isStorefront ? 'bg-bg-primary/74' : 'bg-bg-primary/65')} />
      {isStorefront && <div className="absolute inset-x-0 top-0 h-[24%] bg-bg-primary/75" />}
      <div className="absolute inset-0 bg-secondary-primary/10" />
    </div>
  );
}
