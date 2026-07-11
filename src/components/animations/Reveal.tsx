'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { blurVariants, maskVariants, staggerContainer, withReducedMotion } from '@/lib/motionPresets';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { durations } from '@/lib/durations';
import { easeOut } from '@/lib/easing';

type RevealType = 'mask' | 'blur' | 'text' | 'image';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'whileInView'> {
  /** Covers MaskReveal/BlurReveal/TextReveal/ImageReveal from MOTION_SYSTEM.md. */
  type?: RevealType;
  duration?: number;
  once?: boolean;
}

export default function Reveal({ type = 'blur', duration, once = true, children, className, ...props }: RevealProps) {
  const reduced = useReducedMotion();

  if (type === 'text' && typeof children === 'string') {
    const words = children.split(' ');
    return (
      <motion.span
        className={className}
        variants={withReducedMotion(staggerContainer, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once }}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden align-top">
            <motion.span
              className="inline-block"
              variants={withReducedMotion(
                { hidden: { y: '100%' }, visible: { y: '0%', transition: { duration: duration ?? durations.base, ease: easeOut } } },
                reduced
              )}
            >
              {word}&nbsp;
            </motion.span>
          </span>
        ))}
      </motion.span>
    );
  }

  // 'image' reuses the mask (clip-path) reveal — an overflow-hidden curtain
  // opening over the image, the standard premium image-reveal pattern.
  const variants = type === 'mask' || type === 'image' ? maskVariants(duration) : blurVariants(duration);

  return (
    <motion.div
      className={className}
      variants={withReducedMotion(variants, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
