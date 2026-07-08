interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

// Bare stat-tile sparkline: single accent hue, no axes/gridlines/hover —
// the allowed exception to the "always ship a hover layer" rule for a
// tile with no plot area of its own.
export default function Sparkline({ data, width = 96, height = 32 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="overflow-visible">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#2FE7F2"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={parseFloat(points[points.length - 1].split(',')[1])} r={2.5} fill="#2FE7F2" />
    </svg>
  );
}
