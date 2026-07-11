import MotionTimeline from './MotionTimeline';

/**
 * Thin named export over MotionTimeline — kept as its own file since
 * MOTION_SYSTEM.md names it "ScrollTimeline"; the implementation
 * (useScrollReveal-backed imperative GSAP timeline) already lives in
 * MotionTimeline.tsx.
 */
type ScrollTimelineProps = React.ComponentProps<typeof MotionTimeline>;

export default function ScrollTimeline(props: ScrollTimelineProps) {
  return <MotionTimeline {...props} />;
}
