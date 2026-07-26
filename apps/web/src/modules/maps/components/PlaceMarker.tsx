import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Icon } from "@repo/ui";

import type { NearbyPlace } from "../api/nearbyPlacesApi";
import { CATEGORY_META } from "../utils/placeMeta";

interface PlaceMarkerProps {
  place: NearbyPlace;
  selected: boolean;
  onSelect: (place: NearbyPlace) => void;
}

/** A custom teardrop pin coloured by category, with a hover/selected lift. */
export function PlaceMarker({ place, selected, onSelect }: PlaceMarkerProps) {
  const meta = CATEGORY_META[place.category];

  return (
    <AdvancedMarker
      position={place.location}
      zIndex={selected ? 1000 : undefined}
      onClick={() => onSelect(place)}
      title={place.name}
    >
      <div
        className={`group relative flex -translate-y-1 flex-col items-center transition-transform duration-200 ${
          selected ? "scale-125" : "hover:scale-110"
        }`}
      >
        {/* Rotated teardrop; the icon inside is counter-rotated so it stays upright. */}
        <div
          className="flex h-9 w-9 rotate-45 items-center justify-center rounded-full rounded-bl-none border-2 border-white shadow-lg"
          style={{ backgroundColor: meta.color }}
        >
          <span className="-rotate-45">
            <Icon name={meta.icon} className="text-[18px] text-white" />
          </span>
        </div>
        {selected && (
          <span
            className="absolute -bottom-1 h-2 w-2 rounded-full opacity-40 blur-[2px]"
            style={{ backgroundColor: meta.color }}
          />
        )}
      </div>
    </AdvancedMarker>
  );
}
