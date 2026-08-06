import { Link } from "react-router-dom";

import { Icon } from "@repo/ui";

import type { DashboardAlert } from "../api/dashboardApi";

const SEVERITY_STYLES = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-warning/30 bg-warning/5",
  low: "border-border/60 bg-muted/20"
} as const;

const ALERT_ICONS = {
  overdue_preventive: { icon: "warning" },
  missing_logs: { icon: "assignment_late" },
  upcoming_due: { icon: "event" }
} as const;

export function DashboardAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
        <Icon name="check_circle" className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">All caught up</p>
          <p className="text-xs text-muted-foreground">
            No urgent alerts for your pets right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {alerts.map((alert, i) => (
        <li key={`${alert.petId}-${alert.type}-${i}`}>
          <Link
            to={alert.actionPath}
            className={`flex items-start gap-3 rounded-xl border p-3.5 transition hover:shadow-sm ${SEVERITY_STYLES[alert.severity]}`}
          >
            <Icon
              name={ALERT_ICONS[alert.type].icon}
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {alert.petName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{alert.message}</p>
            </div>
            <Icon
              name="chevron_right"
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
