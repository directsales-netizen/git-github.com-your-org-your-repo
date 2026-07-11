import Reveal from './Reveal';

/** Thin named export over Reveal(type="blur") — see TextReveal.tsx for rationale. */
type BlurRevealProps = Omit<React.ComponentProps<typeof Reveal>, 'type'>;

export default function BlurReveal(props: BlurRevealProps) {
  return <Reveal type="blur" {...props} />;
}
