import React from "react";

import { Badge, Icon } from "@repo/ui";

import type { PreventiveCareScheduleItem } from "../../api/preventiveCareApi";
import { formatDueDate } from "../../utils/formatDueDate";

type PreventiveCareItemRowProps = {
  item: PreventiveCareScheduleItem;
  disabled?: boolean;
  variant: "schedule" | "checklist";
  onToggle: () => void;
};

function isOverdue(dueDate: string, completedAt: string | null): boolean {
  if (completedAt) return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

export function PreventiveCareItemRow({
  item,
  disabled,
  variant,
  onToggle
}: PreventiveCareItemRowProps) {
  const isDone = Boolean(item.completedAt);
  const overdue = isOverdue(item.dueDate, item.completedAt);
  const dueLabel = `Due ${formatDueDate(item.dueDate)}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 ${
        isDone
          ? "border-success/30 bg-success/5 hover:bg-success/10"
          : overdue
            ? "border-destructive/30 bg-destructive/5 hover:border-destructive/40 hover:bg-destructive/10"
            : "border-border/60 bg-background hover:border-primary/25 hover:bg-muted/30"
      }`}
    >
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
          isDone
            ? "border-success bg-success text-success-foreground"
            : overdue
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border bg-card"
        }`}
        aria-hidden
      >
        {isDone ? <Icon name="check" /> : overdue ? <Icon name="schedule"  /> : null}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium leading-snug ${
            isDone ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {item.title}
        </span>
        {!isDone ? (
          <span
            className={`mt-1 block text-xs ${
              overdue ? "font-medium text-destructive" : "text-muted-foreground"
            }`}
          >
            {overdue ? "Overdue · " : ""}
            {dueLabel}
          </span>
        ) : null}
      </span>

      <span className="shrink-0 self-center">
        {isDone ? (
          <Badge variant="success" className="gap-1 font-normal">
            <Icon name="check_circle"  aria-hidden />
            {formatDueDate(item.completedAt!)}
          </Badge>
        ) : overdue ? (
          <Badge variant="destructive" className="font-normal">
            Overdue
          </Badge>
        ) : variant === "checklist" ? (
          <span className="text-xs text-muted-foreground">{dueLabel}</span>
        ) : (
          <Badge variant="outline" className="font-normal tabular-nums">
            {formatDueDate(item.dueDate)}
          </Badge>
        )}
      </span>
    </button>
  );
}
