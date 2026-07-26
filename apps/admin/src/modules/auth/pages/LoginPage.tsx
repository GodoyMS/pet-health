import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button, Input, Label } from "@repo/ui";

import { apiErrorMessage } from "@shared/api/httpClient";
import { authApi } from "../api/authApi";
import { CURRENT_ADMIN_QUERY_KEY } from "../hooks/useAdminAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not_admin"
      ? "This account does not have admin access."
      : null
  );

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (user) => {
      if (user.role !== "admin") {
        // Not an admin: end the session immediately, this app is admins-only.
        await authApi.logout().catch(() => undefined);
        setError("This account does not have admin access.");
        return;
      }
      queryClient.setQueryData(CURRENT_ADMIN_QUERY_KEY, user);
      navigate("/", { replace: true });
    },
    onError: (err) => setError(apiErrorMessage(err))
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Pet Health Backoffice
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Internal admin console — authorized staff only
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is restricted to accounts with the admin role.
        </p>
      </div>
    </div>
  );
}
