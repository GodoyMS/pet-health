import { Button, Icon } from "@repo/ui";

import type { GeoStatus } from "./useGeolocation";

interface LocationGateProps {
  status: GeoStatus;
  error: string | null;
  onRequest: () => void;
  /** Headline shown in the idle/prompting state. */
  title?: string;
  /** Body copy shown in the idle/prompting state. */
  body?: string;
  /** Label of the primary opt-in button in the idle state. */
  actionLabel?: string;
  /** Reassurance line under the button. */
  privacyNote?: string;
}

/**
 * Full-panel opt-in shown until the user grants live location. Also covers the
 * denied / unavailable states with a way to retry.
 *
 * Copy is overridable so each map surface can explain why it needs location,
 * while the permission mechanics stay in one place.
 */
export function LocationGate({
  status,
  error,
  onRequest,
  title = "Find pet care near you",
  body = "Allow live location to see the nearest veterinary clinics and pet stores around you on an interactive map — with ratings, hours, directions, and contact details.",
  actionLabel = "Use my location",
  privacyNote = "Your location is used only to search — never stored."
}: LocationGateProps) {
  const isDenied = status === "denied";
  const isUnavailable = status === "unavailable";
  const isPrompting = status === "prompting";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-border/60 bg-card px-6 py-16 text-center shadow-sm">
      <div className="relative flex size-20 items-center justify-center">
        <span
          className={`absolute inset-0 rounded-full bg-primary/10 ${
            isPrompting ? "animate-ping" : ""
          }`}
        />
        <span className="relative flex size-16 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Icon
            name={isDenied || isUnavailable ? "location_off" : "my_location"}
            className="text-3xl"
          />
        </span>
      </div>

      <h2 className="mt-6 font-display text-xl font-semibold tracking-tight text-foreground">
        {isDenied
          ? "Location access is blocked"
          : isUnavailable
            ? "Location unavailable"
            : title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isDenied
          ? "You've blocked location access. Enable it in your browser's site settings, then try again."
          : isUnavailable
            ? error ?? "We couldn't access your location. Please try again."
            : body}
      </p>

      {error && !isDenied && !isUnavailable && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}

      <Button
        className="mt-7 gap-2"
        size="lg"
        onClick={onRequest}
        disabled={isPrompting}
      >
        {isPrompting ? (
          <>
            <Icon name="progress_activity" className="animate-spin text-lg" />
            Locating…
          </>
        ) : (
          <>
            <Icon name="my_location" className="text-lg" />
            {isDenied || isUnavailable ? "Try again" : actionLabel}
          </>
        )}
      </Button>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <Icon name="lock" className="text-sm" />
        {privacyNote}
      </p>
    </div>
  );
}
