import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Icon } from "@repo/ui";

import type { MyNeighbourhoodPet } from "../api/neighbourhoodApi";
import { speciesTheme } from "../utils/speciesTheme";
import { PetAvatar } from "./PetAvatar";

interface ActivePetMarkerProps {
  pet: MyNeighbourhoodPet;
  position: { lat: number; lng: number };
  /** Owner's display name, shown on the companion bubble. */
  ownerName: string;
  /** True while the owner's own position anchors this pet. */
  isFollowingOwner: boolean;
  draggable: boolean;
  onDragEnd: (position: { lat: number; lng: number }) => void;
}

/**
 * The hero marker: the active pet with its owner as a companion beside it.
 *
 * The stack is deliberately layered — ground shadow, then a bobbing avatar —
 * so the pet reads as standing *on* the tilted map rather than pasted over it.
 */
export function ActivePetMarker({
  pet,
  position,
  ownerName,
  isFollowingOwner,
  draggable,
  onDragEnd
}: ActivePetMarkerProps) {
  const theme = speciesTheme(pet.species);

  return (
    <AdvancedMarker
      position={position}
      zIndex={2000}
      draggable={draggable}
      title={draggable ? `Drag to move ${pet.name}` : pet.name}
      onDragEnd={(event) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat != null && lng != null) onDragEnd({ lat, lng });
      }}
      className="nb-marker"
    >
      <div className="relative flex flex-col items-center">
        {/* Ground contact: an ellipse on the map plane, under everything. */}
        <span className="nb-ground-shadow absolute -bottom-1 h-2.5 w-10 rounded-[50%] bg-black/35 blur-[3px]" />

        <div className="nb-bob relative flex flex-col items-center">
          {/* Owner companion, tucked behind the pet's shoulder. */}
          <span
            className="absolute -right-3.5 -top-2 z-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-md"
            title={`${ownerName} — companion`}
          >
            <Icon name="person" className="text-[15px]" />
          </span>

          <span
            className="relative z-10 flex items-center justify-center rounded-full border-[3px] border-white shadow-xl"
            style={{ boxShadow: `0 0 0 4px ${theme.color}55, 0 10px 22px -6px rgba(0,0,0,.45)` }}
          >
            <PetAvatar species={pet.species} name={pet.name} size={52} />
          </span>

          {/* Name plate */}
          <span className="mt-1.5 max-w-[8rem] truncate rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
            {pet.name}
          </span>

          {isFollowingOwner && (
            <span
              className="mt-1 flex items-center gap-0.5 rounded-full bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground shadow-sm"
              title="This pet follows your location"
            >
              <Icon name="my_location" className="text-[10px]" />
              Following you
            </span>
          )}
        </div>
      </div>
    </AdvancedMarker>
  );
}
