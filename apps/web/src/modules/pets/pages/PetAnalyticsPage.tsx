import { Link, useOutletContext, useParams } from "react-router-dom";

import { Alert, Button, Icon, Skeleton } from "@repo/ui";

import { ChartCard } from "../components/Analytics/ChartCard";
import { LoggingConsistencyPanel } from "../components/Analytics/LoggingConsistencyPanel";
import { WeightTrendChart } from "../components/Analytics/WeightTrendChart";
import { WellnessWeekChart } from "../components/Analytics/WellnessWeekChart";
import { PetSectionHeader } from "../components/PetSectionHeader";
import { usePetAnalytics } from "../hooks/usePetAnalytics";
import type { PetOutletContext } from "./PetDetailLayout";

function KpiStrip({
  appetite,
  energy,
  mood,
  logCount
}: {
  appetite: number | null;
  energy: number | null;
  mood: number | null;
  logCount: number;
}) {
  const items = [
    { label: "Appetite", value: appetite },
    { label: "Energy", value: energy },
    { label: "Mood", value: mood }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
            {item.value != null ? `${item.value}/5` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">30-day avg</p>
        </div>
      ))}
      <div className="rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Logs
        </p>
        <p className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
          {logCount}
        </p>
        <p className="text-[10px] text-muted-foreground">Last 30 days</p>
      </div>
    </div>
  );
}

export function PetAnalyticsPage() {
  const { petId } = useParams<{ petId: string }>();
  const { pet } = useOutletContext<PetOutletContext>();
  const id = petId ?? pet.id;
  const { data, isLoading, isError } = usePetAnalytics(id);

  return (
    <div className="flex w-full flex-col gap-8">
      <PetSectionHeader
        title="Analytics"
        description={
          <>
            Real-time trends for{" "}
            <span className="font-medium text-foreground">{pet.name}</span> — derived
            from your health log entries.
          </>
        }
        actions={
          data && data.kpis.logCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Icon name="check_circle" className="size-3.5" aria-hidden />
              Live data
            </span>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/dashboard/pets/${id}/health-logs`}>
                <Icon name="add" className="mr-1 size-4" aria-hidden />
                Add log
              </Link>
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : isError || !data ? (
        <Alert variant="error">Could not load analytics. Please try again.</Alert>
      ) : (
        <>
          <KpiStrip {...data.kpis} />

          <div className="flex flex-col gap-6">
            <ChartCard
              title="Weight trend"
              description="Monthly average weight from health log entries (kilograms)."
              footer={
                <p className="text-xs text-muted-foreground">
                  Tip: consistent weigh-ins make it easier to spot gradual changes.
                </p>
              }
            >
              <WeightTrendChart data={data.weightTrend} />
            </ChartCard>

            <ChartCard
              title="Energy & mood"
              description="Last 7 calendar days — scaled from daily check-in ratings (1–5). Days without logs show 0."
            >
              <WellnessWeekChart data={data.wellnessWeek} />
            </ChartCard>

            <ChartCard
              title="Check-in habit"
              description="See how often you log your pet's health — regular notes help spot changes early."
              footer={
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/pets/${id}/health-logs`}>
                    <Icon name="assignment" className="mr-1.5 size-4" aria-hidden />
                    Add a health log
                  </Link>
                </Button>
              }
            >
              <LoggingConsistencyPanel consistency={data.loggingConsistency} />
            </ChartCard>
          </div>
        </>
      )}

      <div className="flex justify-start">
        <Button variant="outline" asChild>
          <Link to={`/dashboard/pets/${id}`}>Back to overview</Link>
        </Button>
      </div>
    </div>
  );
}
