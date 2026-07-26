import { useState } from "react";
import { Button, Icon, Skeleton } from "@repo/ui";

import type { FriendshipRequestView } from "../api/petFriendshipsApi";
import type { PetFriendView } from "../api/petFriendshipsApi";
import { formatRelativeTime } from "../utils/format";
import { PetAvatar } from "./PetAvatar";

type Tab = "incoming" | "outgoing" | "friends";

interface FriendshipSidebarProps {
  incoming: FriendshipRequestView[];
  outgoing: FriendshipRequestView[];
  friends: PetFriendView[];
  activePetName: string;
  isLoading: boolean;
  isBusy: boolean;
  onRespond: (id: string, action: "accept" | "reject") => void;
  onCancel: (id: string) => void;
}

/**
 * The friendship inbox.
 *
 * Incoming and outgoing aggregate across *every* pet the user owns, which is
 * why each card names both sides of the pairing — with several pets it must be
 * unambiguous which of yours is involved.
 */
export function FriendshipSidebar({
  incoming,
  outgoing,
  friends,
  activePetName,
  isLoading,
  isBusy,
  onRespond,
  onCancel
}: FriendshipSidebarProps) {
  const [tab, setTab] = useState<Tab>("incoming");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "incoming", label: "Requests", count: incoming.length },
    { key: "outgoing", label: "Sent", count: outgoing.length },
    { key: "friends", label: "Friends", count: friends.length }
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border/60 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
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
          incoming.length === 0 ? (
            <EmptyState
              icon="mark_email_read"
              title="No pending requests"
              body="When a neighbour's pet asks to be friends with one of yours, it'll show up here."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {incoming.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
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
          outgoing.length === 0 ? (
            <EmptyState
              icon="send"
              title="Nothing sent yet"
              body="Tap a nearby pet on the map to send the first friend request."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {outgoing.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
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
        ) : friends.length === 0 ? (
          <EmptyState
            icon="diversity_1"
            title={`${activePetName} has no friends yet`}
            body="Same-species pets nearby are highlighted on the map — say hello."
          />
        ) : (
          <ul className="divide-y divide-border/50">
            {friends.map((friend) => (
              <li key={friend.id} className="flex items-center gap-3 px-3.5 py-3">
                <PetAvatar species={friend.species} name={friend.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {friend.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {friend.species.name} · with {friend.ownerName}
                  </p>
                </div>
                <Icon name="handshake" className="text-base text-emerald-500" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Facebook-style pairing card: requester pet → target pet, so the user can see
 * at a glance which of their pets was asked.
 */
function RequestCard({
  request,
  actions
}: {
  request: FriendshipRequestView;
  /** Caller supplies already-wired buttons, including their disabled state. */
  actions: React.ReactNode;
}) {
  const { requesterPet, addresseePet } = request;

  return (
    <li className="px-3.5 py-3">
      <div className="flex items-center gap-2">
        <PetAvatar species={requesterPet.species} name={requesterPet.name} size={38} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {requesterPet.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {requesterPet.species.name} · {requesterPet.ownerName}
          </p>
        </div>

        <Icon name="arrow_forward" className="shrink-0 text-sm text-muted-foreground" />

        <div className="flex min-w-0 items-center gap-1.5">
          <PetAvatar species={addresseePet.species} name={addresseePet.name} size={28} />
          <span className="truncate text-xs font-medium text-foreground">
            {addresseePet.name}
          </span>
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {formatRelativeTime(request.createdAt)}
      </p>

      <div className="mt-2.5 flex gap-2">{actions}</div>
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
