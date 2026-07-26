import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

import { adminApi, type AdminUserListItem } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { DataTable, type Column } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components/PageHeader";
import { Pagination } from "@shared/components/Pagination";
import { PageError } from "@shared/components/States";
import { formatDate } from "@shared/utils/format";

const LIMIT = 20;

export function UsersListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | "user" | "admin">("all");

  const query = useQuery({
    queryKey: ["admin", "users", { page, search, role }],
    queryFn: () =>
      adminApi.listUsers({
        page,
        limit: LIMIT,
        search: search || undefined,
        role: role === "all" ? undefined : role
      }),
    placeholderData: keepPreviousData
  });

  const columns: Column<AdminUserListItem>[] = [
    {
      key: "name",
      header: "User",
      render: (u) => (
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      )
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge>
      )
    },
    {
      key: "provider",
      header: "Sign-in",
      render: (u) => (
        <span className="text-muted-foreground">
          {u.provider === "google" ? "Google" : "Email"}
        </span>
      )
    },
    {
      key: "pets",
      header: "Pets",
      className: "text-right",
      render: (u) => <span className="tabular-nums">{u.petCount}</span>
    },
    {
      key: "created",
      header: "Joined",
      render: (u) => (
        <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>
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
        title="Users"
        description="Every registered account. Open a user to inspect their pets or manage the account."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v as typeof role);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(u) => u.id}
        isLoading={query.isLoading}
        emptyMessage="No users match this filter"
        onRowClick={(u) => navigate(`/users/${u.id}`)}
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
