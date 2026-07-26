import React, { useMemo, useState } from "react";

import { Icon, Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";

import type {
  PreventiveCareGroupKey,
  PreventiveCareScheduleGroup,
  PreventiveCareScheduleItem
} from "../../api/preventiveCareApi";
import { PreventiveCareGroupCard } from "./PreventiveCareGroupCard";
import { getPreventiveCareItemStats } from "./preventiveCareStats";

type PreventiveCareScheduleTabsProps = {
  groups: PreventiveCareScheduleGroup[];
  petName: string;
  onToggleItem: (item: PreventiveCareScheduleItem) => void;
  togglingItemId?: string;
};

function tabGridClass(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-3";
}

export function   PreventiveCareScheduleTabs({
  groups,
  petName,
  onToggleItem,
  togglingItemId
}: PreventiveCareScheduleTabsProps) {
  const defaultTab = groups[0]?.key ?? "vaccination";
  const [activeTab, setActiveTab] = useState<PreventiveCareGroupKey>(defaultTab);

  const resolvedTab = useMemo(() => {
    if (groups.some((g) => g.key === activeTab)) return activeTab;
    return groups[0]?.key ?? defaultTab;
  }, [groups, activeTab, defaultTab]);

  const overallStats = useMemo(() => {
    const allItems = groups.flatMap((g) => g.items);
    return getPreventiveCareItemStats(allItems);
  }, [groups]);

  const overallPct =
    overallStats.total > 0
      ? Math.round((overallStats.completed / overallStats.total) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Year progress
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {overallStats.completed}
              <span className="text-lg font-normal text-muted-foreground">
                {" "}
                / {overallStats.total} completed
              </span>
            </p>
            {overallStats.overdue > 0 ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                <Icon name="error" className="size-4" aria-hidden />
                {overallStats.overdue} overdue across all categories
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Tap an item to mark it done or undo.
              </p>
            )}
          </div>
          <div
            className="relative flex size-20 shrink-0 items-center justify-center self-start sm:self-center"
            aria-hidden
          >
            <svg className="size-20 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-primary transition-all duration-500"
                strokeWidth="3"
                strokeDasharray={`${overallPct} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-semibold text-foreground">
              {overallPct}%
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {groups.map((group) => {
            const stats = getPreventiveCareItemStats(group.items);
            const pct =
              stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0;
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => setActiveTab(group.key)}
                className={`rounded-lg border px-3 py-2.5 text-left transition ${
                  resolvedTab === group.key
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 bg-background/60 hover:border-primary/25 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name={group.icon} className="size-4 text-primary" aria-hidden />
                  <span className="truncate text-xs font-medium text-foreground">
                    {group.title.replace(/ schedule$/i, "").replace(/ checklist$/i, "")}
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {stats.completed}/{stats.total}
                </p>
                <p className="text-[11px] text-muted-foreground">{pct}% complete</p>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs
        value={resolvedTab}
        onValueChange={(value) => setActiveTab(value as PreventiveCareGroupKey)}
        className="gap-4"
      >
        <TabsList className={`grid h-auto w-full p-1 ${tabGridClass(groups.length)}`}>
          {groups.map((group) => {
            const stats = getPreventiveCareItemStats(group.items);
            return (
              <TabsTrigger
                key={group.key}
                value={group.key}
                className="gap-1.5 px-2 py-2.5 text-xs sm:text-sm"
              >
                <Icon name={group.icon} className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{group.title.replace(/ schedule$/i, "")}</span>
                {stats.pending > 0 ? (
                  <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                    {stats.pending}
                  </span>
                ) : (
                  <Icon name="check_circle" className="size-3.5 text-success" aria-hidden />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {groups.map((group) => (
          <TabsContent key={group.key} value={group.key} className="mt-0">
            <PreventiveCareGroupCard
              group={group}
              petName={petName}
              onToggleItem={onToggleItem}
              togglingItemId={togglingItemId}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
