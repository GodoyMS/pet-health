import { useId } from "react";

import type { WeightTrendPoint } from "../../api/analyticsApi";

export function WeightTrendChart({ data }: { data: WeightTrendPoint[] }) {
  const gradId = useId();

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No weight data yet. Add health logs to see trends.
      </p>
    );
  }

  const w = 480;
  const h = 200;
  const padX = 36;
  const padY = 28;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const weightsOnly = data.map((d) => d.kg);
  const minKg = Math.min(...weightsOnly) - 0.15;
  const maxKg = Math.max(...weightsOnly) + 0.15;
  const span = maxKg - minKg || 1;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padY + innerH - ((d.kg - minKg) / span) * innerH;
    return { x, y };
  });

  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = `${lineD} L ${points[points.length - 1]?.x ?? padX} ${padY + innerH} L ${points[0]?.x ?? padX} ${padY + innerH} Z`;
  const yTicks = [maxKg, (maxKg + minKg) / 2, minKg];

  return (
    <div className="text-primary">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-52 w-full max-h-52"
        role="img"
        aria-label="Weight trend over recent months"
      >
        <title>Weight trend</title>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {yTicks.map((kg, i) => {
          const y = padY + innerH - ((kg - minKg) / span) * innerH;
          return (
            <g key={i}>
              <line
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                className="stroke-border/60"
                strokeWidth={1}
                strokeDasharray="4 6"
              />
              <text
                x={4}
                y={y + 4}
                className="fill-muted-foreground text-[10px] tabular-nums"
              >
                {kg.toFixed(1)}
              </text>
            </g>
          );
        })}
        <path d={areaD} fill={`url(#${gradId})`} />
        <path
          d={lineD}
          fill="none"
          className="stroke-primary"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            className="fill-card stroke-primary"
            strokeWidth={2}
          />
        ))}
        {data.map((d, i) => (
          <text
            key={d.date}
            x={points[i]?.x ?? 0}
            y={h - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-medium"
          >
            {d.label}
          </text>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground tabular-nums">
        Range {minKg.toFixed(1)}–{maxKg.toFixed(1)} kg · monthly averages
      </p>
    </div>
  );
}
