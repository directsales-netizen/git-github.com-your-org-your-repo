'use client';

import { useMagnetic } from '@/hooks/useMagnetic';
import { cn } from '@/design';

type MagneticButtonProps = React.ComponentPropsWithoutRef<'button'>;

/**
 * Convenience <button> wrapper around useMagnetic. For a magnetic Link
 * (e.g. a CTA anchor), call useMagnetic directly and pass its ref to the
 * Link instead — this component is specifically for real buttons.
 */
export default function MagneticButton({ className, children, ...props }: MagneticButtonProps) {
  const ref = useMagnetic<HTMLButtonElement>();
  return (
    <button ref={ref} className={cn('inline-block will-change-transform', className)} {...props}>
      {children}
    </button>
  );
}
