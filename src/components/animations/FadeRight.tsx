import Fade from './Fade';

/** Thin named export over Fade(variant="right") — see FadeUp.tsx for rationale. */
type FadeRightProps = Omit<React.ComponentProps<typeof Fade>, 'variant'>;

export default function FadeRight(props: FadeRightProps) {
  return <Fade variant="right" {...props} />;
}
