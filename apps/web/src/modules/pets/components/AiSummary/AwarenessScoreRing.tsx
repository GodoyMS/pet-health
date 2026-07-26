import React from "react";

import {
  getAwarenessScoreLabel,
  getAwarenessScoreRingColor
} from "../../utils/awarenessScore";

type AwarenessScoreRingProps = {
  score: number;
  size?: "sm" | "lg";
  showLabel?: boolean;
};

const SIZE_CONFIG = {
  sm: { dim: 80, stroke: 6, text: "text-xl", sub: "text-[10px]" },
  lg: { dim: 140, stroke: 8, text: "text-4xl", sub: "text-xs" }
};

export function AwarenessScoreRing({
  score,
  size = "lg",
  showLabel = true
}: AwarenessScoreRingProps) {
  const config = SIZE_CONFIG[size];
  const radius = (config.dim - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = getAwarenessScoreRingColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.dim, height: config.dim }}
      >
        <svg
          width={config.dim}
          height={config.dim}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={config.dim / 2}
            cy={config.dim / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            className="stroke-muted/40"
          />
          <circle
            cx={config.dim / 2}
            cy={config.dim / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${ringColor} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display font-bold tabular-nums text-foreground ${config.text}`}
          >
            {score}
          </span>
          {showLabel ? (
            <span className={`font-medium uppercase tracking-wider text-muted-foreground ${config.sub}`}>
              / 100
            </span>
          ) : null}
        </div>
      </div>
      {showLabel ? (
        <p className="text-sm font-medium text-muted-foreground">
          {getAwarenessScoreLabel(score)}
        </p>
      ) : null}
    </div>
  );
}
