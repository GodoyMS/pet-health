import type { WellnessDayPoint } from "../../api/analyticsApi";

export function WellnessWeekChart({ data }: { data: WellnessDayPoint[] }) {
  const maxVal = 100;
  const barMaxPx = 128;
  const hasData = data.some((d) => d.energy > 0 || d.mood > 0);

  if (!hasData) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No wellness scores this week. Log appetite, energy, and mood in health logs.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <span className="size-2.5 rounded-sm bg-primary" aria-hidden />
          Energy
        </span>
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2.5 rounded-sm bg-emerald-500/85 dark:bg-emerald-400/80"
            aria-hidden
          />
          Mood
        </span>
      </div>
      <div className="flex items-end justify-between gap-1 sm:gap-2" role="list">
        {data.map((day) => (
          <div
            key={day.date}
            className="flex flex-1 flex-col items-center gap-2"
            role="listitem"
          >
            <div
              className="flex h-36 w-full max-w-14 items-end justify-center gap-1 sm:h-40"
              aria-label={`${day.short}: energy ${day.energy}, mood ${day.mood}`}
            >
              <div
                className="w-[42%] max-w-[14px] rounded-t-md bg-primary transition-all"
                style={{
                  height: `${(day.energy / maxVal) * barMaxPx}px`,
                  minHeight: day.energy > 0 ? "4px" : "0"
                }}
              />
              <div
                className="w-[42%] max-w-[14px] rounded-t-md bg-emerald-500/85 dark:bg-emerald-400/80 transition-all"
                style={{
                  height: `${(day.mood / maxVal) * barMaxPx}px`,
                  minHeight: day.mood > 0 ? "4px" : "0"
                }}
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              {day.short}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
