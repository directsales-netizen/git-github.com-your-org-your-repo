import Fade from './Fade';

/** Thin named export over Fade(variant="down") — see FadeUp.tsx for rationale. */
type FadeDownProps = Omit<React.ComponentProps<typeof Fade>, 'variant'>;

export default function FadeDown(props: FadeDownProps) {
  return <Fade variant="down" {...props} />;
}
