'use client';

import { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { buttonVariants, cn, flex, spacing } from '@/design';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { useEditMode } from '@/components/EditModeProvider';
import InlineEditableText from '@/components/InlineEditableText';
import type { SiteContentSettings } from '@/types/admin';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useMagnetic } from '@/hooks/useMagnetic';
import { HeroReveal, HeroRevealItem } from '@/components/animations/HeroReveal';
import HoverTilt from '@/components/animations/HoverTilt';
import FloatingElement from '@/components/animations/FloatingElement';
import TechNoirCubeVisual from './TechNoirCubeVisual';

// Client-only: mounts a WebGL canvas, so it must never run during SSR (and
// shouldn't block the server-rendered headline/CTA, which are what matters
// for LCP — the shader is purely decorative and paints in behind them).
const HeroShaderBackground = dynamic(() => import('./HeroShaderBackground'), { ssr: false });

type EditableHeroField = Extract<keyof SiteContentSettings, 'heroHeadline' | 'heroSubheadline' | 'heroCtaLabel' | 'promoBannerText'>;

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  promoBannerEnabled?: boolean;
  promoBannerText?: string;
}

const DEFAULT_HEADLINE = 'Premium Technology. Smarter Value. Sustainable Impact.';
const DEFAULT_SUBHEADLINE =
  'Shop professionally tested, responsibly sourced refurbished MacBooks, iPhones, iPads, and more — backed by a 30-day warranty and honest, transparent grading.';
const DEFAULT_CTA_LABEL = 'Shop Now';

// Copy is sourced from the admin Website Content module (src/lib/admin/content.ts)
// via the server-rendered parent page — defaults here only cover the case where
// no content prop is passed (e.g. a future usage of Hero without that fetch).
export default function Hero({
  headline = DEFAULT_HEADLINE,
  subheadline = DEFAULT_SUBHEADLINE,
  ctaLabel = DEFAULT_CTA_LABEL,
  promoBannerEnabled,
  promoBannerText,
}: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const { editModeOn } = useEditMode();
  const sectionRef = useRef<HTMLElement>(null);
  const mouse = useMousePosition(sectionRef);
  const magneticCtaRef = useMagnetic<HTMLAnchorElement>();

  async function saveField(field: EditableHeroField, value: string) {
    const response = await adminFetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (!response.ok) throw new Error(await extractAdminErrorMessage(response, 'Unable to save.'));
    router.refresh();
  }

  return (
    <section ref={sectionRef} className="relative min-h-[calc(100svh-5rem)] overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <HeroShaderBackground reducedMotion={Boolean(prefersReducedMotion)} />
      </div>
      {/* Scrim over the shader so headline/subheadline text keeps WCAG AA contrast regardless of what the gradient is doing underneath. */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/30 via-bg-primary/20 to-bg-primary/90" />

      {/* Mouse-responsive lighting — a soft aqua glow that follows the cursor within the hero. */}
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${50 + mouse.x * 25}% ${50 + mouse.y * 25}%, rgba(47,231,242,0.12), transparent 60%)`,
          }}
        />
      )}

      {/* Ambient floating glow orbs — atmosphere only, never more than two. */}
      {!prefersReducedMotion && (
        <>
          <FloatingElement
            distance={16}
            duration={3}
            className="pointer-events-none absolute -left-10 top-1/4 h-40 w-40 rounded-full bg-accent-primary/10 blur-3xl"
          />
          <FloatingElement
            distance={22}
            duration={2.4}
            delay={0.6}
            className="pointer-events-none absolute right-0 top-1/3 h-56 w-56 rounded-full bg-secondary-primary/10 blur-3xl desktop:right-10"
          />
        </>
      )}

      {promoBannerEnabled && promoBannerText && (
        <div className="relative bg-accent-primary px-4 py-2 text-center text-caption font-body font-semibold text-bg-primary">
          <InlineEditableText
            value={promoBannerText}
            onSave={(v) => saveField('promoBannerText', v)}
            className="text-caption font-body font-semibold text-bg-primary"
          />
        </div>
      )}
      <div className={cn(spacing.containerPadding, 'relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1440px] grid-cols-1 items-center gap-12 py-20 tablet:py-24 desktop:grid-cols-[1.1fr_0.9fr] desktop:py-24')}>
        <HeroReveal>
          <HeroRevealItem className={cn(flex.center, 'w-fit gap-2 rounded-full border border-accent-primary/20 bg-bg-secondary/55 px-4 py-1.5 backdrop-blur-md')}>
            <ShieldCheck size={16} className="text-accent-primary" aria-hidden="true" />
            <span className="text-label-sm font-body font-medium uppercase tracking-[0.16em] text-accent-primary">Professionally tested &amp; graded</span>
          </HeroRevealItem>

          <HeroRevealItem>
            <InlineEditableText
              as="h1"
              value={headline}
              onSave={(v) => saveField('heroHeadline', v)}
              multiline
              className="mt-7 max-w-5xl text-[clamp(3.2rem,8vw,7rem)] font-heading font-bold leading-none text-neutral-white"
            />
          </HeroRevealItem>

          <HeroRevealItem>
            <InlineEditableText
              as="p"
              value={subheadline}
              onSave={(v) => saveField('heroSubheadline', v)}
              multiline
              className="mt-7 max-w-xl text-body-lg font-body leading-8 text-neutral-silver"
            />
          </HeroRevealItem>

          <HeroRevealItem className="mt-10 flex flex-col gap-4 tablet:flex-row">
            {editModeOn ? (
              <span className={cn(buttonVariants.primary, 'inline-flex items-center justify-center rounded-full px-8 py-4 text-body-md')}>
                <InlineEditableText value={ctaLabel} onSave={(v) => saveField('heroCtaLabel', v)} className="text-body-md" />
              </span>
            ) : (
              <Link
                ref={magneticCtaRef}
                href="/shop"
                className={cn(buttonVariants.primary, 'inline-flex items-center justify-center rounded-full px-8 py-4 text-body-md will-change-transform')}
              >
                {ctaLabel}
              </Link>
            )}
            <Link
              href="/sustainability"
              className={cn(buttonVariants.ghost, 'inline-flex items-center justify-center rounded-full px-8 py-4 text-body-md')}
            >
              How Refurbishment Works
            </Link>
          </HeroRevealItem>

          <HeroRevealItem className="mt-14 grid max-w-xl grid-cols-3 gap-6">
            <div>
              <p className="text-h4 font-heading font-bold text-neutral-white"><span className="text-accent-primary">30</span>d</p>
              <p className="mt-1 text-label-xs font-body uppercase tracking-[0.14em] text-neutral-titanium">Warranty</p>
            </div>
            <div>
              <p className="text-h4 font-heading font-bold text-neutral-white"><span className="text-accent-primary">100</span>%</p>
              <p className="mt-1 text-label-xs font-body uppercase tracking-[0.14em] text-neutral-titanium">Tested</p>
            </div>
            <div>
              <p className="text-h4 font-heading font-bold text-neutral-white"><span className="text-accent-primary">A-D</span></p>
              <p className="mt-1 text-label-xs font-body uppercase tracking-[0.14em] text-neutral-titanium">Grading</p>
            </div>
          </HeroRevealItem>
        </HeroReveal>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-full justify-self-center desktop:justify-self-end"
        >
          <HoverTilt
            maxTilt={6}
            className="mx-auto w-full max-w-[34rem] desktop:mr-0"
          >
            <TechNoirCubeVisual />
          </HoverTilt>
        </motion.div>
      </div>

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-neutral-silver/60"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={22} />
        </motion.div>
      )}
    </section>
  );
}
