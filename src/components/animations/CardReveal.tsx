import Fade from './Fade';
import GlassCard from './GlassCard';

/**
 * The one name on this list with no prior implementation — everywhere else
 * in the app (WhyChoose, FeaturedProducts, Testimonials, sustainability
 * grades/CTA) already hand-composes `<Fade variant="up"><GlassCard>`
 * per card; this just names that repeated pattern instead of duplicating
 * it further. `transition` passes straight through to Fade for staggered
 * grids (e.g. `transition={{ delay: index * 0.08 }}`).
 */
interface CardRevealProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  transition?: React.ComponentProps<typeof Fade>['transition'];
  once?: boolean;
  amount?: number;
}

export default function CardReveal({ children, className, glow, transition, once, amount }: CardRevealProps) {
  return (
    <Fade variant="up" transition={transition} once={once} amount={amount}>
      <GlassCard className={className} glow={glow}>
        {children}
      </GlassCard>
    </Fade>
  );
}
