import { Button, Icon } from "@repo/ui";

import type { MyNeighbourhoodPet, NearbyPet } from "../api/neighbourhoodApi";
import { formatAge, formatDistance } from "../utils/format";
import { speciesTheme } from "../utils/speciesTheme";
import { PetAvatar } from "./PetAvatar";

interface NearbyPetPopoverProps {
  pet: NearbyPet;
  activePet: MyNeighbourhoodPet;
  isBusy: boolean;
  onClose: () => void;
  onSendRequest: () => void;
  onCancelRequest: (friendshipId: string) => void;
  onRespond: (friendshipId: string, action: "accept" | "reject") => void;
  onUnfriend: (friendshipId: string) => void;
}

/**
 * Detail card for a neighbouring pet, with a single state-aware call to
 * action derived from the friendship row: none → ask, pending outgoing →
 * withdraw, pending incoming → respond, accepted → friends.
 */
export function NearbyPetPopover({
  pet,
  activePet,
  isBusy,
  onClose,
  onSendRequest,
  onCancelRequest,
  onRespond,
  onUnfriend
}: NearbyPetPopoverProps) {
  const theme = speciesTheme(pet.species);
  const friendship = pet.friendship;
  const isFriend = friendship?.status === "accepted";

  return (
    <div className="w-[19rem] overflow-hidden rounded-2xl bg-card text-left">
      {/* Header band tinted with the species colour. */}
      <div
        className="relative flex items-center gap-3 px-4 py-3.5"
        style={{
          background: `linear-gradient(135deg, ${theme.color}26, transparent 70%)`
        }}
      >
        <span
          className="rounded-full ring-2 ring-white"
          style={{ boxShadow: `0 0 0 3px ${theme.color}66` }}
        >
          <PetAvatar species={pet.species} name={pet.name} size={46} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-base font-semibold text-foreground">
              {pet.name}
            </h3>
            {isFriend && (
              <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                <Icon name="check_circle" className="text-[11px]" />
                Friend
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {pet.species.name}
            {pet.breed ? ` · ${pet.breed.name}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon name="close" className="text-base" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 border-y border-border/60 px-4 py-2.5 text-center">
        <Stat icon="straighten" label={formatDistance(pet.distanceMeters)} hint="away" />
        <Stat icon="cake" label={formatAge(pet.birthDate)} hint="old" />
        <Stat
          icon={pet.isSameSpecies ? "join_inner" : "diversity_3"}
          label={pet.isSameSpecies ? "Same" : "Other"}
          hint="species"
        />
      </div>

      <div className="px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="person" className="text-sm" />
          Cared for by <span className="font-medium text-foreground">{pet.ownerName}</span>
        </p>

        <div className="mt-3">
          {isFriend && friendship ? (
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700">
                <Icon name="handshake" className="text-base" />
                Friends with {activePet.name}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => onUnfriend(friendship.id)}
              >
                Remove
              </Button>
            </div>
          ) : friendship?.status === "pending" && friendship.direction === "incoming" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{pet.name}</span> asked to
                be friends with {activePet.name}.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  disabled={isBusy}
                  onClick={() => onRespond(friendship.id, "accept")}
                >
                  <Icon name="check" className="text-sm" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={isBusy}
                  onClick={() => onRespond(friendship.id, "reject")}
                >
                  Decline
                </Button>
              </div>
            </div>
          ) : friendship?.status === "pending" ? (
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700">
                <Icon name="schedule" className="text-base" />
                Request sent
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => onCancelRequest(friendship.id)}
              >
                Withdraw
              </Button>
            </div>
          ) : (
            <Button
              className="w-full gap-1.5"
              size="sm"
              disabled={isBusy}
              onClick={onSendRequest}
            >
              <Icon name={isBusy ? "progress_activity" : "person_add"} className={`text-sm ${isBusy ? "animate-spin" : ""}`} />
              Send friend request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, hint }: { icon: string; label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon name={icon} className="text-base text-muted-foreground" />
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </div>
  );
}
