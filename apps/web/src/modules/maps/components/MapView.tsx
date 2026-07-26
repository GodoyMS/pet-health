import { useEffect } from "react";
import {
  APIProvider,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  useMap
} from "@vis.gl/react-google-maps";
import { Icon } from "@repo/ui";

import type { NearbyPlace } from "../api/nearbyPlacesApi";
import type { Coords } from "../hooks/useGeolocation";
import { PlaceInfoCard } from "./PlaceInfoCard";
import { PlaceMarker } from "./PlaceMarker";
import { UserLocationMarker } from "./UserLocationMarker";

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

interface MapViewProps {
  apiKey: string;
  center: Coords;
  places: NearbyPlace[];
  selected: NearbyPlace | null;
  onSelect: (place: NearbyPlace | null) => void;
}

export function MapView({ apiKey, center, places, selected, onSelect }: MapViewProps) {
  return (
    <APIProvider apiKey={apiKey}>
      {/* Edge-to-edge, rounded popup: strip Google's default InfoWindow chrome. */}
      <style>{INFO_WINDOW_CSS}</style>

      <Map
        mapId={MAP_ID}
        defaultCenter={{ lat: center.lat, lng: center.lng }}
        defaultZoom={14}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        className="h-full w-full"
        onClick={() => onSelect(null)}
      >
        <UserLocationMarker position={center} />

        {places.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            selected={selected?.id === place.id}
            onSelect={onSelect}
          />
        ))}

        {selected && (
          <InfoWindow
            position={selected.location}
            pixelOffset={[0, -38]}
            headerDisabled
            onCloseClick={() => onSelect(null)}
          >
            <PlaceInfoCard place={selected} onClose={() => onSelect(null)} />
          </InfoWindow>
        )}

        <MapControl position={ControlPosition.RIGHT_BOTTOM}>
          <RecenterButton center={center} />
        </MapControl>

        <PanToSelected selected={selected} />
      </Map>
    </APIProvider>
  );
}

/** Smoothly recenters the map on the selected place. */
function PanToSelected({ selected }: { selected: NearbyPlace | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && selected) {
      map.panTo(selected.location);
      if ((map.getZoom() ?? 0) < 15) map.setZoom(15);
    }
  }, [map, selected]);
  return null;
}

function RecenterButton({ center }: { center: Coords }) {
  const map = useMap();
  return (
    <button
      type="button"
      aria-label="Recenter on my location"
      onClick={() => {
        if (!map) return;
        map.panTo({ lat: center.lat, lng: center.lng });
        map.setZoom(14);
      }}
      className="m-3 flex size-11 items-center justify-center rounded-full border border-border/60 bg-card text-primary shadow-lg transition-colors hover:bg-muted"
    >
      <Icon name="my_location" className="text-xl" />
    </button>
  );
}

const INFO_WINDOW_CSS = `
.gm-style .gm-style-iw-c { padding: 0 !important; border-radius: 16px !important; overflow: hidden !important; box-shadow: 0 12px 34px -8px rgba(0,0,0,0.35) !important; }
.gm-style .gm-style-iw-d { overflow: hidden !important; padding: 0 !important; max-height: none !important; }
.gm-style .gm-style-iw-c button.gm-ui-hover-effect { display: none !important; }
.gm-style .gm-style-iw-tc::after { background: var(--card, #fff) !important; }
`;
