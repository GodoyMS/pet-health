import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  CalendarClock,
  Dog,
  Gauge,
  HeartPulse,
  ListChecks,
  Users
} from "lucide-react";

import { adminApi } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { PageHeader } from "@shared/components/PageHeader";
import { PageError, PageLoading } from "@shared/components/States";
import { formatNumber } from "@shared/utils/format";

import { StatCard } from "../components/StatCard";
import { AreaChart, BarChart, DistributionBars } from "../components/charts";

function ChartCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function OverviewPage() {
  const query = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminApi.overview,
    refetchInterval: 60_000
  });

  if (query.isLoading) return <PageLoading />;
  if (query.isError || !query.data) {
    return (
      <PageError
        message={apiErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }

  const { totals, careItems, averages, timeseries, distributions } = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Live metrics across every account, refreshed each minute."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Users"
          value={formatNumber(totals.users)}
          hint={`${averages.petsPerUser} pets per user on average`}
          icon={Users}
        />
        <StatCard
          label="Pets"
          value={formatNumber(totals.pets)}
          hint={`${formatNumber(totals.species)} species · ${formatNumber(totals.breeds)} breeds`}
          icon={Dog}
        />
        <StatCard
          label="Health logs"
          value={formatNumber(totals.healthLogs)}
          hint="Daily check-ins recorded by owners"
          icon={HeartPulse}
        />
        <StatCard
          label="AI reports"
          value={formatNumber(totals.aiReports)}
          hint="Wellness reports generated"
          icon={Brain}
        />
        <StatCard
          label="Care items overdue"
          value={formatNumber(careItems.overdue)}
          hint={`${formatNumber(careItems.pending)} pending of ${formatNumber(careItems.total)} scheduled`}
          icon={CalendarClock}
        />
        <StatCard
          label="Care items completed"
          value={formatNumber(careItems.completed)}
          hint="Preventive care marked done"
          icon={ListChecks}
        />
        <StatCard
          label="Avg awareness score"
          value={
            averages.awarenessScore != null ? `${averages.awarenessScore}` : "—"
          }
          hint="Across pets with an AI report"
          icon={Gauge}
        />
        <StatCard
          label="Knowledge rules"
          value={formatNumber(
            totals.preventiveCareRules + totals.lifestyleRules
          )}
          hint={`${formatNumber(totals.preventiveCareRules)} preventive · ${formatNumber(totals.lifestyleRules)} lifestyle`}
          icon={ListChecks}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Signups" subtitle="New accounts, last 30 days">
          <AreaChart data={timeseries.signupsLast30Days} />
        </ChartCard>
        <ChartCard title="Health logs" subtitle="Check-ins per day, last 14 days">
          <BarChart data={timeseries.healthLogsLast14Days} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Pets by species">
          <DistributionBars data={distributions.petsBySpecies} />
        </ChartCard>
        <ChartCard title="Top breeds">
          <DistributionBars data={distributions.topBreeds} />
        </ChartCard>
        <ChartCard title="Users by sign-in method">
          <DistributionBars
            data={distributions.usersByProvider.map((s) => ({
              ...s,
              label: s.label === "google" ? "Google" : "Email & password"
            }))}
          />
        </ChartCard>
      </div>
    </div>
  );
}
