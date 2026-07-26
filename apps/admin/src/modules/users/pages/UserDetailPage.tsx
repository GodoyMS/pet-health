import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";

import { Badge, Button, toast } from "@repo/ui";

import { adminApi } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import { PageHeader } from "@shared/components/PageHeader";
import { PageError, PageLoading } from "@shared/components/States";
import { formatDate } from "@shared/utils/format";
import { useAdminAuth } from "@modules/auth/hooks/useAdminAuth";

export function UserDetailPage() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAdminAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => adminApi.getUser(userId),
    enabled: !!userId
  });

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const roleMutation = useMutation({
    mutationFn: (role: "user" | "admin") => adminApi.updateUser(userId, { role }),
    onSuccess: (updated) => {
      toast.success(`${updated.email} is now ${updated.role}`);
      invalidateUsers();
    },
    onError: (err) => toast.error(apiErrorMessage(err))
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success("User and all related data deleted");
      invalidateUsers();
      navigate("/users", { replace: true });
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

  const user = query.data;
  const isSelf = currentAdmin?.id === user.id;

  return (
    <div className="space-y-6">
      <Link
        to="/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to users
      </Link>

      <PageHeader
        title={user.name}
        description={user.email}
        actions={
          <>
            {isSelf ? (
              <Badge variant="secondary">this is you</Badge>
            ) : (
              <>
                {user.role === "admin" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={roleMutation.isPending}
                    onClick={() => roleMutation.mutate("user")}
                  >
                    <ShieldOff className="size-4" /> Revoke admin
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={roleMutation.isPending}
                    onClick={() => roleMutation.mutate("admin")}
                  >
                    <ShieldCheck className="size-4" /> Make admin
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" /> Delete user
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Role
          </p>
          <div className="mt-2">
            <Badge variant={user.role === "admin" ? "default" : "outline"}>
              {user.role}
            </Badge>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Sign-in method
          </p>
          <p className="mt-2 text-sm">
            {user.provider === "google" ? "Google OAuth" : "Email & password"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Joined
          </p>
          <p className="mt-2 text-sm">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold">
          Pets ({user.pets.length})
        </h3>
        {user.pets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This user has not added any pets yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {user.pets.map((pet) => (
              <Link
                key={pet.id}
                to={`/pets/${pet.id}`}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{pet.name}</p>
                  {pet.awarenessScore != null ? (
                    <Badge variant="secondary">{pet.awarenessScore}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[pet.speciesName, pet.breedName].filter(Boolean).join(" · ") ||
                    "Unknown species"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Born {formatDate(pet.birthDate)}
                  {pet.weightKg != null ? ` · ${pet.weightKg} kg` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${user.name}?`}
        description={
          <>
            This permanently removes <strong>{user.email}</strong>, their{" "}
            {user.pets.length} pet(s), and every health log, care item and AI
            report they own. This cannot be undone.
          </>
        }
        confirmLabel="Delete user"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
