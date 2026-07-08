import { AlertCircle, CheckCircle2, Circle, Info, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/design';

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  neutral: 'bg-neutral-titanium/15 text-neutral-silver',
};

const TONE_ICONS: Record<BadgeTone, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  neutral: Circle,
};

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

// Status is always icon + label, never color alone (WCAG 1.4.1).
export default function StatusBadge({ label, tone }: StatusBadgeProps) {
  const Icon = TONE_ICONS[tone];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-body font-medium', TONE_CLASSES[tone])}>
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}
