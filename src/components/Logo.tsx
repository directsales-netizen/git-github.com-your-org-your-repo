import { cn } from '@/design';

interface LogoProps {
  variant?: 'lockup' | 'icon';
  className?: string;
}

/**
 * Inline shield-badge mark. No logo asset exists in the repo yet —
 * this follows VISUAL_BRAND_GUIDELINES.md's description (shield + checkmark,
 * Aqua-to-Navy gradient icon) until a real asset is provided.
 */
function ShieldMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="ptn-shield-gradient" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#38E8E8" />
          <stop offset="100%" stopColor="#001A4D" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 L42 10 V22 C42 33 34.5 41 24 45 C13.5 41 6 33 6 22 V10 Z"
        fill="url(#ptn-shield-gradient)"
      />
      <path
        d="M15.5 23.5 L21 29 L32.5 17"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Logo({ variant = 'lockup', className }: LogoProps) {
  if (variant === 'icon') {
    return (
      <span className={cn('inline-flex', className)} aria-hidden="true">
        <ShieldMark size={32} />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <ShieldMark size={28} />
      <span className="font-heading text-h5 font-bold text-neutral-white">Premium TechNoir</span>
    </span>
  );
}
