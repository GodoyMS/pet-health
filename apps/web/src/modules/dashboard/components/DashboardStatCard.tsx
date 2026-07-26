import { Icon } from "@repo/ui";

export function DashboardStatCard({
  label,
  value,
  hint,
  icon,
  accent
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  accent?: "default" | "warning" | "success" | "primary";
}) {
  const accentClasses = {
    default: "bg-muted/40 text-muted-foreground",
    warning: "bg-warning/15 text-warning",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    primary: "bg-primary/10 text-primary"
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm transition hover:border-border">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {icon ? (
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${accentClasses[accent ?? "default"]}`}
          >
            <Icon name={icon} className="size-[18px]" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
