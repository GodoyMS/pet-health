import * as React from "react";

import { cn } from "../../../lib/utils/cn";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";

export type DateRange = {
  from?: Date;
  to?: Date;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, from: Date, to: Date): boolean {
  const t = startOfDay(date).getTime();
  return t >= startOfDay(from).getTime() && t <= startOfDay(to).getTime();
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoDate(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function buildMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export type CalendarProps = {
  className?: string;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  mode?: "single" | "range";
  selected?: Date | DateRange;
  onSelect?: (value: Date | DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
};

export function Calendar({
  className,
  month: controlledMonth,
  onMonthChange,
  mode = "single",
  selected,
  onSelect,
  disabled
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(
    () => controlledMonth ?? startOfDay(new Date())
  );

  const visibleMonth = controlledMonth ?? internalMonth;

  const setMonth = (next: Date) => {
    if (!controlledMonth) setInternalMonth(next);
    onMonthChange?.(next);
  };

  const handleDayClick = (day: Date) => {
    if (disabled?.(day)) return;

    if (mode === "single") {
      onSelect?.(day);
      return;
    }

    const range = (selected as DateRange | undefined) ?? {};
    if (!range.from || (range.from && range.to)) {
      onSelect?.({ from: day, to: undefined });
      return;
    }

    if (isSameDay(day, range.from)) {
      onSelect?.({ from: day, to: day });
      return;
    }

    if (day < range.from) {
      onSelect?.({ from: day, to: range.from });
      return;
    }

    onSelect?.({ from: range.from, to: day });
  };

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  const cells = buildMonthGrid(visibleMonth);
  const today = startOfDay(new Date());

  const range =
    mode === "range" && selected && !(selected instanceof Date)
      ? (selected as DateRange)
      : undefined;

  return (
    <div className={cn("w-[280px] select-none p-2", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Previous month"
          onClick={() =>
            setMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))
          }
        >
          <Icon name="chevron_left" className="size-4" aria-hidden />
        </Button>
        <span className="text-sm font-medium text-foreground">{monthLabel}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Next month"
          onClick={() =>
            setMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))
          }
        >
          <Icon name="chevron_right" className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}

        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-9" aria-hidden />;
          }

          const isToday = isSameDay(day, today);
          const isDisabled = disabled?.(day) ?? false;

          const isRangeStart =
            range?.from && isSameDay(day, range.from);
          const isRangeEnd = range?.to && isSameDay(day, range.to);
          const inRange =
            range?.from &&
            range?.to &&
            isBetween(day, range.from, range.to);

          const isSingleSelected =
            mode === "single" &&
            selected instanceof Date &&
            isSameDay(day, selected);

          return (
            <button
              key={toIsoDate(day)}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDayClick(day)}
              className={cn(
                "h-9 rounded-md text-sm tabular-nums transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isDisabled && "pointer-events-none opacity-40",
                isToday && "font-semibold text-primary",
                (isSingleSelected || isRangeStart || isRangeEnd) &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                inRange &&
                  !isRangeStart &&
                  !isRangeEnd &&
                  "rounded-none bg-primary/15 text-foreground"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toIsoDate, parseIsoDate, startOfDay, isSameDay };
