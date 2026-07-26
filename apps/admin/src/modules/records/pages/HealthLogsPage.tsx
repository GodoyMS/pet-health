import { useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Input } from "@repo/ui";

import { adminApi, type AdminHealthLog } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { DataTable, type Column } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components/PageHeader";
import { Pagination } from "@shared/components/Pagination";
import { PageError } from "@shared/components/States";
import { formatDate } from "@shared/utils/format";

const LIMIT = 25;

const columns: Column<AdminHealthLog>[] = [
  {
    key: "date",
    header: "Date",
    render: (l) => formatDate(l.logDate)
  },
  {
    key: "pet",
    header: "Pet",
    render: (l) =>
      l.pet ? (
        <Link to={`/pets/${l.pet.id}`} className="hover:underline">
          <span className="font-medium">{l.pet.name}</span>
          <span className="block text-xs text-muted-foreground">
            {l.pet.ownerEmail ?? ""}
          </span>
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
  },
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
      <span className="line-clamp-1 max-w-72 text-muted-foreground">
        {l.notes ?? "—"}
      </span>
    )
  }
];

export function HealthLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["admin", "health-logs", { page, search }],
    queryFn: () =>
      adminApi.listHealthLogs({
        page,
        limit: LIMIT,
        search: search || undefined
      }),
    placeholderData: keepPreviousData
  });

  if (query.isError) {
    return (
      <PageError
        message={apiErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Health logs"
        description="Daily check-ins recorded by owners, newest first."
      />

      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search pet or owner email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(l) => l.id}
        isLoading={query.isLoading}
        emptyMessage="No health logs found"
      />

      {query.data ? (
        <Pagination
          page={page}
          limit={LIMIT}
          total={query.data.total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
