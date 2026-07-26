import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";

import { Badge, Button, toast } from "@repo/ui";

import { adminApi } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import { DataTable, type Column } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components/PageHeader";
import { PageError, PageLoading } from "@shared/components/States";
import { formatDate, formatDateTime } from "@shared/utils/format";

interface HealthLogRow {
  id: string;
  logDate: string;
  weightKg: number;
  appetite: number;
  energy: number;
  mood: number;
  notes: string | null;
}

const logColumns: Column<HealthLogRow>[] = [
  { key: "date", header: "Date", render: (l) => formatDate(l.logDate) },
  {
    key: "weight",
    header: "Weight",
    className: "text-right",
    render: (l) => <span className="tabular-nums">{l.weightKg} kg</span>
  },
  {
    key: "scores",
    header: "Appetite / Energy / Mood",
    render: (l) => (
      <span className="tabular-nums text-muted-foreground">
        {l.appetite} / {l.energy} / {l.mood}
      </span>
    )
  },
  {
    key: "notes",
    header: "Notes",
    render: (l) => (
      <span className="line-clamp-1 max-w-64 text-muted-foreground">
        {l.notes ?? "—"}
      </span>
    )
  }
];

export function PetDetailPage() {
  const { petId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = useQuery({
    queryKey: ["admin", "pets", petId],
    queryFn: () => adminApi.getPet(petId),
    enabled: !!petId
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deletePet(petId),
    onSuccess: () => {
      toast.success("Pet deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "pets"] });
      navigate("/pets", { replace: true });
    },
    onError: (err) => toast.error(apiErrorMessage(err))
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

  const pet = query.data;
  const overdueCare = pet.careItems.filter(
    (item) =>
      !item.completedAt && item.dueDate < new Date().toISOString().slice(0, 10)
  ).length;

  return (
    <div className="space-y-6">
      <Link
        to="/pets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to pets
      </Link>

      <PageHeader
        title={pet.name}
        description={
          [pet.speciesName, pet.breedName].filter(Boolean).join(" · ") ||
          "Unknown species"
        }
        actions={
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" /> Delete pet
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Owner
          </p>
          {pet.owner ? (
            <Link
              to={`/users/${pet.owner.id}`}
              className="mt-2 block text-sm hover:underline"
            >
              {pet.owner.name}
              <span className="block text-xs text-muted-foreground">
                {pet.owner.email}
              </span>
            </Link>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">—</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Profile
          </p>
          <p className="mt-2 text-sm">
            Born {formatDate(pet.birthDate)}
            {pet.weightKg != null ? ` · ${pet.weightKg} kg` : ""}
          </p>
          {pet.expectedLifeSpanYears != null ? (
            <p className="text-xs text-muted-foreground">
              Expected lifespan {pet.expectedLifeSpanYears} years
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Awareness score
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {pet.awarenessScore ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {pet.aiReportCount} AI report(s)
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Activity
          </p>
          <p className="mt-2 text-sm">{pet.healthLogCount} health logs</p>
          <p className="text-xs text-muted-foreground">
            {overdueCare > 0 ? (
              <span className="text-warning">{overdueCare} care item(s) overdue</span>
            ) : (
              "No overdue care items"
            )}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          Recent health logs ({pet.healthLogCount} total)
        </h3>
        <DataTable
          columns={logColumns}
          rows={pet.recentHealthLogs}
          rowKey={(l) => l.id}
          emptyMessage="No health logs recorded"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            Preventive care items ({pet.careItems.length})
          </h3>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {pet.careItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No care items scheduled.
              </p>
            ) : (
              pet.careItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(item.dueDate)}
                    </p>
                  </div>
                  {item.completedAt ? (
                    <Badge variant="success">done</Badge>
                  ) : item.dueDate < new Date().toISOString().slice(0, 10) ? (
                    <Badge variant="warning">overdue</Badge>
                  ) : (
                    <Badge variant="outline">pending</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Recent AI reports</h3>
          <div className="space-y-2">
            {pet.recentAiReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No AI reports generated.
              </p>
            ) : (
              pet.recentAiReports.map((report) => (
                <Link
                  key={report.id}
                  to={`/ai-reports/${report.id}`}
                  className="block rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="line-clamp-1">{report.headline}</p>
                    <Badge variant="secondary">{report.awarenessScore}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(report.generatedAt)}
                    {report.model ? ` · ${report.model}` : ""}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${pet.name}?`}
        description={
          <>
            This permanently removes this pet, {pet.healthLogCount} health
            log(s), {pet.careItems.length} care item(s) and{" "}
            {pet.aiReportCount} AI report(s). The owner account is not affected.
          </>
        }
        confirmLabel="Delete pet"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
