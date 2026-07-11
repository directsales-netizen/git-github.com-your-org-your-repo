import Fade from './Fade';

/** Thin named export over Fade(variant="left") — see FadeUp.tsx for rationale. */
type FadeLeftProps = Omit<React.ComponentProps<typeof Fade>, 'variant'>;

export default function FadeLeft(props: FadeLeftProps) {
  return <Fade variant="left" {...props} />;
}
