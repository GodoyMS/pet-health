import { Badge, Button, Icon, Separator, Skeleton } from "@repo/ui";
import { Link } from "react-router-dom";

import { useCalendarStatus, useConnectGoogleCalendar, useDisconnectGoogleCalendar } from "../hooks/useGoogleCalendar";

function GoogleCalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0" strokeWidth="1.5"/>
      <rect x="7" y="2" width="2" height="4" rx="1" fill="#1a73e8"/>
      <rect x="15" y="2" width="2" height="4" rx="1" fill="#1a73e8"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="#dadce0" strokeWidth="1.5"/>
      <text x="12" y="18" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1a73e8">CAL</text>
    </svg>
  );
}

export function GoogleCalendarConnect() {
  const { data: status, isLoading } = useCalendarStatus();
  const connect = useConnectGoogleCalendar();
  const disconnect = useDisconnectGoogleCalendar();

  const unsyncedPets = status?.pets.filter((p) => !p.synced && p.pendingCount > 0) ?? [];
  const syncedPets = status?.pets.filter((p) => p.synced) ?? [];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <GoogleCalIcon className="h-4 w-4" />
          Google Calendar Integration
        </h2>
      </div>

      <div className="px-6 py-5 space-y-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : status?.connected ? (
          <ConnectedState
            syncedPets={syncedPets}
            unsyncedPets={unsyncedPets}
            onDisconnect={() => disconnect.mutate()}
            isDisconnecting={disconnect.isPending}
          />
        ) : (
          <DisconnectedState
            onConnect={() => connect.mutate()}
            isConnecting={connect.isPending}
          />
        )}
      </div>
    </div>
  );
}

function DisconnectedState({
  onConnect,
  isConnecting
}: {
  onConnect: () => void;
  isConnecting: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm">
          <GoogleCalIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Not connected</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Connect your Google Calendar to sync pending preventive care reminders directly to your calendar.
          </p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon name="check_circle" className="text-sm text-green-500 shrink-0" />
          Reminders appear in your Google Calendar as events
        </div>
        <div className="flex items-center gap-2">
          <Icon name="check_circle" className="text-sm text-green-500 shrink-0" />
          Email reminders 7 days and 1 day before each event
        </div>
        <div className="flex items-center gap-2">
          <Icon name="check_circle" className="text-sm text-green-500 shrink-0" />
          Automatically removed when you disconnect
        </div>
      </div>

      <Button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full gap-2"
      >
        <GoogleCalIcon className="h-4 w-4" />
        {isConnecting ? "Redirecting to Google…" : "Connect Google Calendar"}
      </Button>
    </div>
  );
}

function ConnectedState({
  syncedPets,
  unsyncedPets,
  onDisconnect,
  isDisconnecting
}: {
  syncedPets: Array<{ id: string; name: string; syncedCount: number; pendingCount: number }>;
  unsyncedPets: Array<{ id: string; name: string; syncedCount: number; pendingCount: number }>;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Connected badge */}
      <div className="flex items-start gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-green-200 shadow-sm dark:bg-green-950">
          <GoogleCalIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">Google Calendar</p>
            <Badge variant="success" className="text-xs">Connected</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your preventive care reminders can be synced to Google Calendar.
          </p>
        </div>
      </div>

      {/* Sync status per pet */}
      {syncedPets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Synced pets</p>
          {syncedPets.map((pet) => (
            <div key={pet.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <Icon name="pets" className="text-sm text-primary" />
                <span className="text-sm font-medium">{pet.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{pet.syncedCount} events synced</span>
            </div>
          ))}
        </div>
      )}

      {/* Unsynced pets suggestion */}
      {unsyncedPets.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <div className="flex items-start gap-2 mb-3">
            <Icon name="info" className="text-sm text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                {unsyncedPets.length} pet{unsyncedPets.length > 1 ? "s" : ""} not synced yet
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Go to each pet's preventive care page to sync, or visit the Calendar page to sync all at once.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {unsyncedPets.map((pet) => (
              <div key={pet.id} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-200">
                  <Icon name="pets" className="text-xs" />
                  {pet.name}
                  <span className="text-amber-600 dark:text-amber-400">· {pet.pendingCount} pending</span>
                </div>
                <Link
                  to={`/dashboard/pets/${pet.id}/preventive-care`}
                  className="text-xs text-primary underline underline-offset-2"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {syncedPets.length === 0 && unsyncedPets.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No pending preventive care events found for the current year.
        </p>
      )}

      <div className="text-center">
        <Link to="/dashboard/calendar" className="text-xs text-primary underline underline-offset-2">
          Open Calendar view →
        </Link>
      </div>

      <Separator />

      {/* Disconnect */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Disconnecting will remove all synced events from your Google Calendar.
        </p>
        <Button
          variant="outline"
          onClick={onDisconnect}
          disabled={isDisconnecting}
          className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-2"
        >
          <Icon name="link_off" className="text-sm" />
          {isDisconnecting ? "Disconnecting…" : "Disconnect Google Calendar"}
        </Button>
      </div>
    </div>
  );
}
