import ParallaxLayer from './ParallaxLayer';

/**
 * Thin named export over ParallaxLayer — kept as its own file since
 * MOTION_SYSTEM.md names it "Parallax"; the implementation (GSAP
 * ScrollTrigger scrub via useParallax) already lives in ParallaxLayer.tsx.
 */
type ParallaxProps = React.ComponentProps<typeof ParallaxLayer>;

export default function Parallax(props: ParallaxProps) {
  return <ParallaxLayer {...props} />;
}
