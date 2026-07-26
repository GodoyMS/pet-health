import type { LoggingConsistency } from "../../api/analyticsApi";
import { formatDueDate } from "../../utils/formatDueDate";
import { Icon } from "@repo/ui";

function WeekDayCell({ day }: { day: LoggingConsistency["currentWeekDays"][number] }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={`text-xs font-medium ${day.isToday ? "text-primary" : "text-muted-foreground"}`}
      >
        {day.short}
      </span>
      <div
        className={`flex size-10 items-center justify-center rounded-full border-2 transition sm:size-11 ${
          day.logged
            ? "border-primary bg-primary text-primary-foreground"
            : day.isToday
              ? "border-primary/50 bg-primary/5 text-muted-foreground"
              : "border-border/60 bg-muted/30 text-muted-foreground"
        }`}
        title={
          day.logged
            ? `Logged on ${formatDueDate(day.date)}`
            : `No log on ${formatDueDate(day.date)}`
        }
        aria-label={
          day.logged
            ? `${day.short}: logged`
            : `${day.short}: not logged${day.isToday ? ", today" : ""}`
        }
      >
        {day.logged ? (
          <Icon name="check" className="size-5" aria-hidden />
        ) : (
          <span className="size-2 rounded-full bg-current opacity-40" aria-hidden />
        )}
      </div>
    </div>
  );
}

function WeekBarRow({
  label,
  loggedDays
}: {
  label: string;
  loggedDays: number;
}) {
  const pct = Math.round((loggedDays / 7) * 100);

  return (
    <div className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 sm:grid-cols-[8rem_1fr_3.5rem]">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={loggedDays}
          aria-valuemin={0}
          aria-valuemax={7}
          aria-label={`${label}: ${loggedDays} of 7 days`}
        />
      </div>
      <span className="text-right text-sm font-medium tabular-nums text-foreground">
        {loggedDays}/7
      </span>
    </div>
  );
}

function SummaryIcon({ consistency }: { consistency: LoggingConsistency }) {
  if (consistency.totalLogsLast30Days === 0) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon name="assignment" className="size-6" aria-hidden />
      </div>
    );
  }
  if (consistency.streakDays >= 3) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
        <Icon name="local_fire_department" className="size-6" aria-hidden />
      </div>
    );
  }
  if (consistency.weekCompletion >= 4) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Icon name="thumb_up" className="size-6" aria-hidden />
      </div>
    );
  }
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon name="edit_note" className="size-6" aria-hidden />
    </div>
  );
}

export function LoggingConsistencyPanel({
  consistency
}: {
  consistency: LoggingConsistency;
}) {
  const hasAnyLogs = consistency.totalLogsLast30Days > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:p-5">
        <SummaryIcon consistency={consistency} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {consistency.headline}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {consistency.subline}
          </p>
          {hasAnyLogs && consistency.lastLogDate ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last check-in:{" "}
              <span className="font-medium text-foreground">
                {formatDueDate(consistency.lastLogDate)}
                {consistency.daysSinceLastLog === 0
                  ? " (today)"
                  : consistency.daysSinceLastLog === 1
                    ? " (yesterday)"
                    : consistency.daysSinceLastLog != null &&
                        consistency.daysSinceLastLog > 1
                      ? ` (${consistency.daysSinceLastLog} days ago)`
                      : ""}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <section>
        <h4 className="mb-3 text-sm font-medium text-foreground">
          This week at a glance
        </h4>
        <p className="mb-4 text-xs text-muted-foreground">
          Green circles mean you logged that day. Today is highlighted.
        </p>
        <div className="flex justify-between gap-1 sm:gap-2">
          {consistency.currentWeekDays.map((day) => (
            <WeekDayCell key={day.date} day={day} />
          ))}
        </div>
      </section>

      {hasAnyLogs ? (
        <section>
          <h4 className="mb-4 text-sm font-medium text-foreground">
            How often you logged
          </h4>
          <div className="flex flex-col gap-3">
            {consistency.recentWeeks.map((week) => (
              <WeekBarRow
                key={week.label}
                label={week.label}
                loggedDays={week.loggedDays}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Icon name="lightbulb" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {consistency.tip}
        </p>
      </div>
    </div>
  );
}
