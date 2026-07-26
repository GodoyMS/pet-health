import React, { useState } from "react";

import { Link, useOutletContext, useParams } from "react-router-dom";



import {

  Alert,

  Badge,

  Button,

  DateRangePicker,

  Icon,

  Skeleton,

  type DateRangeValue

} from "@repo/ui";



import { AddHealthLogDialog } from "../components/HealthLogs/AddHealthLogDialog";

import { HealthLogKpiCard } from "../components/HealthLogs/HealthLogKpiCard";

import { PetSectionHeader } from "../components/PetSectionHeader";

import type { HealthLogDraft } from "../components/HealthLogs/types";

import { useCreateHealthLog } from "../hooks/useCreateHealthLog";

import { usePetHealthLogs } from "../hooks/usePetHealthLogs";

import type { PetOutletContext } from "./PetDetailLayout";



const PAGE_SIZE = 10;



function formatDisplayDate(isoDate: string): string {

  const [y, m, d] = isoDate.split("-").map(Number);

  if (!y || !m || !d) return isoDate;

  return new Date(y, m - 1, d).toLocaleDateString(undefined, {

    weekday: "short",

    year: "numeric",

    month: "short",

    day: "numeric"

  });

}



function RatingRow({

  label,

  value

}: {

  label: string;

  value: number;

}) {

  return (

    <div className="flex items-center justify-between gap-2 text-xs">

      <span className="text-muted-foreground">{label}</span>

      <span className="tabular-nums font-medium text-foreground">{value}/5</span>

    </div>

  );

}



export function PetHealthLogsPage() {

  const { petId } = useParams<{ petId: string }>();

  const { pet } = useOutletContext<PetOutletContext>();

  const id = petId ?? pet.id;



  const [page, setPage] = useState(1);

  const [dateRange, setDateRange] = useState<DateRangeValue>({});



  const { data, isLoading, isError, isFetching } = usePetHealthLogs(id, {

    page,

    limit: PAGE_SIZE,

    startDate: dateRange.startDate,

    endDate: dateRange.endDate

  });



  const createLog = useCreateHealthLog(id);



  const handleDateRangeChange = (next: DateRangeValue) => {

    setDateRange(next);

    setPage(1);

  };



  const handleAdd = async (draft: HealthLogDraft) => {

    await createLog.mutateAsync(draft);

    setPage(1);

  };



  const logs = data?.items ?? [];

  const total = data?.total ?? 0;

  const totalPages = data?.totalPages ?? 0;

  const kpis = data?.kpis;

  const hasFilter = Boolean(dateRange.startDate || dateRange.endDate);



  return (

    <div className="flex w-full flex-col gap-8">

      <PetSectionHeader
        title="Health logs"
        description={
          <>
            Track weight, appetite, energy, and mood over time. KPIs reflect averages across
            {hasFilter ? " the selected date range" : " all entries"}.
          </>
        }
        actions={
          <AddHealthLogDialog
            onAdd={handleAdd}
            isSubmitting={createLog.isPending}
            trigger={
              <Button className="shrink-0">
                <Icon name="add" className="mr-1.5 size-4" aria-hidden />
                New log
              </Button>
            }
          />
        }
      />



      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <DateRangePicker

          value={dateRange}

          onChange={handleDateRangeChange}

          className="w-full sm:w-auto sm:min-w-[260px]"

        />

        {hasFilter ? (

          <p className="text-xs text-muted-foreground">

            Showing entries from{" "}

            <span className="font-medium text-foreground">

              {dateRange.startDate}

              {dateRange.endDate && dateRange.endDate !== dateRange.startDate

                ? ` to ${dateRange.endDate}`

                : ""}

            </span>

          </p>

        ) : (

          <p className="text-xs text-muted-foreground">All dates · newest first</p>

        )}

      </section>



      <section className="grid gap-4 sm:grid-cols-3">

        <HealthLogKpiCard

          label="Appetite"

          icon="restaurant"

          value={kpis?.appetite ?? null}

          isLoading={isLoading}

        />

        <HealthLogKpiCard

          label="Energy"

          icon="bolt"

          value={kpis?.energy ?? null}

          isLoading={isLoading}

        />

        <HealthLogKpiCard

          label="Mood"

          icon="sentiment_satisfied"

          value={kpis?.mood ?? null}

          isLoading={isLoading}

        />

      </section>



      {!isLoading && kpis && kpis.logCount > 0 ? (

        <p className="-mt-4 text-center text-xs text-muted-foreground sm:text-left">

          Averages based on {kpis.logCount} {kpis.logCount === 1 ? "entry" : "entries"}

          {hasFilter ? " in range" : ""}.

        </p>

      ) : null}



      {isError ? (

        <Alert variant="destructive">

          Could not load health logs. Please refresh and try again.

        </Alert>

      ) : null}



      <section className="rounded-xl border border-border/50 bg-card shadow-sm">

        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 sm:px-5">

          <h2 className="text-sm font-semibold text-foreground">Log history</h2>

          <Badge variant="secondary" className="tabular-nums">

            {isLoading ? "…" : `${total} ${total === 1 ? "entry" : "entries"}`}

          </Badge>

        </div>



        {isLoading ? (

          <ul className="divide-y divide-border/50">

            {Array.from({ length: 3 }).map((_, i) => (

              <li key={i} className="px-4 py-4 sm:px-5">

                <Skeleton className="h-20 w-full rounded-lg" />

              </li>

            ))}

          </ul>

        ) : logs.length === 0 ? (

          <div className="px-5 py-12 text-center text-sm text-muted-foreground">

            {hasFilter ? (

              <>

                No logs in this date range.{" "}

                <button

                  type="button"

                  className="font-medium text-primary hover:underline"

                  onClick={() => handleDateRangeChange({})}

                >

                  Clear filter

                </button>

              </>

            ) : (

              <>

                No logs yet. Use <span className="font-medium text-foreground">New log</span> to

                add one.

              </>

            )}

          </div>

        ) : (

          <ul className="divide-y divide-border/50">

            {logs.map((log) => (

              <li key={log.id} className="px-4 py-4 sm:px-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0 space-y-2">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-medium text-foreground">{formatDisplayDate(log.date)}</p>

                      <Badge variant="outline" className="tabular-nums">

                        <Icon name="monitor_weight" className="mr-1 size-3.5" aria-hidden />

                        {log.weightKg.toFixed(1)} kg

                      </Badge>

                    </div>

                    <div className="grid max-w-xs grid-cols-1 gap-1 rounded-lg bg-muted/40 px-3 py-2">

                      <RatingRow label="Appetite" value={log.appetite} />

                      <RatingRow label="Energy" value={log.energy} />

                      <RatingRow label="Mood" value={log.mood} />

                    </div>

                  </div>

                  <div className="min-w-0 flex-1 sm:max-w-md sm:text-right">

                    {log.notes ? (

                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-right">

                        {log.notes}

                      </p>

                    ) : (

                      <p className="text-sm italic text-muted-foreground">No notes</p>

                    )}

                  </div>

                </div>

              </li>

            ))}

          </ul>

        )}



        {totalPages > 1 ? (

          <div className="flex flex-col gap-3 border-t border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">

            <p className="text-xs text-muted-foreground tabular-nums">

              Page {page} of {totalPages}

              {isFetching && !isLoading ? (

                <span className="ml-2 text-primary">Updating…</span>

              ) : null}

            </p>

            <div className="flex items-center gap-2">

              <Button

                type="button"

                variant="outline"

                size="sm"

                disabled={page <= 1 || isFetching}

                onClick={() => setPage((p) => Math.max(1, p - 1))}

              >

                <Icon name="chevron_left" className="size-4" aria-hidden />

                Previous

              </Button>

              <Button

                type="button"

                variant="outline"

                size="sm"

                disabled={page >= totalPages || isFetching}

                onClick={() => setPage((p) => p + 1)}

              >

                Next

                <Icon name="chevron_right" className="ml-1 size-4" aria-hidden />

              </Button>

            </div>

          </div>

        ) : null}

      </section>



      <div className="flex flex-wrap items-center gap-3">

        <Button variant="outline" asChild>

          <Link to={`/dashboard/pets/${id}`}>Back to overview</Link>

        </Button>

      </div>

    </div>

  );

}

