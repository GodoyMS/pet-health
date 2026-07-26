import { Badge, Button, Icon, Separator, Skeleton } from "@repo/ui";
import { useGetUser } from "@shared/hooks/useGetUser";
import { useDeleteAccount } from "@shared/hooks/useDeleteAccount";
import { GoogleIcon } from "@modules/auth/components/GoogleIcon";
import type { AuthProvider } from "@modules/auth/api/authApi";

const providerConfig: Record<
  AuthProvider,
  { label: string; description: string; icon: React.ReactNode; badgeVariant: "default" | "secondary" | "outline" }
> = {
  google: {
    label: "Google",
    description: "Your account is linked to Google. You sign in using your Google credentials.",
    icon: <GoogleIcon className="h-5 w-5" />,
    badgeVariant: "secondary"
  },
  email: {
    label: "Email & Password",
    description: "Your account uses email and password authentication.",
    icon: <Icon name="lock" className="text-muted-foreground text-xl" />,
    badgeVariant: "outline"
  }
};

function ProviderCard({ provider }: { provider: AuthProvider }) {
  const config = providerConfig[provider];

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{config.label}</span>
          <Badge variant="success" className="text-xs">Active</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {config.description}
        </p>
      </div>
    </div>
  );
}

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-semibold select-none">
      {initials}
    </div>
  );
}

export function AccountPage() {
  const { data: user, isLoading } = useGetUser();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Permanently delete your account? This will remove all your pets, health logs, reports and reminders. This action cannot be undone."
    );
    if (confirmed) deleteAccount();
  };

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and sign-in preferences.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name="person" className="text-base text-muted-foreground" />
            Profile
          </h2>
        </div>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <AvatarInitials name={user.name} />
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Member ID: <span className="font-mono">{user.id.slice(0, 8)}…</span>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sign-in method card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name="shield_person" className="text-base text-muted-foreground" />
            Sign-in method
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            This is how you authenticate when signing in to your account.
          </p>

          {isLoading ? (
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ) : user ? (
            <ProviderCard provider={user.provider} />
          ) : null}

          <Separator />

          <div className="flex items-start gap-3 text-xs text-muted-foreground">
            <Icon name="info" className="text-sm mt-0.5 shrink-0" />
            <p>
              {user?.provider === "google"
                ? "To update your name, email, or password, manage your Google account at myaccount.google.com."
                : "Keep your password safe. Never share it with anyone."}
            </p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-destructive/20 bg-destructive/5">
          <h2 className="text-sm font-semibold text-destructive flex items-center gap-2">
            <Icon name="warning" className="text-base" />
            Danger zone
          </h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Permanently delete your account and all related data — pets, health logs,
                AI reports, and care reminders. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              className="shrink-0"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? (
                <Icon name="progress_activity" className="animate-spin" />
              ) : (
                <Icon name="delete" />
              )}
              {isDeleting ? "Deleting…" : "Delete account"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
