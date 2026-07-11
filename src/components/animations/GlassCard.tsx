'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/design';
import { easeOut } from '@/lib/easing';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Aqua glow border + shadow + shimmer sweep on hover. Default on. */
  glow?: boolean;
  children?: React.ReactNode;
}

/** Glassmorphism card: translucent + backdrop-blur, hover lift, glow border, shimmer sweep. */
export default function GlassCard({ className, glow = true, children, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-neutral-titanium/20 bg-bg-secondary/60 backdrop-blur-xl transition-shadow duration-300',
        glow && 'hover:border-accent-primary/40 hover:shadow-[0_0_40px_-8px_rgba(47,231,242,0.35)]',
        className
      )}
      {...props}
    >
      {glow && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      {children}
    </motion.div>
  );
}
