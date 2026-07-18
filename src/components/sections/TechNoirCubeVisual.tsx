'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const circuitPaths = [
  'M18 38 H92 L116 62 H178',
  'M0 142 H68 L98 112 H146',
  'M182 24 H244 L270 50 H340',
  'M194 154 H260 L286 128 H360',
];

export default function TechNoirCubeVisual() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="relative aspect-square w-full max-w-[32rem] overflow-hidden rounded-xl border border-accent-primary/20 bg-bg-primary/80 shadow-[0_30px_100px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(47,231,242,0.16),transparent_36%),linear-gradient(145deg,rgba(8,19,31,0.2),rgba(13,17,23,0.96))]" />

      <svg aria-hidden="true" viewBox="0 0 360 180" className="absolute inset-x-0 bottom-0 h-[52%] w-full opacity-70">
        <defs>
          <linearGradient id="circuit-fade" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#38E8E8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#38E8E8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#38E8E8" stopOpacity="0" />
          </linearGradient>
          <pattern id="circuit-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#38E8E8" strokeOpacity="0.12" strokeWidth="0.75" />
          </pattern>
        </defs>
        <path d="M0 40 L180 0 L360 40 L180 180 Z" fill="url(#circuit-grid)" />
        {circuitPaths.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill="none"
            stroke="url(#circuit-fade)"
            strokeWidth="2"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.55 + index * 0.12, ease: 'easeOut' }}
          />
        ))}
      </svg>

      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-neutral-white/10 bg-bg-secondary/70 px-3 py-1.5 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          {!reducedMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-60" />}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-primary" />
        </span>
        <span className="text-label-xs font-body uppercase tracking-[0.18em] text-neutral-silver">System online</span>
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-[46%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-primary/20"
        animate={reducedMotion ? undefined : { scale: [0.8, 1.15], opacity: [0.5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
      />

      <motion.div
        className="absolute left-1/2 top-[46%] w-[86%] -translate-x-1/2 -translate-y-1/2"
        initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.94 }}
        animate={{ opacity: 1, y: reducedMotion ? 0 : [0, -6, 0], scale: 1 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { opacity: { duration: 0.7 }, scale: { duration: 0.7 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
        }
      >
        <div className="relative aspect-[3/2] overflow-hidden rounded-md border border-neutral-white/20 bg-neutral-white shadow-[0_18px_55px_rgba(0,0,0,0.42),0_0_42px_rgba(56,232,232,0.18)]">
          <Image
            src="/products/07_MacBook_Pro_14_M2_-_Space_Gray.jpg"
            alt="MacBook Pro 14-inch M2 in space gray"
            fill
            priority
            sizes="(min-width: 1024px) 430px, 82vw"
            className="object-contain"
          />
        </div>
      </motion.div>

      <div className="absolute inset-x-5 bottom-5 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-white/10 bg-bg-secondary/70 px-3 py-2 backdrop-blur-md">
          <ShieldCheck size={16} className="shrink-0 text-accent-primary" aria-hidden="true" />
          <span className="text-label-xs font-body text-neutral-light-gray">Verified devices</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-neutral-white/10 bg-bg-secondary/70 px-3 py-2 backdrop-blur-md">
          <Sparkles size={16} className="shrink-0 text-accent-primary" aria-hidden="true" />
          <span className="text-label-xs font-body text-neutral-light-gray">Smarter lifecycle</span>
        </div>
      </div>
    </div>
  );
}
