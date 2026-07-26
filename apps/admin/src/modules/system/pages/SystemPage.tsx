import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Cpu,
  Database,
  RefreshCw,
  Timer,
  XCircle
} from "lucide-react";

import { Badge, Button } from "@repo/ui";

import { adminApi, type AuditLogEntry } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { DataTable, type Column } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components/PageHeader";
import { Pagination } from "@shared/components/Pagination";
import { PageError, PageLoading } from "@shared/components/States";
import { formatDateTime, formatNumber, formatUptime } from "@shared/utils/format";

const AUDIT_LIMIT = 15;

const FLAG_LABELS: Record<string, string> = {
  googleAuth: "Google sign-in",
  googleCalendar: "Google Calendar sync",
  nearbyPlaces: "Nearby care map",
  aiReports: "AI wellness reports"
};

function actionBadgeVariant(action: string): "destructive" | "default" | "outline" {
  if (action.endsWith(".deleted")) return "destructive";
  if (action.endsWith(".created")) return "default";
  return "outline";
}

const auditColumns: Column<AuditLogEntry>[] = [
  {
    key: "when",
    header: "When",
    render: (e) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDateTime(e.createdAt)}
      </span>
    )
  },
  {
    key: "actor",
    header: "Admin",
    render: (e) => e.actorEmail
  },
  {
    key: "action",
    header: "Action",
    render: (e) => <Badge variant={actionBadgeVariant(e.action)}>{e.action}</Badge>
  },
  {
    key: "target",
    header: "Target",
    render: (e) => (
      <span className="text-muted-foreground">
        {e.targetType}
        {e.targetId ? (
          <span className="ml-1 font-mono text-xs">{e.targetId.slice(0, 8)}…</span>
        ) : null}
      </span>
    )
  },
  {
    key: "details",
    header: "Details",
    render: (e) => (
      <span className="line-clamp-1 max-w-80 font-mono text-xs text-muted-foreground">
        {e.details ? JSON.stringify(e.details) : "—"}
      </span>
    )
  }
];

export function SystemPage() {
  const [auditPage, setAuditPage] = useState(1);

  const statusQuery = useQuery({
    queryKey: ["admin", "system", "status"],
    queryFn: adminApi.systemStatus,
    refetchInterval: 30_000
  });

  const auditQuery = useQuery({
    queryKey: ["admin", "system", "audit", auditPage],
    queryFn: () => adminApi.listAuditLogs({ page: auditPage, limit: AUDIT_LIMIT }),
    placeholderData: keepPreviousData
  });

  if (statusQuery.isLoading) return <PageLoading />;
  if (statusQuery.isError || !statusQuery.data) {
    return (
      <PageError
        message={apiErrorMessage(statusQuery.error)}
        onRetry={() => statusQuery.refetch()}
      />
    );
  }

  const status = statusQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System & logs"
        description={`Runtime health of the API and the backoffice audit trail. Last check ${formatDateTime(status.checkedAt)}.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => statusQuery.refetch()}
            disabled={statusQuery.isFetching}
          >
            <RefreshCw
              className={`size-4 ${statusQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Database
            </p>
            <Database className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {status.database.ok ? (
              <>
                <CheckCircle2 className="size-5 text-success" />
                <span className="text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="size-5 text-destructive" />
                <span className="text-sm font-medium">Unreachable</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {status.database.ok
              ? `Ping ${status.database.latencyMs} ms`
              : status.database.error}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Uptime
            </p>
            <Timer className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {formatUptime(status.api.uptimeSeconds)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {status.api.environment} · Node {status.api.nodeVersion}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Memory
            </p>
            <Cpu className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {status.api.memory.rssMb} MB
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Heap {status.api.memory.heapUsedMb}/{status.api.memory.heapTotalMb} MB
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Integrations
          </p>
          <ul className="mt-2 space-y-1.5">
            {Object.entries(status.featureFlags).map(([key, enabled]) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                {enabled ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className={enabled ? "" : "text-muted-foreground"}>
                  {FLAG_LABELS[key] ?? key}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Table sizes</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(status.tableCounts).map(([table, count]) => (
            <div key={table} className="rounded-lg bg-background px-3 py-2">
              <p className="truncate font-mono text-xs text-muted-foreground">
                {table}
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {count != null ? formatNumber(count) : "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Admin audit trail</h3>
        <p className="text-xs text-muted-foreground">
          Every mutating action performed through this backoffice is recorded here.
        </p>
        {auditQuery.isError ? (
          <PageError
            message={apiErrorMessage(auditQuery.error)}
            onRetry={() => auditQuery.refetch()}
          />
        ) : (
          <>
            <DataTable
              columns={auditColumns}
              rows={auditQuery.data?.items}
              rowKey={(e) => e.id}
              isLoading={auditQuery.isLoading}
              emptyMessage="No admin actions recorded yet"
            />
            {auditQuery.data ? (
              <Pagination
                page={auditPage}
                limit={AUDIT_LIMIT}
                total={auditQuery.data.total}
                onPageChange={setAuditPage}
              />
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
