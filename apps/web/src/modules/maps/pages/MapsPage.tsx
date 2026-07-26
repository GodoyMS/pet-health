import { useEffect, useMemo, useState } from "react";
import { Icon, Skeleton } from "@repo/ui";

import type { NearbyPlace, NearbyPlaceType } from "../api/nearbyPlacesApi";

import { MapView } from "../components/MapView";
import { PlacesList } from "../components/PlacesList";
import { LocationGate, useGeolocation } from "@shared/maps";
import { useNearbyPlaces } from "../hooks/useNearbyPlaces";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

type Filter = "all" | NearbyPlaceType;

const FILTERS: { value: Filter; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "travel_explore" },
  { value: "veterinary_care", label: "Vets", icon: "stethoscope" },
  { value: "pet_store", label: "Stores", icon: "storefront" }
];

const RADIUS_OPTIONS = [
  { value: 2000, label: "2 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
  { value: 20000, label: "20 km" }
];

export function MapsPage() {
  const geo = useGeolocation();
  const [filter, setFilter] = useState<Filter>("all");
  const [radius, setRadius] = useState(5000);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const types = useMemo<NearbyPlaceType[]>(
    () => (filter === "all" ? ["veterinary_care", "pet_store"] : [filter]),
    [filter]
  );

  const {
    data: places = [],
    isLoading,
    isFetching,
    isError,
    refetch
  } = useNearbyPlaces({
    lat: geo.coords?.lat,
    lng: geo.coords?.lng,
    radius,
    types
  });

  // Drop the selection if the selected place is no longer in the results.
  useEffect(() => {
    if (selectedId && !places.some((p) => p.id === selectedId)) setSelectedId(null);
  }, [places, selectedId]);

  const selected = places.find((p) => p.id === selectedId) ?? null;

  if (!API_KEY) return <MissingKeyNotice />;

  // Location not granted yet → opt-in gate.
  if (geo.status !== "granted" || !geo.coords) {
    return (
      <PageShell isFetching={false} count={null} onRefresh={undefined}>
        <LocationGate status={geo.status} error={geo.error} onRequest={geo.request} />
      </PageShell>
    );
  }

  return (
    <PageShell
      isFetching={isFetching}
      count={isLoading ? null : places.length}
      onRefresh={() => refetch()}
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                filter === f.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={f.icon} className="text-base" />
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5">
          <Icon name="radar" className="text-sm text-muted-foreground" />
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="cursor-pointer bg-transparent text-xs font-medium text-foreground focus:outline-none"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                Within {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map + list */}
      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <div className="relative h-[55vh] overflow-hidden rounded-2xl border border-border shadow-sm lg:h-[calc(100vh-15rem)]">
          <MapView
            apiKey={API_KEY}
            center={geo.coords}
            places={places}
            selected={selected}
            onSelect={(p) => setSelectedId(p?.id ?? null)}
          />
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:h-[calc(100vh-15rem)]">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              {isLoading ? "Searching…" : `${places.length} nearby`}
            </h2>
            {isFetching && !isLoading && (
              <Icon name="progress_activity" className="animate-spin text-base text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ListMessage
                icon="error"
                title="Couldn't load places"
                body="Something went wrong searching nearby. Try again."
                action={{ label: "Retry", onClick: () => refetch() }}
              />
            ) : places.length === 0 ? (
              <ListMessage
                icon="search_off"
                title="Nothing found nearby"
                body="No vets or pet stores in this range. Try widening the radius."
              />
            ) : (
              <PlacesList
                places={places}
                selectedId={selectedId}
                onSelect={(p) => setSelectedId(p.id)}
              />
            )}
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground/70">
        <strong className="font-medium text-muted-foreground">Note:</strong> Place data,
        ratings, and hours are provided by Google. Always call ahead to confirm availability
        and services.
      </p>
    </PageShell>
  );
}

// ─── Layout shell ───────────────────────────────────────────────────────────

function PageShell({
  children,
  isFetching,
  count,
  onRefresh
}: {
  children: React.ReactNode;
  isFetching: boolean;
  count: number | null;
  onRefresh?: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Nearby Care
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count != null
              ? `${count} vet${count === 1 ? "" : "s"} & pet store${count === 1 ? "" : "s"} around you — live.`
              : "Vets and pet stores around you, live on the map."}
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="flex w-fit items-center gap-1.5 self-start rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
          >
            <Icon name="refresh" className={`text-base ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

function MissingKeyNotice() {
  return (
    <section className="flex flex-1 flex-col gap-5">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Nearby Care
        </h1>
      </header>
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600">
          <Icon name="key_off" className="text-2xl" />
        </div>
        <h2 className="mt-5 font-display text-lg font-semibold text-foreground">
          Map isn't configured yet
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1.5 py-0.5 text-xs">VITE_GOOGLE_MAPS_API_KEY</code>{" "}
          in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">apps/web/.env</code> with a
          Google Maps JavaScript API key, and{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GOOGLE_MAPS_API_KEY</code> on the
          API (Places API New) to enable nearby search.
        </p>
      </div>
    </section>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListMessage({
  icon,
  title,
  body,
  action
}: {
  icon: string;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon name={icon} className="text-2xl" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
