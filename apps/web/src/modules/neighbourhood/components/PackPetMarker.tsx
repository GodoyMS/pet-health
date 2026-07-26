import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Icon } from "@repo/ui";

import type { MyNeighbourhoodPet } from "../api/neighbourhoodApi";
import { PetAvatar } from "./PetAvatar";

interface PackPetMarkerProps {
  pet: MyNeighbourhoodPet;
  onSelect: (petId: string) => void;
}

/**
 * One of the user's *other* pets. Rendered from the tab-bar payload rather
 * than the nearby query (the API excludes same-owner pets), and styled as a
 * muted secondary pin so "your pack" never competes with real neighbours.
 * Clicking one makes it the active pet.
 */
export function PackPetMarker({ pet, onSelect }: PackPetMarkerProps) {
  if (!pet.location) return null;

  return (
    <AdvancedMarker
      position={{ lat: pet.location.lat, lng: pet.location.lng }}
      zIndex={800}
      onClick={() => onSelect(pet.id)}
      title={`${pet.name} — switch to this pet`}
      className="nb-marker"
    >
      <div className="group relative flex cursor-pointer flex-col items-center transition-transform duration-200 hover:scale-110">
        <span className="nb-ground-shadow absolute -bottom-0.5 h-1.5 w-5 rounded-[50%] bg-black/25 blur-[2px]" />

        <span className="relative flex items-center justify-center rounded-full border-2 border-dashed border-primary/70 bg-card/80 p-0.5 shadow-md backdrop-blur">
          <PetAvatar species={pet.species} name={pet.name} size={26} />
          <span
            className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-white"
            title="Your pet"
          >
            <Icon name="home" className="text-[10px]" />
          </span>
        </span>
      </div>
    </AdvancedMarker>
  );
}
