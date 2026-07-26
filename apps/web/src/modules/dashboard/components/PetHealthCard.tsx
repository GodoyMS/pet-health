import { Link } from "react-router-dom";

import { Badge, Icon } from "@repo/ui";

import type { DashboardPetCard } from "../api/dashboardApi";
import { formatDueDate } from "@modules/pets/utils/formatDueDate";
import { getAwarenessScoreLabel } from "@modules/pets/utils/awarenessScore";

function PreventiveProgress({
  completed,
  total
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Preventive care</span>
        <span className="tabular-nums">
          {completed}/{total} ({pct}%)
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PetHealthCard({ pet }: { pet: DashboardPetCard }) {
  const basePath = `/dashboard/pets/${pet.id}`;
  const hasOverdue = pet.preventiveCare.overdue > 0;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition hover:border-primary/20 hover:shadow-md">
      <Link to={basePath} className="block p-5">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent">
            {pet.speciesImageUrl ? (
              <img
                src={pet.speciesImageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <Icon name="pets" className="text-accent-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {pet.name}
              </h3>
              {hasOverdue ? (
                <Badge variant="destructive" className="text-[10px]">
                  {pet.preventiveCare.overdue} overdue
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {pet.speciesName}
              {pet.breedName ? ` · ${pet.breedName}` : ""}
            </p>
          </div>
          {pet.awarenessScore != null ? (
            <div className="shrink-0 text-right">
              <p className="font-display text-xl font-semibold tabular-nums text-primary">
                {pet.awarenessScore}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {getAwarenessScoreLabel(pet.awarenessScore)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <p className="text-muted-foreground">Logging streak</p>
            <p className="mt-0.5 font-semibold tabular-nums text-foreground">
              {pet.loggingStreakDays} day{pet.loggingStreakDays !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <p className="text-muted-foreground">Last check-in</p>
            <p className="mt-0.5 font-semibold text-foreground">
              {pet.lastHealthLogDate ?? "Never"}
            </p>
          </div>
        </div>

        <PreventiveProgress
          completed={pet.preventiveCare.completed}
          total={pet.preventiveCare.total}
        />

        {pet.nextDueDate && pet.nextDueTitle ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="event" className="size-3.5 shrink-0" aria-hidden />
            <span>
              Next: <span className="font-medium text-foreground">{pet.nextDueTitle}</span>{" "}
              · {formatDueDate(pet.nextDueDate)}
            </span>
          </p>
        ) : null}
      </Link>

      <div className="flex border-t border-border/40 text-xs">
        <Link
          to={`${basePath}/health-logs`}
          className="flex flex-1 items-center justify-center gap-1 py-2.5 text-muted-foreground transition hover:bg-muted/30 hover:text-primary"
        >
          <Icon name="assignment" className="size-3.5" aria-hidden />
          Logs
        </Link>
        <Link
          to={`${basePath}/preventive-care`}
          className="flex flex-1 items-center justify-center gap-1 border-l border-border/40 py-2.5 text-muted-foreground transition hover:bg-muted/30 hover:text-primary"
        >
          <Icon name="vaccines" className="size-3.5" aria-hidden />
          Care
        </Link>
        <Link
          to={`${basePath}/analytics`}
          className="flex flex-1 items-center justify-center gap-1 border-l border-border/40 py-2.5 text-muted-foreground transition hover:bg-muted/30 hover:text-primary"
        >
          <Icon name="monitoring" className="size-3.5" aria-hidden />
          Analytics
        </Link>
      </div>
    </article>
  );
}
