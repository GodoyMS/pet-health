import { Link } from "react-router-dom";

import { Alert, Button, Icon, Skeleton } from "@repo/ui";

import CreateNewPet from "@modules/pets/components/CreateNewPet";
import { useGetUser } from "@shared/hooks/useGetUser";
import { DashboardAlerts } from "../components/DashboardAlerts";
import { DashboardStatCard } from "../components/DashboardStatCard";
import { PetHealthCard } from "../components/PetHealthCard";
import { RecentActivityFeed } from "../components/RecentActivityFeed";
import { useDashboard } from "../hooks/useDashboard";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export const DashboardHomePage = () => {
  const { data: user } = useGetUser();
  const { data, isLoading, isError } = useDashboard();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (isLoading) {
    return (
      <section className="flex flex-1 flex-col gap-6">
        <header>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </header>
        <DashboardSkeleton />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error">
        Could not load dashboard. Please refresh the page.
      </Alert>
    );
  }

  const { summary, pets, alerts, recentActivity } = data;
  const isEmpty = summary.petCount === 0;

  return (
    <section className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {greeting}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isEmpty
              ? "Add your first pet to start tracking health and preventive care."
              : `Overview of ${summary.petCount} companion${summary.petCount !== 1 ? "s" : ""} — health logs, care schedules, and insights in one place.`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <CreateNewPet
            trigger={
              <Button>
                <Icon name="add" className="mr-1.5 size-4" aria-hidden />
                Add pet
              </Button>
            }
          />
          {!isEmpty ? (
            <Button variant="outline" asChild>
              <Link to="/dashboard/pets">
                <Icon name="pets" className="mr-1.5 size-4" aria-hidden />
                All pets
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon name="pets" className="size-8" aria-hidden />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
            Welcome to Pet Health
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Register a companion to unlock preventive care schedules, health logging,
            lifestyle guidance, and AI wellness reports.
          </p>
          <CreateNewPet
            trigger={
              <Button className="mt-6" size="lg">
                Create your first pet
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <DashboardStatCard
              label="Companions"
              value={String(summary.petCount)}
              hint="Registered pets"
              icon="pets"
              accent="primary"
            />
            <DashboardStatCard
              label="Health logs"
              value={String(summary.totalHealthLogs)}
              hint={`${summary.logsThisWeek} this week`}
              icon="assignment"
            />
            <DashboardStatCard
              label="Best streak"
              value={`${summary.bestLoggingStreakDays}d`}
              hint="Longest active logging streak"
              icon="local_fire_department"
              accent="success"
            />
            <DashboardStatCard
              label="Awareness"
              value={
                summary.averageAwarenessScore != null
                  ? String(summary.averageAwarenessScore)
                  : "—"
              }
              hint="Average AI wellness score"
              icon="auto_awesome"
              accent="primary"
            />
          </div>

          {(summary.overduePreventiveItems > 0 ||
            summary.upcomingPreventiveItems > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {summary.overduePreventiveItems > 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3">
                  <Icon name="warning" className="size-5 text-destructive" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {summary.overduePreventiveItems} overdue item
                      {summary.overduePreventiveItems !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Review preventive care schedules
                    </p>
                  </div>
                </div>
              ) : null}
              {summary.upcomingPreventiveItems > 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <Icon name="event" className="size-5 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {summary.upcomingPreventiveItems} due within 30 days
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Plan ahead for vaccinations and checkups
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Your companions
                </h2>
                <Link
                  to="/dashboard/pets"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {pets.map((pet) => (
                  <PetHealthCard key={pet.id} pet={pet} />
                ))}
              </div>
            </section>

            <aside className="flex flex-col gap-6">
              <section className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
                  Alerts
                </h2>
                <DashboardAlerts alerts={alerts} />
              </section>

              <section className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                <h2 className="mb-2 font-display text-lg font-semibold tracking-tight">
                  Recent activity
                </h2>
                <RecentActivityFeed activities={recentActivity} />
              </section>
            </aside>
          </div>

          <section className="rounded-xl border border-primary/20 bg-linear-to-br from-primary/5 via-card to-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon name="auto_awesome" aria-hidden />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    AI wellness insights
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    Generate unified health narratives across logs, preventive care, and
                    lifestyle data for any pet.
                  </p>
                </div>
              </div>
              {pets[0] ? (
                <Button asChild>
                  <Link to={`/dashboard/pets/${pets[0].id}/ai-summary`}>
                    Open AI summary
                  </Link>
                </Button>
              ) : null}
            </div>
          </section>
        </>
      )}
    </section>
  );
};
