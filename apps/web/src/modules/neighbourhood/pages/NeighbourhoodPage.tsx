import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Button,
  Icon,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton
} from "@repo/ui";
import { LocationGate, useGeolocation } from "@shared/maps";

import type { MyNeighbourhoodPet, NearbyPet } from "../api/neighbourhoodApi";
import { FriendshipSidebar } from "../components/FriendshipSidebar";
import { LocationEditorBar } from "../components/LocationEditorBar";
import { NeighbourhoodMap } from "../components/NeighbourhoodMap";
import { PetTabBar } from "../components/PetTabBar";
import { useFriendshipMutations } from "../hooks/useFriendshipMutations";
import { usePetLocationMutations } from "../hooks/usePetLocationMutations";
import {
  useFriendshipInbox,
  useMyNeighbourhoodPets,
  useNearbyPets,
  useOwnerLocation,
  usePetFriends
} from "../hooks/useNeighbourhood";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

const RADIUS_OPTIONS = [
  { value: 500, label: "500 m" },
  { value: 1000, label: "1 km" },
  { value: 2000, label: "2 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" }
];

export function NeighbourhoodPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const geo = useGeolocation();

  const [radius, setRadius] = useState(2000);
  const [selected, setSelected] = useState<NearbyPet | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: pets = [], isLoading: petsLoading } = useMyNeighbourhoodPets();
  const { data: ownerLocation } = useOwnerLocation();
  const { data: inbox, isLoading: inboxLoading } = useFriendshipInbox();

  const locations = usePetLocationMutations();
  const friendships = useFriendshipMutations();

  // The active pet lives in the URL, so the view is deep-linkable and a tab
  // switch is just a navigation.
  const requestedPetId = searchParams.get("pet");
  const activePet =
    pets.find((pet) => pet.id === requestedPetId) ?? pets[0] ?? null;

  const setActivePet = (petId: string) => {
    setSelected(null);
    setIsPlacing(false);
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set("pet", petId);
      return next;
    });
  };

  const { data: nearbyPets = [], isLoading: nearbyLoading } = useNearbyPets(
    activePet?.location ? activePet.id : undefined,
    radius
  );
  const { data: friends = [] } = usePetFriends(activePet?.id);

  // Seed the owner anchor the first time we get a fix, which also gives every
  // pet its initial position.
  const hasOwnerLocation = Boolean(ownerLocation);
  const setOwnerLocation = locations.setOwnerLocation;
  useEffect(() => {
    if (geo.status !== "granted" || !geo.coords) return;
    if (hasOwnerLocation) return;
    if (setOwnerLocation.isPending) return;
    setOwnerLocation.mutate({ lat: geo.coords.lat, lng: geo.coords.lng });
  }, [geo.status, geo.coords, hasOwnerLocation, setOwnerLocation]);

  // Drop a stale selection when the pet leaves the result set.
  useEffect(() => {
    if (selected && !nearbyPets.some((pet) => pet.id === selected.id)) {
      setSelected(null);
    }
  }, [nearbyPets, selected]);

  // Keep the open popover in sync with polled data (e.g. friendship accepted
  // in another tab), so its CTA never goes stale.
  const liveSelected = useMemo(
    () => (selected ? nearbyPets.find((p) => p.id === selected.id) ?? selected : null),
    [selected, nearbyPets]
  );

  const packPets = useMemo(
    () => pets.filter((pet) => pet.id !== activePet?.id && pet.location),
    [pets, activePet?.id]
  );

  const isBusy =
    locations.movePet.isPending ||
    locations.followOwner.isPending ||
    locations.setDiscoverability.isPending ||
    friendships.sendRequest.isPending ||
    friendships.respond.isPending;

  const incoming = inbox?.incoming ?? [];
  const outgoing = inbox?.outgoing ?? [];

  if (!API_KEY) return <MissingKeyNotice />;

  if (petsLoading) return <PageSkeleton />;

  if (pets.length === 0) return <NoPetsNotice />;

  // No pet has been placed yet → ask for location once, then everything seeds.
  const needsLocation = !activePet?.location;
  if (needsLocation && geo.status !== "granted") {
    return (
      <Shell
        pets={pets}
        activePetId={activePet?.id}
        onSelectPet={setActivePet}
        pendingCount={incoming.length}
        onOpenSheet={() => setIsSheetOpen(true)}
      >
        <LocationGate
          status={geo.status}
          error={geo.error}
          onRequest={geo.request}
          title="Put your pets on the map"
          body="Allow location once to place your pets in their neighbourhood. You can move each pet individually afterwards — and hide any of them at any time."
          actionLabel="Place my pets"
          privacyNote="Neighbours only ever see an approximate area, never your exact spot."
        />
      </Shell>
    );
  }

  if (!activePet?.location) {
    return (
      <Shell
        pets={pets}
        activePetId={activePet?.id}
        onSelectPet={setActivePet}
        pendingCount={incoming.length}
        onOpenSheet={() => setIsSheetOpen(true)}
      >
        <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-border/60 bg-card">
          <div className="flex flex-col items-center gap-3 text-center">
            <Icon name="progress_activity" className="animate-spin text-2xl text-primary" />
            <p className="text-sm text-muted-foreground">Placing your pets…</p>
          </div>
        </div>
      </Shell>
    );
  }

  const activePosition = {
    lat: activePet.location.lat,
    lng: activePet.location.lng
  };

  const sidebar = (
    <FriendshipSidebar
      incoming={incoming}
      outgoing={outgoing}
      friends={friends}
      activePetName={activePet.name}
      isLoading={inboxLoading}
      isBusy={isBusy}
      onRespond={(id, action) => friendships.respond.mutate({ id, action })}
      onCancel={(id) => friendships.respond.mutate({ id, action: "cancel" })}
    />
  );

  return (
    <Shell
      pets={pets}
      activePetId={activePet.id}
      onSelectPet={setActivePet}
      pendingCount={incoming.length}
      onOpenSheet={() => setIsSheetOpen(true)}
      radius={radius}
      onRadiusChange={setRadius}
      nearbyCount={nearbyLoading ? null : nearbyPets.length}
      sameSpeciesCount={nearbyPets.filter((p) => p.isSameSpecies).length}
    >
      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_23rem]">
        <div className="relative h-[62vh] overflow-hidden rounded-2xl border border-border shadow-sm lg:h-[calc(100vh-16rem)]">
          <NeighbourhoodMap
            apiKey={API_KEY}
            activePet={activePet}
            activePosition={activePosition}
            packPets={packPets}
            nearbyPets={nearbyPets}
            radiusMeters={radius}
            ownerName="You"
            selected={liveSelected}
            isPlacing={isPlacing}
            isBusy={isBusy}
            onSelect={setSelected}
            onSwitchPet={setActivePet}
            onMovePet={({ lat, lng }) => {
              setIsPlacing(false);
              locations.movePet.mutate({ petId: activePet.id, lat, lng });
            }}
            onSendRequest={(pet) =>
              friendships.sendRequest.mutate({
                requesterPetId: activePet.id,
                addresseePetId: pet.id
              })
            }
            onCancelRequest={(id) =>
              friendships.respond.mutate({ id, action: "cancel" })
            }
            onRespond={(id, action) => friendships.respond.mutate({ id, action })}
            onUnfriend={(id) => friendships.respond.mutate({ id, action: "unfriend" })}
          />

          <LocationEditorBar
            pet={activePet}
            isPlacing={isPlacing}
            isBusy={isBusy}
            canFollowOwner={Boolean(ownerLocation)}
            onTogglePlacing={() => {
              setIsPlacing((v) => !v);
              setSelected(null);
            }}
            onFollowOwner={() => locations.followOwner.mutate(activePet.id)}
            onToggleDiscoverable={() =>
              locations.setDiscoverability.mutate({
                petId: activePet.id,
                isDiscoverable: activePet.location?.isDiscoverable === false
              })
            }
          />
        </div>

        {/* Sidebar on desktop; the same tree is reused in the mobile sheet. */}
        <aside className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:flex lg:h-[calc(100vh-16rem)] lg:flex-col">
          {sidebar}
        </aside>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border/60 px-4 py-3">
            <SheetTitle>Friendships</SheetTitle>
            <SheetDescription className="text-xs">
              Requests across all your pets
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100%-4.5rem)]">{sidebar}</div>
        </SheetContent>
      </Sheet>

      <p className="text-xs leading-relaxed text-muted-foreground/70">
        <strong className="font-medium text-muted-foreground">Privacy:</strong> other
        owners see an approximate area for your pets — never their exact position — and
        you can hide any pet from the map at any time.
      </p>
    </Shell>
  );
}

// ─── Layout shell ───────────────────────────────────────────────────────────

interface ShellProps {
  children: React.ReactNode;
  pets: MyNeighbourhoodPet[];
  activePetId?: string;
  onSelectPet: (petId: string) => void;
  pendingCount: number;
  onOpenSheet: () => void;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
  nearbyCount?: number | null;
  sameSpeciesCount?: number;
}

function Shell({
  children,
  pets,
  activePetId,
  onSelectPet,
  pendingCount,
  onOpenSheet,
  radius,
  onRadiusChange,
  nearbyCount,
  sameSpeciesCount
}: ShellProps) {
  return (
    <section className="flex flex-1 flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Neighbourhood
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {nearbyCount != null
              ? `${nearbyCount} pet${nearbyCount === 1 ? "" : "s"} nearby${
                  sameSpeciesCount ? ` · ${sameSpeciesCount} same species` : ""
                }`
              : "See who's around your pet — and make friends."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {radius != null && onRadiusChange && (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5">
              <Icon name="radar" className="text-sm text-muted-foreground" />
              <select
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                aria-label="Search radius"
                className="cursor-pointer bg-transparent text-xs font-medium text-foreground focus:outline-none"
              >
                {RADIUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Within {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sidebar lives in a sheet below lg. */}
          <button
            type="button"
            onClick={onOpenSheet}
            className="relative flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted lg:hidden"
          >
            <Icon name="diversity_1" className="text-base" />
            Friends
            {pendingCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-[1.15rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-[1.15rem] text-white ring-2 ring-background">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {pets.length > 0 && activePetId && (
        <PetTabBar pets={pets} activePetId={activePetId} onSelect={onSelectPet} />
      )}

      {children}
    </section>
  );
}

// ─── Notices ────────────────────────────────────────────────────────────────

function NoticeShell({
  icon,
  tone,
  title,
  children
}: {
  icon: string;
  tone: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-1 flex-col gap-5">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Neighbourhood
        </h1>
      </header>
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
        <div className={`flex size-14 items-center justify-center rounded-2xl ${tone}`}>
          <Icon name={icon} className="text-2xl" />
        </div>
        <h2 className="mt-5 font-display text-lg font-semibold text-foreground">
          {title}
        </h2>
        <div className="mt-2 max-w-md text-sm text-muted-foreground">{children}</div>
      </div>
    </section>
  );
}

function MissingKeyNotice() {
  return (
    <NoticeShell
      icon="key_off"
      tone="bg-amber-500/12 text-amber-600"
      title="Map isn't configured yet"
    >
      <p>
        Set <Code>VITE_GOOGLE_MAPS_API_KEY</Code> in <Code>apps/web/.env</Code> with a
        Google Maps JavaScript API key. For the tilted 3D view, also set{" "}
        <Code>VITE_GOOGLE_MAPS_NEIGHBOURHOOD_MAP_ID</Code> to a{" "}
        <strong className="font-medium text-foreground">vector</strong> Map ID with tilt
        and rotation enabled.
      </p>
    </NoticeShell>
  );
}

function NoPetsNotice() {
  return (
    <NoticeShell
      icon="pets"
      tone="bg-primary/12 text-primary"
      title="Add a pet to join the neighbourhood"
    >
      <p>
        The neighbourhood map is built around your pets — add one and it'll appear here
        straight away.
      </p>
      <Button asChild className="mt-5 gap-1.5">
        <Link to="/dashboard/pets">
          <Icon name="add" className="text-base" />
          Add a pet
        </Link>
      </Button>
    </NoticeShell>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{children}</code>
  );
}

function PageSkeleton() {
  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_23rem]">
        <Skeleton className="h-[62vh] rounded-2xl lg:h-[calc(100vh-16rem)]" />
        <Skeleton className="hidden rounded-2xl lg:block lg:h-[calc(100vh-16rem)]" />
      </div>
    </section>
  );
}
