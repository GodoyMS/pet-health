import * as React from "react";

import { cn } from "../../../lib/utils/cn";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";
import { Calendar, type DateRange, parseIsoDate, toIsoDate } from "../Calendar/Calendar";

export type DateRangeValue = {
  startDate?: string;
  endDate?: string;
};

export type DateRangePickerProps = {
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
};

function formatRangeLabel(value: DateRangeValue): string | undefined {
  if (!value.startDate && !value.endDate) return undefined;

  const fmt = (iso: string) => {
    const d = parseIsoDate(iso);
    if (!d) return iso;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (value.startDate && value.endDate) {
    return `${fmt(value.startDate)} – ${fmt(value.endDate)}`;
  }
  if (value.startDate) return `From ${fmt(value.startDate)}`;
  return `Until ${fmt(value.endDate!)}`;
}

function toCalendarRange(value: DateRangeValue): DateRange | undefined {
  const from = value.startDate ? parseIsoDate(value.startDate) : undefined;
  const to = value.endDate ? parseIsoDate(value.endDate) : undefined;
  if (!from && !to) return undefined;
  return { from, to };
}

export function DateRangePicker({
  value = {},
  onChange,
  placeholder = "Filter by date range",
  className,
  align = "start"
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRangeValue>(value);

  React.useEffect(() => {
    if (!open) setDraft(value);
  }, [open, value]);

  const label = formatRangeLabel(value);
  const hasFilter = Boolean(value.startDate || value.endDate);

  const handleCalendarSelect = (next: Date | DateRange | undefined) => {
    if (!next || next instanceof Date) return;
    setDraft({
      startDate: next.from ? toIsoDate(next.from) : undefined,
      endDate: next.to ? toIsoDate(next.to) : undefined
    });
  };

  const draftLabel = formatRangeLabel(draft);
  const selectingEnd = Boolean(draft.startDate && !draft.endDate);

  const apply = () => {
    onChange?.({
      startDate: draft.startDate,
      endDate: draft.endDate ?? draft.startDate
    });
    setOpen(false);
  };

  const clear = () => {
    onChange?.({});
    setDraft({});
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-10 justify-start gap-2 px-3 font-normal",
            !label && "text-muted-foreground",
            className
          )}
        >
          <Icon name="calendar_month" className="size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{label ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <div className="border-b border-border/50 px-4 py-3">
          <p className="text-sm font-medium text-foreground">Date range</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selectingEnd
              ? "Now select an end date."
              : "Select a start date, then an end date."}
          </p>
          {draftLabel ? (
            <p className="mt-2 text-xs font-medium text-primary">{draftLabel}</p>
          ) : null}
        </div>
        <Calendar
          mode="range"
          selected={toCalendarRange(draft)}
          onSelect={handleCalendarSelect}
        />
        <div className="flex items-center justify-between gap-2 border-t border-border/50 p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={!hasFilter && !draft.startDate && !draft.endDate}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={apply} disabled={!draft.startDate}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type DatePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  /** Disables the trigger button. */
  disabled?: boolean;
  /** Dates for which selection is blocked (e.g. future birth dates). */
  disabledDate?: (date: Date) => boolean;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  align = "start",
  disabled = false,
  disabledDate
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? parseIsoDate(value) : undefined;

  const label = value
    ? selected?.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : undefined;

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start gap-2 px-3 font-normal",
            !label && "text-muted-foreground",
            className
          )}
        >
          <Icon name="event" className="size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{label ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          disabled={disabledDate}
          onSelect={(next) => {
            if (next instanceof Date) {
              onChange?.(toIsoDate(next));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
