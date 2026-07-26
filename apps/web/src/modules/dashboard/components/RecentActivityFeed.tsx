import { Link } from "react-router-dom";

import { Icon } from "@repo/ui";

import type { DashboardActivity } from "../api/dashboardApi";

const ACTIVITY_META = {
  health_log: { icon: "assignment", label: "Health log" },
  preventive_completed: { icon: "task_alt", label: "Preventive care" },
  ai_report: { icon: "auto_awesome", label: "AI report" }
} as const;

export function RecentActivityFeed({
  activities
}: {
  activities: DashboardActivity[];
}) {
  if (activities.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No recent activity yet. Log a health check-in to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {activities.map((activity, i) => {
        const meta = ACTIVITY_META[activity.type];
        return (
          <li
            key={`${activity.type}-${activity.petId}-${activity.date}-${i}`}
            className="flex gap-3 border-b border-border/40 py-3 last:border-0"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name={meta.icon} className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <Link
                  to={`/dashboard/pets/${activity.petId}`}
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  {activity.petName}
                </Link>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {activity.date}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {activity.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
