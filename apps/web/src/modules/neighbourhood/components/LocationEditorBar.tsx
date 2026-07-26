import { Icon } from "@repo/ui";

import type { MyNeighbourhoodPet } from "../api/neighbourhoodApi";

interface LocationEditorBarProps {
  pet: MyNeighbourhoodPet;
  isPlacing: boolean;
  isBusy: boolean;
  canFollowOwner: boolean;
  onTogglePlacing: () => void;
  onFollowOwner: () => void;
  onToggleDiscoverable: () => void;
}

/**
 * The location controls, floating over the map's bottom edge.
 *
 * Three affordances, matching how people actually think about moving a pin:
 * drag it, drop it somewhere specific, or snap it back to yourself.
 */
export function LocationEditorBar({
  pet,
  isPlacing,
  isBusy,
  canFollowOwner,
  onTogglePlacing,
  onFollowOwner,
  onToggleDiscoverable
}: LocationEditorBarProps) {
  const isFollowing = pet.location?.source === "inherited";
  const isDiscoverable = pet.location?.isDiscoverable !== false;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-border/60 bg-card/95 p-1.5 shadow-xl backdrop-blur">
        {isPlacing ? (
          <>
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground">
              <Icon name="ads_click" className="animate-pulse text-base text-primary" />
              Tap the map to place {pet.name}
            </span>
            <button
              type="button"
              onClick={onTogglePlacing}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <BarButton
              icon="drag_pan"
              label="Drop here"
              hint={`Tap the map to place ${pet.name}`}
              onClick={onTogglePlacing}
              disabled={isBusy}
            />

            <BarButton
              icon="my_location"
              label={isFollowing ? "Following you" : "Follow me"}
              hint={
                isFollowing
                  ? `${pet.name} moves with your location`
                  : `Snap ${pet.name} back to your location`
              }
              onClick={onFollowOwner}
              disabled={isBusy || isFollowing || !canFollowOwner}
              active={isFollowing}
            />

            <span className="mx-0.5 h-6 w-px bg-border" />

            <BarButton
              icon={isDiscoverable ? "visibility" : "visibility_off"}
              label={isDiscoverable ? "Visible" : "Hidden"}
              hint={
                isDiscoverable
                  ? "Neighbours can see this pet — tap to hide"
                  : "Hidden from neighbours — tap to show"
              }
              onClick={onToggleDiscoverable}
              disabled={isBusy}
              active={isDiscoverable}
            />
          </>
        )}
      </div>
    </div>
  );
}

function BarButton({
  icon,
  label,
  hint,
  onClick,
  disabled,
  active
}: {
  icon: string;
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      aria-label={hint}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-primary/12 text-primary"
          : "text-foreground hover:bg-muted"
      }`}
    >
      <Icon name={icon} className="text-base" />
      {label}
    </button>
  );
}
