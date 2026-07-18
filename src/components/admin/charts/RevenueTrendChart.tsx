'use client';

import { useState, type MouseEvent } from 'react';
import { cardVariants } from '@/design';

interface RevenueTrendChartProps {
  data: { date: string; value: number }[];
}

const WIDTH = 600;
const HEIGHT = 220;
const PADDING = 24;

// Single series → single hue line/area, hover crosshair + tooltip (this
// larger chart merits the interactive layer, unlike the tiny stat sparklines).
export default function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const [showTable, setShowTable] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: PADDING + (i / (data.length - 1)) * (WIDTH - PADDING * 2),
    y: HEIGHT - PADDING - ((d.value - min) / range) * (HEIGHT - PADDING * 2),
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L${lastPoint.x.toFixed(1)},${HEIGHT - PADDING} L${firstPoint.x.toFixed(1)},${HEIGHT - PADDING} Z`;

  function handleMove(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className={cardVariants.base}>
      <div className="flex items-center justify-between">
        <h3 className="text-h6 font-heading font-semibold text-neutral-white">Revenue, last 30 days</h3>
        <button type="button" onClick={() => setShowTable((s) => !s)} className="text-caption font-body text-accent-primary hover:underline">
          {showTable ? 'View chart' : 'View table'}
        </button>
      </div>
      <p className="mt-1 text-caption font-body text-neutral-silver">Seeded demo series — not live revenue tracking.</p>

      {showTable ? (
        <div className="mt-4 max-h-64 overflow-y-auto">
          <table className="w-full text-left text-body-sm font-body">
            <thead>
              <tr className="border-b border-neutral-titanium/20 text-neutral-silver">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date} className="border-b border-neutral-titanium/10 text-neutral-light-gray">
                  <td className="py-2">{d.date}</td>
                  <td className="py-2 text-right">${d.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full cursor-crosshair"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
            role="img"
            aria-label="Revenue trend over the last 30 days"
          >
            <defs>
              <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38E8E8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38E8E8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#revenue-area)" stroke="none" />
            <path d={linePath} fill="none" stroke="#38E8E8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {hovered && (
              <>
                <line x1={hovered.x} y1={PADDING} x2={hovered.x} y2={HEIGHT - PADDING} stroke="#6C757D" strokeWidth={1} strokeDasharray="3,3" />
                <circle cx={hovered.x} cy={hovered.y} r={4} fill="#38E8E8" stroke="#1A1A1A" strokeWidth={2} />
              </>
            )}
          </svg>
          {hovered && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-neutral-titanium/30 bg-bg-secondary px-2.5 py-1.5 text-caption font-body text-neutral-white shadow-elevation"
              style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
            >
              <p className="font-semibold">${hovered.value.toLocaleString()}</p>
              <p className="text-neutral-silver">{hovered.date}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
