import { useEffect, useRef } from "react";
import { Icon } from "@repo/ui";

import type { NearbyPlace } from "../api/nearbyPlacesApi";
import { CATEGORY_META, formatDistance } from "../utils/placeMeta";

interface PlacesListProps {
  places: NearbyPlace[];
  selectedId: string | null;
  onSelect: (place: NearbyPlace) => void;
}

export function PlacesList({ places, selectedId, onSelect }: PlacesListProps) {
  return (
    <ul className="flex flex-col divide-y divide-border/50">
      {places.map((place) => (
        <PlaceRow
          key={place.id}
          place={place}
          selected={place.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function PlaceRow({
  place,
  selected,
  onSelect
}: {
  place: NearbyPlace;
  selected: boolean;
  onSelect: (place: NearbyPlace) => void;
}) {
  const meta = CATEGORY_META[place.category];
  const distance = formatDistance(place.distanceMeters);
  const ref = useRef<HTMLLIElement>(null);

  // Keep the selected row in view when selection is driven from the map.
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <li ref={ref}>
      <button
        type="button"
        onClick={() => onSelect(place)}
        className={`flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors ${
          selected ? "bg-primary/6" : "hover:bg-muted/40"
        }`}
      >
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
        >
          <Icon name={meta.icon} className="text-lg" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">{place.name}</span>
          </span>

          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {place.rating != null && (
              <span className="inline-flex items-center gap-0.5 font-medium text-amber-500">
                <Icon name="star" variant="filled" className="text-[13px]" />
                <span className="text-foreground">{place.rating.toFixed(1)}</span>
              </span>
            )}
            {place.openNow === true && (
              <span className="font-medium text-emerald-600">Open</span>
            )}
            {place.openNow === false && <span>Closed</span>}
            <span className="text-muted-foreground/70">{meta.label}</span>
          </span>

          {place.address && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground/80">
              {place.address}
            </span>
          )}
        </span>

        {distance && (
          <span className="mt-0.5 shrink-0 text-xs font-medium text-muted-foreground">
            {distance}
          </span>
        )}
      </button>
    </li>
  );
}
