import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import {
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@repo/ui";

import { adminApi, type AdminPetListItem } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { DataTable, type Column } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components/PageHeader";
import { Pagination } from "@shared/components/Pagination";
import { PageError } from "@shared/components/States";
import { formatDate } from "@shared/utils/format";

const LIMIT = 20;

export function PetsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [speciesId, setSpeciesId] = useState<string>("all");

  const speciesQuery = useQuery({
    queryKey: ["admin", "species"],
    queryFn: adminApi.listSpecies,
    staleTime: 5 * 60 * 1000
  });

  const query = useQuery({
    queryKey: ["admin", "pets", { page, search, speciesId }],
    queryFn: () =>
      adminApi.listPets({
        page,
        limit: LIMIT,
        search: search || undefined,
        speciesId: speciesId === "all" ? undefined : speciesId
      }),
    placeholderData: keepPreviousData
  });

  const columns: Column<AdminPetListItem>[] = [
    {
      key: "name",
      header: "Pet",
      render: (p) => (
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground">
            {[p.speciesName, p.breedName].filter(Boolean).join(" · ")}
          </p>
        </div>
      )
    },
    {
      key: "owner",
      header: "Owner",
      render: (p) =>
        p.owner ? (
          <Link
            to={`/users/${p.owner.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm hover:underline"
          >
            <span>{p.owner.name}</span>
            <span className="block text-xs text-muted-foreground">
              {p.owner.email}
            </span>
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
    },
    {
      key: "birth",
      header: "Born",
      render: (p) => (
        <span className="text-muted-foreground">{formatDate(p.birthDate)}</span>
      )
    },
    {
      key: "weight",
      header: "Weight",
      className: "text-right",
      render: (p) => (
        <span className="tabular-nums">
          {p.weightKg != null ? `${p.weightKg} kg` : "—"}
        </span>
      )
    },
    {
      key: "score",
      header: "Awareness",
      className: "text-right",
      render: (p) =>
        p.awarenessScore != null ? (
          <Badge variant="secondary">{p.awarenessScore}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
    }
  ];

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
        title="Pets"
        description="Every pet profile on the platform, across all owners."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search pet, owner name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={speciesId}
          onValueChange={(v) => {
            setSpeciesId(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            {speciesQuery.data?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(p) => p.id}
        isLoading={query.isLoading}
        emptyMessage="No pets match this filter"
        onRowClick={(p) => navigate(`/pets/${p.id}`)}
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
