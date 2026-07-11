import Reveal from './Reveal';

/**
 * Thin named export over Reveal(type="text") — kept as its own file since
 * MOTION_SYSTEM.md names TextReveal as a distinct primitive, but the
 * implementation (word-stagger, Framer Motion whileInView) already lives in
 * Reveal.tsx. No separate GSAP implementation: a one-shot text reveal is
 * exactly Framer Motion's strength, not a reason to reach for GSAP.
 */
type TextRevealProps = Omit<React.ComponentProps<typeof Reveal>, 'type'>;

export default function TextReveal(props: TextRevealProps) {
  return <Reveal type="text" {...props} />;
}
