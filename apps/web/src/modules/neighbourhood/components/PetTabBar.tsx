import { Icon } from "@repo/ui";

import type { MyNeighbourhoodPet } from "../api/neighbourhoodApi";
import { speciesTheme } from "../utils/speciesTheme";
import { PetAvatar } from "./PetAvatar";

interface PetTabBarProps {
  pets: MyNeighbourhoodPet[];
  activePetId: string;
  onSelect: (petId: string) => void;
}

/**
 * Avatar tabs, one per pet. Scrolls horizontally on narrow screens rather than
 * wrapping, so the map keeps its height on mobile.
 */
export function PetTabBar({ pets, activePetId, onSelect }: PetTabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Choose a pet"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {pets.map((pet) => {
        const isActive = pet.id === activePetId;
        const theme = speciesTheme(pet.species);
        const pending = pet.incomingRequestCount;

        return (
          <button
            key={pet.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(pet.id)}
            className={`group relative flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition-all ${
              isActive
                ? "border-transparent bg-card shadow-md"
                : "border-border/60 bg-muted/40 hover:bg-card hover:shadow-sm"
            }`}
            style={isActive ? { boxShadow: `0 0 0 2px ${theme.color}, 0 6px 16px -8px rgba(0,0,0,.4)` } : undefined}
          >
            <span className="relative">
              <PetAvatar species={pet.species} name={pet.name} size={34} />
              {pending > 0 && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex min-w-[1.15rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-[1.15rem] text-white shadow ring-2 ring-card"
                  title={`${pending} pending request${pending === 1 ? "" : "s"}`}
                >
                  {pending > 9 ? "9+" : pending}
                </span>
              )}
            </span>

            <span className="min-w-0">
              <span
                className={`block truncate text-sm font-semibold ${
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {pet.name}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Icon name="handshake" className="text-[11px]" />
                {pet.friendCount}
                {pet.location?.isDiscoverable === false && (
                  <Icon
                    name="visibility_off"
                    className="ml-0.5 text-[11px]"
                    aria-label="Hidden from neighbours"
                  />
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
