import React from "react";

import { Icon } from "@repo/ui";

import type {
  PreventiveCareScheduleGroup,
  PreventiveCareScheduleItem
} from "../../api/preventiveCareApi";
import { getPreventiveCareItemStats } from "./preventiveCareStats";
import { PreventiveCareItemRow } from "./PreventiveCareItemRow";

type PreventiveCareGroupCardProps = {
  group: PreventiveCareScheduleGroup;
  petName: string;
  onToggleItem: (item: PreventiveCareScheduleItem) => void;
  togglingItemId?: string;
};

export function PreventiveCareGroupCard({
  group,
  petName,
  onToggleItem,
  togglingItemId
}: PreventiveCareGroupCardProps) {
  const variant = group.key === "checklist" ? "checklist" : "schedule";
  const stats = getPreventiveCareItemStats(group.items);
  const progressPct =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <section className="rounded-xl border border-border/50 bg-card/80 shadow-sm">
      <header className="border-b border-border/40 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name={group.icon} className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold text-foreground">
              {group.title}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{group.subtitle}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {stats.completed} of {stats.total} done for {petName}
            </span>
            <span className="font-medium text-foreground">{progressPct}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${group.title} completion`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {stats.overdue > 0 ? (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <Icon name="schedule"  aria-hidden />
              {stats.overdue} overdue {stats.overdue === 1 ? "item" : "items"}
            </p>
          ) : null}
        </div>
      </header>

      <ul className="flex flex-col gap-2 p-4 sm:p-5">
        {group.items.map((item) => (
          <li key={item.id}>
            <PreventiveCareItemRow
              item={item}
              disabled={togglingItemId === item.id}
              variant={variant}
              onToggle={() => onToggleItem(item)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
