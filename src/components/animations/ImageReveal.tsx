import Reveal from './Reveal';

/** Thin named export over Reveal(type="image") — see TextReveal.tsx for rationale. */
type ImageRevealProps = Omit<React.ComponentProps<typeof Reveal>, 'type'>;

export default function ImageReveal(props: ImageRevealProps) {
  return <Reveal type="image" {...props} />;
}
