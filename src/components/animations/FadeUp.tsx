import Fade from './Fade';

/**
 * Thin named export over Fade(variant="up") — see Fade.tsx for why
 * FadeUp/FadeDown/FadeLeft/FadeRight/ScaleReveal share one implementation
 * instead of five. Kept as its own file purely for MOTION_SYSTEM.md naming
 * consistency; no separate logic lives here.
 */
type FadeUpProps = Omit<React.ComponentProps<typeof Fade>, 'variant'>;

export default function FadeUp(props: FadeUpProps) {
  return <Fade variant="up" {...props} />;
}
