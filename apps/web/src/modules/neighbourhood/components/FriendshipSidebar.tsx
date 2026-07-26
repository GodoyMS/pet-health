import { useMemo, useState } from "react";
import { Button, Icon, Skeleton } from "@repo/ui";

import type { MyNeighbourhoodPet } from "../api/neighbourhoodApi";
import type {
  FriendshipRequestView,
  PetFriendshipView
} from "../api/petFriendshipsApi";
import { formatRelativeTime } from "../utils/format";
import { PetAvatar } from "./PetAvatar";

type Tab = "incoming" | "outgoing" | "friends";

/** Whether the panel describes the whole household or just the active pet. */
type Scope = "all" | "active";

interface FriendshipSidebarProps {
  incoming: FriendshipRequestView[];
  outgoing: FriendshipRequestView[];
  friends: PetFriendshipView[];
  activePet: MyNeighbourhoodPet;
  /** True when the user owns more than one pet; hides the filter otherwise. */
  hasMultiplePets: boolean;
  isLoading: boolean;
  isBusy: boolean;
  onRespond: (id: string, action: "accept" | "reject") => void;
  onCancel: (id: string) => void;
  onUnfriend: (id: string) => void;
}

/**
 * The friendship panel.
 *
 * All three tabs describe the *same* set of pets, chosen by one scope filter
 * at the top. Previously requests were household-wide while friends were
 * silently scoped to the active pet, so counts across tabs didn't describe a
 * consistent world and there was no way to tell which was which.
 *
 * Scope is also stated on every row (which of your pets is involved), so the
 * list stays unambiguous even before anyone notices the filter.
 */
export function FriendshipSidebar({
  incoming,
  outgoing,
  friends,
  activePet,
  hasMultiplePets,
  isLoading,
  isBusy,
  onRespond,
  onCancel,
  onUnfriend
}: FriendshipSidebarProps) {
  const [tab, setTab] = useState<Tab>("incoming");
  // Household-wide by default: a request to any pet is time-sensitive, and
  // hiding it behind a filter is how you miss it.
  const [scope, setScope] = useState<Scope>("all");

  const visible = useMemo(() => {
    if (scope === "all" || !hasMultiplePets) {
      return { incoming, outgoing, friends };
    }
    return {
      incoming: incoming.filter((r) => r.addresseePet.id === activePet.id),
      outgoing: outgoing.filter((r) => r.requesterPet.id === activePet.id),
      friends: friends.filter((f) => f.myPet.id === activePet.id)
    };
  }, [scope, hasMultiplePets, incoming, outgoing, friends, activePet.id]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "incoming", label: "Requests", count: visible.incoming.length },
    { key: "outgoing", label: "Sent", count: visible.outgoing.length },
    { key: "friends", label: "Friends", count: visible.friends.length }
  ];

  // Only meaningful when the filter is actually narrowing something.
  const scopeLabel = scope === "all" ? "all your pets" : activePet.name;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {hasMultiplePets && (
        <div className="flex items-center gap-1 border-b border-border/60 p-1.5">
          <ScopeButton
            active={scope === "all"}
            onClick={() => setScope("all")}
            label="All pets"
            ariaLabel="Show friendships for all pets"
          />
          <ScopeButton
            active={scope === "active"}
            onClick={() => setScope("active")}
            label={activePet.name}
            ariaLabel={`Show friendships for ${activePet.name} only`}
            avatar={
              <PetAvatar
                species={activePet.species}
                name={activePet.name}
                size={16}
              />
            }
          />
        </div>
      )}

      <div
        role="tablist"
        aria-label={`Friendships for ${scopeLabel}`}
        className="flex items-center gap-1 border-b border-border/60 p-1.5"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`flex min-w-[1.1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-[1.1rem] ${
                  t.key === "incoming"
                    ? "bg-destructive text-white"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SidebarSkeleton />
        ) : tab === "incoming" ? (
          visible.incoming.length === 0 ? (
            <EmptyState
              icon="mark_email_read"
              title="No pending requests"
              body={
                scope === "active"
                  ? `No one has asked to be friends with ${activePet.name} yet.`
                  : "When a neighbour's pet asks to be friends with one of yours, it'll show up here."
              }
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {visible.incoming.map((request) => (
                <RequestCard
                  key={request.id}
                  otherPet={request.requesterPet}
                  myPet={request.addresseePet}
                  relation="wants to meet"
                  timestamp={request.createdAt}
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="h-8 flex-1 gap-1 text-xs"
                        disabled={isBusy}
                        onClick={() => onRespond(request.id, "accept")}
                      >
                        <Icon name="check" className="text-sm" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 text-xs"
                        disabled={isBusy}
                        onClick={() => onRespond(request.id, "reject")}
                      >
                        Decline
                      </Button>
                    </>
                  }
                />
              ))}
            </ul>
          )
        ) : tab === "outgoing" ? (
          visible.outgoing.length === 0 ? (
            <EmptyState
              icon="send"
              title="Nothing sent yet"
              body={
                scope === "active"
                  ? `${activePet.name} hasn't asked anyone to be friends yet.`
                  : "Tap a nearby pet on the map to send the first friend request."
              }
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {visible.outgoing.map((request) => (
                <RequestCard
                  key={request.id}
                  otherPet={request.addresseePet}
                  myPet={request.requesterPet}
                  relation="was asked by"
                  timestamp={request.createdAt}
                  actions={
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 flex-1 text-xs"
                      disabled={isBusy}
                      onClick={() => onCancel(request.id)}
                    >
                      Withdraw request
                    </Button>
                  }
                />
              ))}
            </ul>
          )
        ) : visible.friends.length === 0 ? (
          <EmptyState
            icon="diversity_1"
            title={
              scope === "active"
                ? `${activePet.name} has no friends yet`
                : "No friendships yet"
            }
            body="Same-species pets nearby are highlighted on the map — say hello."
          />
        ) : (
          <ul className="divide-y divide-border/50">
            {visible.friends.map((friendship) => (
              <FriendCard
                key={friendship.id}
                friendship={friendship}
                isBusy={isBusy}
                onUnfriend={onUnfriend}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ScopeButton({
  active,
  onClick,
  label,
  ariaLabel,
  avatar
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  /** Spelled out, since a button named just "Milo" says nothing on its own. */
  ariaLabel: string;
  avatar?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-primary/12 text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {avatar}
      <span className="max-w-[7rem] truncate">{label}</span>
    </button>
  );
}

/**
 * Facebook-style pairing card. The other owner's pet leads, and a chip names
 * which of *your* pets it concerns — the detail that makes a household-wide
 * list readable.
 */
function RequestCard({
  otherPet,
  myPet,
  relation,
  timestamp,
  actions
}: {
  otherPet: { id: string; name: string; species: { id: string; name: string; imageUrl: string | null }; ownerName: string };
  myPet: { id: string; name: string; species: { id: string; name: string; imageUrl: string | null } };
  relation: string;
  timestamp: string;
  actions: React.ReactNode;
}) {
  return (
    <li className="px-3.5 py-3">
      <div className="flex items-start gap-2.5">
        <PetAvatar species={otherPet.species} name={otherPet.name} size={38} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {otherPet.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {otherPet.species.name} · {otherPet.ownerName}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{relation}</span>
            <PetAvatar species={myPet.species} name={myPet.name} size={14} />
            <span className="max-w-[6rem] truncate font-medium text-foreground">
              {myPet.name}
            </span>
            <span aria-hidden>·</span>
            <span>{formatRelativeTime(timestamp)}</span>
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex gap-2">{actions}</div>
    </li>
  );
}

function FriendCard({
  friendship,
  isBusy,
  onUnfriend
}: {
  friendship: PetFriendshipView;
  isBusy: boolean;
  onUnfriend: (id: string) => void;
}) {
  const { friendPet, myPet } = friendship;

  return (
    <li className="group flex items-start gap-2.5 px-3.5 py-3">
      <PetAvatar species={friendPet.species} name={friendPet.name} size={38} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {friendPet.name}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {friendPet.species.name} · {friendPet.ownerName}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Icon name="handshake" className="text-[12px] text-emerald-500" />
          <span>friends with</span>
          <PetAvatar species={myPet.species} name={myPet.name} size={14} />
          <span className="max-w-[6rem] truncate font-medium text-foreground">
            {myPet.name}
          </span>
        </p>
      </div>

      <button
        type="button"
        disabled={isBusy}
        onClick={() => onUnfriend(friendship.id)}
        title={`Remove ${friendPet.name} from ${myPet.name}'s friends`}
        aria-label={`Remove ${friendPet.name} from ${myPet.name}'s friends`}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
      >
        <Icon name="person_remove" className="text-base" />
      </button>
    </li>
  );
}

function EmptyState({
  icon,
  title,
  body
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon name={icon} className="text-2xl" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-60 text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-3.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
