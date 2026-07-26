import React from "react";

import { Icon } from "@repo/ui";

import type { LifestyleGuidanceItem } from "../../api/lifestyleApi";

type LifestyleGuidanceListProps = {
  items: LifestyleGuidanceItem[];
  emptyMessage: string;
};

export function LifestyleGuidanceList({
  items,
  emptyMessage
}: LifestyleGuidanceListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <article className="flex gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 shadow-sm">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name="tips_and_updates" className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-medium leading-snug text-foreground">
                  {item.title}
                </h3>
                <span
                  className="inline-flex shrink-0 items-center rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium leading-tight text-muted-foreground"
                  title={item.validForLabel}
                >
                  <Icon
                    name="schedule"
                    className="mr-1 size-3 shrink-0 opacity-70"
                    aria-hidden
                  />
                  {item.validForLabel}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
