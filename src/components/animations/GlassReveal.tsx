import ScrollReveal from './ScrollReveal';
import { cn } from '@/design';

interface GlassRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Scroll-scrubbed glass panel reveal — pairs ScrollReveal's GSAP scrub with
 * the same glassmorphism surface GlassCard uses (translucent + backdrop-blur
 * + aqua glow), composed rather than reimplemented. For a one-shot
 * (non-scrubbed) glass reveal, use Fade/Reveal + GlassCard directly instead
 * — that's the pattern used throughout the rest of the site.
 */
export default function GlassReveal({ children, className }: GlassRevealProps) {
  return (
    <ScrollReveal
      from={{ opacity: 0, y: 40, scale: 0.97, filter: 'blur(8px)' }}
      to={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      className={cn(
        'rounded-xl border border-neutral-titanium/20 bg-bg-secondary/60 backdrop-blur-xl',
        'shadow-[0_0_40px_-12px_rgba(47,231,242,0.25)]',
        className
      )}
    >
      {children}
    </ScrollReveal>
  );
}
