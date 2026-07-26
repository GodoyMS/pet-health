import { useId, useMemo, useState } from "react";

import type { DistributionSlice, TimeSeriesPoint } from "@shared/api/adminApi";

/**
 * Chart mark colors validated (dataviz six-checks) against the dark surface:
 * teal #0d9488 is the primary series hue; identity is always carried by
 * direct labels/tooltips, never color alone.
 */
export const SERIES_TEAL = "#0d9488";

const CHART_HEIGHT = 140;
const PAD_X = 4;
const PAD_TOP = 8;
const PAD_BOTTOM = 20;

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface TooltipState {
  index: number;
  x: number;
}

function useNiceMax(values: number[]): number {
  return useMemo(() => {
    const max = Math.max(1, ...values);
    const magnitude = 10 ** Math.floor(Math.log10(max));
    return Math.ceil(max / magnitude) * magnitude;
  }, [values]);
}

/** Single-series area chart with crosshair + tooltip (time on x). */
export function AreaChart({
  data,
  width = 560
}: {
  data: TimeSeriesPoint[];
  width?: number;
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<TooltipState | null>(null);
  const niceMax = useNiceMax(data.map((d) => d.count));

  if (data.length < 2) {
    return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  const innerW = width - PAD_X * 2;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = innerW / (data.length - 1);
  const x = (i: number) => PAD_X + i * stepX;
  const y = (v: number) => PAD_TOP + innerH - (v / niceMax) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.count).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${
    PAD_TOP + innerH
  } L${x(0).toFixed(1)},${PAD_TOP + innerH} Z`;

  const hovered = hover ? data[hover.index] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Time series chart"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * width;
          const index = Math.min(
            data.length - 1,
            Math.max(0, Math.round((px - PAD_X) / stepX))
          );
          setHover({ index, x: x(index) });
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES_TEAL} stopOpacity="0.3" />
            <stop offset="100%" stopColor={SERIES_TEAL} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* recessive horizontal gridlines */}
        {[0.5, 1].map((f) => (
          <line
            key={f}
            x1={PAD_X}
            x2={width - PAD_X}
            y1={y(niceMax * f)}
            y2={y(niceMax * f)}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={SERIES_TEAL}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hover ? (
          <>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD_TOP}
              y2={PAD_TOP + innerH}
              stroke="currentColor"
              className="text-muted-foreground/50"
              strokeWidth="1"
            />
            <circle
              cx={hover.x}
              cy={y(data[hover.index].count)}
              r="4"
              fill={SERIES_TEAL}
              stroke="var(--card)"
              strokeWidth="2"
            />
          </>
        ) : null}

        {/* x-axis end labels */}
        <text
          x={PAD_X}
          y={CHART_HEIGHT - 4}
          className="fill-current text-muted-foreground"
          fontSize="10"
        >
          {shortDate(data[0].date)}
        </text>
        <text
          x={width - PAD_X}
          y={CHART_HEIGHT - 4}
          textAnchor="end"
          className="fill-current text-muted-foreground"
          fontSize="10"
        >
          {shortDate(data[data.length - 1].date)}
        </text>
      </svg>

      {hovered ? (
        <div
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md"
          style={{ left: `${(hover!.x / width) * 100}%` }}
        >
          <span className="text-muted-foreground">{shortDate(hovered.date)}</span>{" "}
          <span className="font-semibold tabular-nums">{hovered.count}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Single-series bar chart with per-bar hover tooltip. */
export function BarChart({
  data,
  width = 560
}: {
  data: TimeSeriesPoint[];
  width?: number;
}) {
  const [hover, setHover] = useState<TooltipState | null>(null);
  const niceMax = useNiceMax(data.map((d) => d.count));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Not enough data yet.</p>;
  }

  const innerW = width - PAD_X * 2;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = innerW / data.length;
  const barW = Math.max(4, slot - 2); // 2px surface gap between bars
  const hovered = hover ? data[hover.index] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Bar chart"
        onMouseLeave={() => setHover(null)}
      >
        {[0.5, 1].map((f) => (
          <line
            key={f}
            x1={PAD_X}
            x2={width - PAD_X}
            y1={PAD_TOP + innerH - innerH * f}
            y2={PAD_TOP + innerH - innerH * f}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
        ))}

        {data.map((d, i) => {
          const h = (d.count / niceMax) * innerH;
          const bx = PAD_X + i * slot + (slot - barW) / 2;
          const by = PAD_TOP + innerH - h;
          const r = Math.min(4, barW / 2, h);
          return (
            <g key={d.date}>
              {/* rounded top, flat baseline */}
              {h > 0 ? (
                <path
                  d={`M${bx},${by + r} Q${bx},${by} ${bx + r},${by} H${bx + barW - r} Q${bx + barW},${by} ${bx + barW},${by + r} V${PAD_TOP + innerH} H${bx} Z`}
                  fill={SERIES_TEAL}
                  opacity={hover && hover.index !== i ? 0.55 : 1}
                />
              ) : null}
              {/* oversized hit target */}
              <rect
                x={PAD_X + i * slot}
                y={PAD_TOP}
                width={slot}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover({ index: i, x: bx + barW / 2 })}
              />
            </g>
          );
        })}

        <text
          x={PAD_X}
          y={CHART_HEIGHT - 4}
          className="fill-current text-muted-foreground"
          fontSize="10"
        >
          {shortDate(data[0].date)}
        </text>
        <text
          x={width - PAD_X}
          y={CHART_HEIGHT - 4}
          textAnchor="end"
          className="fill-current text-muted-foreground"
          fontSize="10"
        >
          {shortDate(data[data.length - 1].date)}
        </text>
      </svg>

      {hovered ? (
        <div
          className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md"
          style={{ left: `${(hover!.x / width) * 100}%` }}
        >
          <span className="text-muted-foreground">{shortDate(hovered.date)}</span>{" "}
          <span className="font-semibold tabular-nums">{hovered.count}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Horizontal category bars with direct labels; values wear text tokens. */
export function DistributionBars({ data }: { data: DistributionSlice[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {data.map((slice) => (
        <li key={slice.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">{slice.label}</span>
            <span className="font-medium tabular-nums text-muted-foreground">
              {slice.count.toLocaleString()}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(2, (slice.count / max) * 100)}%`,
                backgroundColor: SERIES_TEAL
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
