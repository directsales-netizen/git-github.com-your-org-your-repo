import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cardVariants, cn } from '@/design';
import Sparkline from './Sparkline';

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: number; direction: 'up' | 'down' };
  icon?: LucideIcon;
  sparkline?: number[];
}

export default function StatCard({ label, value, delta, icon: Icon, sparkline }: StatCardProps) {
  return (
    <div className={cn(cardVariants.base, 'flex flex-col gap-3')}>
      <div className="flex items-center justify-between">
        <p className="text-body-sm font-body text-neutral-silver">{label}</p>
        {Icon && <Icon size={18} className="text-accent-primary" aria-hidden="true" />}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-h3 font-heading font-bold text-neutral-white">{value}</p>
          {delta && (
            <p
              className={cn(
                'mt-1 flex items-center gap-1 text-caption font-body font-medium',
                delta.direction === 'up' ? 'text-success' : 'text-error'
              )}
            >
              {delta.direction === 'up' ? (
                <TrendingUp size={12} aria-hidden="true" />
              ) : (
                <TrendingDown size={12} aria-hidden="true" />
              )}
              {delta.value}% vs last period
            </p>
          )}
        </div>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
    </div>
  );
}
