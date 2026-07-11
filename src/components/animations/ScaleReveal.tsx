import Fade from './Fade';

/** Thin named export over Fade(variant="scale") — see FadeUp.tsx for rationale. */
type ScaleRevealProps = Omit<React.ComponentProps<typeof Fade>, 'variant'>;

export default function ScaleReveal(props: ScaleRevealProps) {
  return <Fade variant="scale" {...props} />;
}
