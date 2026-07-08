'use client';

import { useState } from 'react';
import { cardVariants, cn } from '@/design';
import type { ProductCategory } from '@/types/product';

interface RevenueByCategoryChartProps {
  data: { category: ProductCategory; revenue: number }[];
}

// Single series → single hue, sorted high-to-low, direct value labels
// (≤6 categories), no legend needed (title names the series).
export default function RevenueByCategoryChart({ data }: RevenueByCategoryChartProps) {
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className={cardVariants.base}>
      <div className="flex items-center justify-between">
        <h3 className="text-h6 font-heading font-semibold text-neutral-white">Revenue by category</h3>
        <button type="button" onClick={() => setShowTable((s) => !s)} className="text-caption font-body text-accent-primary hover:underline">
          {showTable ? 'View chart' : 'View table'}
        </button>
      </div>
      <p className="mt-1 text-caption font-body text-neutral-silver">Estimated from current catalog pricing and demand — demo data.</p>

      {showTable ? (
        <table className="mt-4 w-full text-left text-body-sm font-body">
          <thead>
            <tr className="border-b border-neutral-titanium/20 text-neutral-silver">
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.category} className="border-b border-neutral-titanium/10 text-neutral-light-gray">
                <td className="py-2">{d.category}</td>
                <td className="py-2 text-right">${d.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.category} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-caption font-body text-neutral-silver">{d.category}</span>
              <div className="h-3 flex-1 rounded-full bg-bg-primary" title={`${d.category}: $${d.revenue.toLocaleString()}`}>
                <div
                  className={cn('h-full rounded-full bg-accent-primary transition-all duration-300 hover:bg-accent-light')}
                  style={{ width: `${(d.revenue / max) * 100}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-caption font-body text-neutral-light-gray">${d.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
