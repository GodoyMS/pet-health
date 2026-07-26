import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Icon } from "@repo/ui";

import type { NearbyPet } from "../api/neighbourhoodApi";
import { speciesTheme } from "../utils/speciesTheme";
import { PetAvatar } from "./PetAvatar";

interface NearbyPetMarkerProps {
  pet: NearbyPet;
  selected: boolean;
  onSelect: (pet: NearbyPet) => void;
}

/**
 * A neighbouring pet.
 *
 * Same-species pets are privileged on three independent channels — a saturated
 * species halo, a larger avatar, and a slow pulse — so the distinction still
 * reads in greyscale, at a glance, and for colour-blind users. Other species
 * stay deliberately quiet: smaller, desaturated, no halo.
 */
export function NearbyPetMarker({ pet, selected, onSelect }: NearbyPetMarkerProps) {
  const theme = speciesTheme(pet.species);
  const isFriend = pet.friendship?.status === "accepted";
  const isPending = pet.friendship?.status === "pending";
  const highlight = pet.isSameSpecies;

  const size = highlight ? 40 : 30;

  return (
    <AdvancedMarker
      position={pet.location}
      zIndex={selected ? 1500 : highlight ? 1000 : 500}
      onClick={() => onSelect(pet)}
      title={`${pet.name} · ${pet.species.name}`}
      className="nb-marker"
    >
      <div
        className={`group relative flex cursor-pointer flex-col items-center transition-transform duration-200 ${
          selected ? "scale-115" : "hover:scale-110"
        }`}
      >
        <span className="nb-ground-shadow absolute -bottom-0.5 h-1.5 w-6 rounded-[50%] bg-black/30 blur-[2px]" />

        {/* Species halo — same-species only, and it breathes. */}
        {highlight && (
          <span
            className="nb-pulse absolute inset-0 -m-1 rounded-full"
            style={{ backgroundColor: `${theme.color}40` }}
            aria-hidden
          />
        )}

        <span
          className="relative flex items-center justify-center rounded-full border-2 border-white shadow-lg"
          style={{
            boxShadow: highlight
              ? `0 0 0 3px ${theme.color}, 0 6px 16px -4px rgba(0,0,0,.4)`
              : "0 4px 10px -3px rgba(0,0,0,.35)",
            filter: highlight ? undefined : "saturate(.45) opacity(.85)"
          }}
        >
          <PetAvatar species={pet.species} name={pet.name} size={size} />

          {isFriend && (
            <span
              className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-white"
              title={`${pet.name} is a friend`}
            >
              <Icon name="check" className="text-[10px]" />
            </span>
          )}
          {isPending && !isFriend && (
            <span
              className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-white shadow ring-2 ring-white"
              title="Request pending"
            >
              <Icon name="schedule" className="text-[10px]" />
            </span>
          )}
        </span>

        {/* Name only for same-species pets, to keep the map readable. */}
        {highlight && (
          <span className="mt-1 max-w-[7rem] truncate rounded-full bg-card/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur">
            {pet.name}
          </span>
        )}
      </div>
    </AdvancedMarker>
  );
}
