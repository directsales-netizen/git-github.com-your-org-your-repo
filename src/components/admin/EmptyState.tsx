import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-titanium/30 px-6 py-16 text-center">
      <Icon size={28} className="text-neutral-titanium" aria-hidden="true" />
      <p className="text-body-md font-body font-semibold text-neutral-white">{title}</p>
      {description && <p className="max-w-sm text-body-sm font-body text-neutral-silver">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
