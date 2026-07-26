import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast
} from "@repo/ui";

import { adminApi, type LifestyleRule } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import { DataTable, type Column } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components/PageHeader";
import { Pagination } from "@shared/components/Pagination";
import { PageError } from "@shared/components/States";

import {
  AgeRangeFields,
  parseOptionalInt,
  SpeciesBreedFields
} from "../components/RuleFormFields";

const LIMIT = 20;

const RULE_TYPES = [
  { value: "exercise", label: "Exercise" },
  { value: "feeding_awareness", label: "Feeding awareness" },
  { value: "food_safety", label: "Food safety" }
] as const;

const typeLabel = (value: string) =>
  RULE_TYPES.find((t) => t.value === value)?.label ?? value;

interface FormState {
  title: string;
  description: string;
  type: string;
  speciesId: string;
  breedId: string;
  minAge: string;
  maxAge: string;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  type: "exercise",
  speciesId: "",
  breedId: "",
  minAge: "",
  maxAge: ""
};

export function LifestyleRulesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LifestyleRule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleting, setDeleting] = useState<LifestyleRule | null>(null);

  const speciesQuery = useQuery({
    queryKey: ["admin", "species"],
    queryFn: adminApi.listSpecies,
    staleTime: 5 * 60 * 1000
  });

  const query = useQuery({
    queryKey: ["admin", "lifestyle-rules", { page, search, speciesFilter }],
    queryFn: () =>
      adminApi.listLifestyleRules({
        page,
        limit: LIMIT,
        search: search || undefined,
        speciesId: speciesFilter === "all" ? undefined : speciesFilter
      }),
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    if (!dialogOpen) {
      setEditing(null);
      setForm(emptyForm);
    }
  }, [dialogOpen]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "lifestyle-rules"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        applicableMinAgeDays: parseOptionalInt(form.minAge),
        applicableMaxAgeDays: parseOptionalInt(form.maxAge)
      };
      if (editing) {
        return adminApi.updateLifestyleRule(editing.id, payload);
      }
      return adminApi.createLifestyleRule({
        ...payload,
        speciesId: form.speciesId,
        breedId: form.breedId
      });
    },
    onSuccess: () => {
      toast.success(editing ? "Rule updated" : "Rule created");
      setDialogOpen(false);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err))
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteLifestyleRule(id),
    onSuccess: () => {
      toast.success("Rule deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err))
  });

  const canSubmit =
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    (editing !== null || (form.speciesId && form.breedId));

  const columns: Column<LifestyleRule>[] = [
    {
      key: "title",
      header: "Rule",
      render: (r) => (
        <div className="max-w-md">
          <p className="font-medium">{r.title}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {r.description}
          </p>
        </div>
      )
    },
    {
      key: "scope",
      header: "Applies to",
      render: (r) => (
        <span className="text-muted-foreground">
          {[r.speciesName, r.breedName].filter(Boolean).join(" · ")}
        </span>
      )
    },
    {
      key: "type",
      header: "Type",
      render: (r) => <Badge variant="outline">{typeLabel(r.type)}</Badge>
    },
    {
      key: "ages",
      header: "Age window (days)",
      render: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {r.applicableMinAgeDays ?? 0} – {r.applicableMaxAgeDays ?? "∞"}
        </span>
      )
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Edit rule"
            onClick={() => {
              setEditing(r);
              setForm({
                title: r.title,
                description: r.description,
                type: r.type,
                speciesId: r.speciesId ?? "",
                breedId: r.breedId ?? "",
                minAge: r.applicableMinAgeDays?.toString() ?? "",
                maxAge: r.applicableMaxAgeDays?.toString() ?? ""
              });
              setDialogOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete rule"
            onClick={() => setDeleting(r)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
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
        title="Lifestyle rules"
        description="Guidance shown to owners: exercise, feeding awareness and food safety per breed."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> New rule
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search rule title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={speciesFilter}
          onValueChange={(v) => {
            setSpeciesFilter(v);
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
        rowKey={(r) => r.id}
        isLoading={query.isLoading}
        emptyMessage="No rules match this filter"
      />

      {query.data ? (
        <Pagination
          page={page}
          limit={LIMIT}
          total={query.data.total}
          onPageChange={setPage}
        />
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit lifestyle rule" : "New lifestyle rule"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lifestyleTitle">Title</Label>
              <Input
                id="lifestyleTitle"
                placeholder="e.g. Daily walk requirement"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifestyleDescription">Description</Label>
              <Textarea
                id="lifestyleDescription"
                rows={4}
                placeholder="Owner-facing guidance text…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SpeciesBreedFields
              species={speciesQuery.data ?? []}
              speciesId={form.speciesId}
              breedId={form.breedId}
              onSpeciesChange={(id) => setForm((f) => ({ ...f, speciesId: id }))}
              onBreedChange={(id) => setForm((f) => ({ ...f, breedId: id }))}
              disabled={editing !== null}
            />
            {editing ? (
              <p className="text-xs text-muted-foreground">
                Species and breed cannot be changed on an existing rule — create a
                new rule instead.
              </p>
            ) : null}

            <AgeRangeFields
              minAge={form.minAge}
              maxAge={form.maxAge}
              onMinAgeChange={(v) => setForm((f) => ({ ...f, minAge: v }))}
              onMaxAgeChange={(v) => setForm((f) => ({ ...f, maxAge: v }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSubmit || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Create rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this rule?"
        description={
          <>
            <strong>{deleting?.title}</strong> will no longer be shown to owners.
          </>
        }
        confirmLabel="Delete rule"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </div>
  );
}
