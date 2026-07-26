import React from "react";

import { Icon, Skeleton } from "@repo/ui";

export function HealthLogKpiCard({
  label,
  icon,
  value,
  isLoading
}: {
  label: string;
  icon: string;
  value: number | null;
  isLoading?: boolean;
}) {
  const display = value === null ? "—" : value.toFixed(1);
  const pct = value === null ? 0 : (value / 5) * 100;

  return (
    <article className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
              {display}
              {value !== null ? (
                <span className="ml-1 text-sm font-normal text-muted-foreground">/ 5</span>
              ) : null}
            </p>
          )}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} className="size-5" aria-hidden />
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        {isLoading ? (
          <Skeleton className="h-full w-2/3 rounded-full" />
        ) : (
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
            role="presentation"
          />
        )}
      </div>
    </article>
  );
}
