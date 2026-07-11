import { cn } from '@/design';

/** Premium loading skeleton: shimmer sweep over a solid placeholder block. No JS/hooks needed. */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-bg-tertiary', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}
