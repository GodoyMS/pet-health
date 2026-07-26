import React, { useMemo, useState } from "react";
import { Badge, Button, Icon, Skeleton, toast } from "@repo/ui";
import { Link, useSearchParams } from "react-router-dom";

import {
  useAllPreventiveCareCalendar,
  useCalendarStatus
} from "../../google-calendar/hooks/useGoogleCalendar";
import { SyncModal } from "../../google-calendar/components/SyncModal";
import type { CalendarPreventiveCareItem } from "../../google-calendar/api/googleCalendarApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const TYPE_META: Record<string, { label: string; color: string; dot: string; bg: string; icon: string }> = {
  vaccination:      { label: "Vaccination",      color: "text-emerald-700", dot: "bg-emerald-500",  bg: "bg-emerald-50 border-emerald-200",     icon: "vaccines"    },
  deworming:        { label: "Deworming",         color: "text-orange-700",  dot: "bg-orange-500",   bg: "bg-orange-50 border-orange-200",       icon: "medication"  },
  checkup:          { label: "Checkup",           color: "text-blue-700",    dot: "bg-blue-500",     bg: "bg-blue-50 border-blue-200",           icon: "stethoscope" },
  parasite_control: { label: "Parasite Control",  color: "text-amber-700",   dot: "bg-amber-500",    bg: "bg-amber-50 border-amber-200",         icon: "bug_report"  }
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const [searchParams] = useSearchParams();
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [filterPetId, setFilterPetId]     = useState("all");
  const [filterType, setFilterType]       = useState("all");
  const [view, setView]                   = useState<"month" | "list">("month");
  const [currentMonth, setCurrentMonth]   = useState(new Date().getMonth());
  const [currentYear, setCurrentYear]     = useState(CURRENT_YEAR);

  const { data: calendarData, isLoading: itemsLoading } = useAllPreventiveCareCalendar(CURRENT_YEAR);
  const { data: status, isLoading: statusLoading }      = useCalendarStatus();

  React.useEffect(() => {
    const cal = searchParams.get("calendar");
    if (cal === "connected") toast.success("Google Calendar connected!");
    else if (cal === "error") toast.error("Could not connect Google Calendar. Try again.");
  }, []);

  const allItems       = calendarData?.items ?? [];
  const pendingCount   = allItems.filter((i) => !i.completedAt).length;
  const completedCount = allItems.filter((i) =>  i.completedAt).length;
  const unsyncedPets   = status?.pets.filter((p) => !p.synced && p.pendingCount > 0) ?? [];

  const petsInCalendar = useMemo(() => {
    const map = new Map<string, string>();
    allItems.forEach((i) => map.set(i.petId, i.petName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allItems]);

  const filteredItems = useMemo(() =>
    allItems.filter((i) => {
      if (filterPetId !== "all" && i.petId !== filterPetId) return false;
      if (filterType  !== "all" && i.type  !== filterType)  return false;
      return true;
    }),
  [allItems, filterPetId, filterType]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarPreventiveCareItem[]>();
    filteredItems.forEach((item) => {
      const list = map.get(item.dueDate) ?? [];
      list.push(item);
      map.set(item.dueDate, list);
    });
    return map;
  }, [filteredItems]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };
  const goToday = () => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); };

  return (
    <section className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Care Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preventive care schedule for all your pets — {CURRENT_YEAR}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start shrink-0">
          {!statusLoading && !status?.connected && (
            <Link to="/dashboard/settings">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Icon name="calendar_add_on" className="text-sm" />
                Connect Google Calendar
              </Button>
            </Link>
          )}
          {status?.connected && (
            <Button size="sm" onClick={() => setSyncModalOpen(true)} className="gap-1.5">
              <Icon name="sync" className="text-sm" />
              Sync to Google Calendar
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {itemsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard icon="event_note"    label="Total"     value={allItems.length}      accent="oklch(0.55 0.12 181)" />
            <StatCard icon="schedule"      label="Pending"   value={pendingCount}          accent="#f59e0b" />
            <StatCard icon="check_circle"  label="Completed" value={completedCount}        accent="#10b981" />
            <StatCard icon="pets"          label="Pets"      value={petsInCalendar.length} accent="#3b82f6" />
          </>
        )}
      </div>

      {/* ── Unsynced suggestion ── */}
      {status?.connected && unsyncedPets.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Icon name="info" className="text-sm text-amber-600" />
          </div>
          <p className="flex-1 text-sm text-amber-800">
            <span className="font-medium">{unsyncedPets.map((p) => p.name).join(", ")}</span>
            {" "}not synced to Google Calendar yet.
          </p>
          <button
            onClick={() => setSyncModalOpen(true)}
            className="shrink-0 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200"
          >
            Sync now
          </button>
        </div>
      )}

      {/* ── Toolbar: month nav + filters + view toggle ── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60">

          {/* Month navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon name="chevron_left" className="text-lg" />
            </button>
            <button
              onClick={goToday}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted min-w-[160px] text-center"
            >
              {MONTHS[currentMonth]} {currentYear}
            </button>
            <button
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon name="chevron_right" className="text-lg" />
            </button>
            <button
              onClick={goToday}
              className="ml-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              Today
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 self-start sm:self-auto">
            <ViewBtn active={view === "month"} onClick={() => setView("month")} icon="calendar_view_month" label="Month" />
            <ViewBtn active={view === "list"}  onClick={() => setView("list")}  icon="view_agenda"         label="List"  />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
          {/* Pet filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5">
            <Icon name="pets" className="text-sm text-muted-foreground" />
            <select
              value={filterPetId}
              onChange={(e) => setFilterPetId(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All pets</option>
              {petsInCalendar.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Type filter chips */}
          <div className="flex flex-wrap gap-1.5">
            <TypeChip active={filterType === "all"} onClick={() => setFilterType("all")} label="All" />
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <TypeChip
                key={key}
                active={filterType === key}
                onClick={() => setFilterType(key)}
                label={meta.label}
                dotClass={meta.dot}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Calendar body ── */}
      {itemsLoading ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
          <div className="grid grid-cols-7 gap-px mb-2">
            {WEEKDAYS.map((d) => <Skeleton key={d} className="h-5 rounded" />)}
          </div>
          <Skeleton className="h-[480px] w-full rounded-xl" />
        </div>
      ) : allItems.length === 0 ? (
        <EmptyState />
      ) : view === "month" ? (
        <MonthView
          year={currentYear}
          month={currentMonth}
          eventsByDate={eventsByDate}
        />
      ) : (
        <ListView items={filteredItems} />
      )}

      {/* ── Legend ── */}
      {!itemsLoading && allItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
          {Object.entries(TYPE_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <span className="text-xs text-muted-foreground">{meta.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Disclaimer ── */}
      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        <strong className="font-medium text-muted-foreground">Educational use only.</strong>{" "}
        Always confirm preventive care timing and products with your veterinarian.
      </p>

      {status?.connected && (
        <SyncModal open={syncModalOpen} onClose={() => setSyncModalOpen(false)} pets={status.pets} />
      )}
    </section>
  );
}

// ─── Month grid ───────────────────────────────────────────────────────────────

function MonthView({
  year,
  month,
  eventsByDate
}: {
  year: number;
  month: number;
  eventsByDate: Map<string, CalendarPreventiveCareItem[]>;
}) {
  const today        = new Date();
  const todayKey     = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);

  // Build cell array: leading empties + days
  const cells: Array<{ day: number | null }> = [
    ...Array.from({ length: firstDay }, () => ({ day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1 }))
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push({ day: null });

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="divide-y divide-border/40">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border/40 min-h-[100px]">
            {week.map((cell, ci) => {
              if (!cell.day) {
                return <div key={ci} className="bg-muted/10 min-h-[100px]" />;
              }
              const key    = toDateKey(year, month, cell.day);
              const events = eventsByDate.get(key) ?? [];
              const isToday = key === todayKey;
              const isPast  = new Date(key) < new Date(todayKey);

              return (
                <DayCell
                  key={ci}
                  day={cell.day}
                  isToday={isToday}
                  isPast={isPast}
                  events={events}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayCell({
  day,
  isToday,
  isPast,
  events
}: {
  day: number;
  isToday: boolean;
  isPast: boolean;
  events: CalendarPreventiveCareItem[];
}) {
  const MAX_VISIBLE = 3;
  const visible = events.slice(0, MAX_VISIBLE);
  const overflow = events.length - MAX_VISIBLE;

  return (
    <div
      className={`group relative flex flex-col gap-0.5 p-1.5 sm:p-2 transition-colors hover:bg-muted/20 cursor-default min-h-[100px] ${
        isPast && !isToday ? "opacity-60" : ""
      }`}
    >
      {/* Day number */}
      <div className="mb-1 flex justify-end">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
            isToday
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground group-hover:text-foreground"
          }`}
        >
          {day}
        </span>
      </div>

      {/* Events */}
      {visible.map((item) => (
        <EventPill key={item.id} item={item} />
      ))}
      {overflow > 0 && (
        <span className="mt-0.5 text-[10px] font-medium text-muted-foreground px-1">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

function EventPill({ item }: { item: CalendarPreventiveCareItem }) {
  const meta = TYPE_META[item.type];
  const done = !!item.completedAt;

  return (
    <Link
      to={`/dashboard/pets/${item.petId}/preventive-care`}
      className={`group/pill flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight border transition-all hover:shadow-sm ${
        done ? "opacity-50 line-through" : ""
      } ${meta?.bg ?? "bg-muted/60 border-border"} ${meta?.color ?? "text-foreground"}`}
      title={`${item.petName}: ${item.title}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta?.dot ?? "bg-muted-foreground"}`} />
      <span className="truncate min-w-0">
        <span className="opacity-60">{item.petName}</span>
        {" · "}
        {item.title}
      </span>
    </Link>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────

function ListView({ items }: { items: CalendarPreventiveCareItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">No events match the current filter.</p>
      </div>
    );
  }

  // Group by month
  const grouped = new Map<string, CalendarPreventiveCareItem[]>();
  items.forEach((item) => {
    const [yr, mo] = item.dueDate.split("-");
    const key = `${yr}-${mo}`;
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border/50 overflow-hidden">
      {Array.from(grouped.entries()).map(([monthKey, monthItems]) => {
        const [yr, mo] = monthKey.split("-");
        const label    = `${MONTHS[parseInt(mo, 10) - 1]} ${yr}`;
        return (
          <div key={monthKey}>
            <div className="bg-muted/30 px-4 py-2.5 border-b border-border/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
            <div className="divide-y divide-border/30">
              {monthItems.map((item) => {
                const meta     = TYPE_META[item.type];
                const done     = !!item.completedAt;
                const isPast   = item.dueDate < todayStr && !done;
                const isToday  = item.dueDate === todayStr;
                const dateObj  = new Date(item.dueDate + "T00:00:00");
                const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

                return (
                  <Link
                    key={item.id}
                    to={`/dashboard/pets/${item.petId}/preventive-care`}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/20"
                  >
                    {/* Date column */}
                    <div className={`w-14 shrink-0 text-center ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      <p className="text-xs font-medium">{dayLabel.split(" ")[0]}</p>
                      <p className={`text-lg font-bold leading-none ${isToday ? "text-primary" : "text-foreground"}`}>
                        {dayLabel.split(" ")[1]}
                      </p>
                    </div>

                    {/* Type indicator */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta?.bg ?? "bg-muted border-border"}`}>
                      <Icon name={meta?.icon ?? "event"} className={`text-base ${meta?.color ?? "text-muted-foreground"}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${done ? "line-through opacity-50" : "text-foreground"}`}>
                        {item.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Icon name="pets" className="text-xs text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.petName}</span>
                        <span className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${meta?.bg ?? ""} ${meta?.color ?? ""}`}>
                          <span className={`h-1 w-1 rounded-full ${meta?.dot ?? ""}`} />
                          {meta?.label ?? item.type}
                        </span>
                      </div>
                    </div>

                    {/* Status / chevron */}
                    <div className="shrink-0 flex items-center gap-2">
                      {done && (
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <Icon name="check_circle" className="text-sm" />
                          Done
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-medium text-destructive/70 bg-destructive/10 rounded-full px-2 py-0.5">
                          Overdue
                        </span>
                      )}
                      <Icon name="chevron_right" className="text-sm text-muted-foreground/40" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: number; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}18` }}>
          <Icon name={icon} />
        </div>
      </div>
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon name={icon} className="text-sm" />
      {label}
    </button>
  );
}

function TypeChip({ active, onClick, label, dotClass }: { active: boolean; onClick: () => void; label: string; dotClass?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all border ${
        active
          ? "border-primary/30 bg-primary/8 text-primary"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
      }`}
    >
      {dotClass && <span className={`h-1.5 w-1.5 rounded-full ${dotClass} opacity-80`} />}
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
        <Icon name="event_busy" className="text-3xl text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">No events for {CURRENT_YEAR}</p>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-xs leading-relaxed">
        Add pets with breeds to generate a tailored preventive care schedule.
      </p>
      <Link to="/dashboard/pets">
        <Button variant="outline" className="mt-6 gap-2">
          <Icon name="pets" className="text-sm" />
          Manage pets
        </Button>
      </Link>
    </div>
  );
}
