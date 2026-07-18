'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/design';

const BRAND_BACKGROUND = '/images/premium-technoir-logo-bg.webp';

export default function AnimatedStoryboardBackdrop({ placement = 'section' }: { placement?: 'section' | 'storefront' }) {
  const reducedMotion = useReducedMotion();
  const pointer = useMousePosition<HTMLDivElement>();
  const { scrollYProgress } = useScroll();
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.095]);
  const isStorefront = placement === 'storefront';
  const x = reducedMotion ? 0 : pointer.x * -9;
  const y = reducedMotion ? 0 : pointer.y * -6;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none inset-0 overflow-hidden bg-bg-primary [perspective:1000px]',
        isStorefront ? 'fixed z-0' : 'absolute -z-10'
      )}
    >
      <motion.div
        animate={{ x, y }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
        style={{
          backgroundImage: `url(${BRAND_BACKGROUND})`,
          scale: reducedMotion ? 1.06 : scrollScale,
        }}
        className={cn(
          'absolute -inset-[4%] bg-cover bg-[center_42%] bg-no-repeat opacity-[0.52] [filter:saturate(1.08)_contrast(1.04)] will-change-transform',
          !isStorefront && '[mask-image:linear-gradient(to_bottom,transparent_0%,transparent_24%,black_60%)]'
        )}
      />

      <div className={cn('absolute inset-0', isStorefront ? 'bg-bg-primary/68' : 'bg-bg-primary/62')} />
      {isStorefront && <div className="absolute inset-x-0 top-0 h-[24%] bg-bg-primary/80" />}
      <div className="absolute inset-0 bg-secondary-primary/[0.08]" />

      {!reducedMotion && (
        <motion.div
          animate={{
            left: `${50 + pointer.x * 50}%`,
            top: `${50 + pointer.y * 50}%`,
          }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute h-[34vw] min-h-56 w-[34vw] min-w-56 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(56,232,232,0.13),transparent_68%)] mix-blend-screen"
        />
      )}
    </div>
  );
}
