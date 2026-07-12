'use client';

import type { ImpactMetricFormat } from '@/lib/sustainability';
import Counter from './Counter';

const FORMATTERS: Record<ImpactMetricFormat, (value: number) => string> = {
  'count-plus': (n) => `${Math.round(n).toLocaleString()}+`,
  pounds: (n) => `${Math.round(n).toLocaleString()} lbs`,
  'millions-pounds': (n) => `${(n / 1_000_000).toFixed(1)}M lbs`,
};

/**
 * Client-only wrapper around Counter for src/lib/sustainability.ts's
 * IMPACT_METRICS — its format field is a serializable string key (not a
 * function) specifically so Server Components can pass it as a prop; the
 * key->formatter mapping happens here, entirely client-side, instead of
 * crossing the Server->Client boundary as a function (which RSC can't
 * serialize — that's the bug this file fixes).
 */
export default function ImpactCounter({
  value,
  format,
  className,
}: {
  value: number;
  format: ImpactMetricFormat;
  className?: string;
}) {
  return <Counter value={value} formatter={FORMATTERS[format]} className={className} />;
}
