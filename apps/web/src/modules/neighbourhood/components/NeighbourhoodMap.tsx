import {
  APIProvider,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl
} from "@vis.gl/react-google-maps";
import { INFO_WINDOW_CSS } from "@shared/maps";

import type { MyNeighbourhoodPet, NearbyPet } from "../api/neighbourhoodApi";
import { DEFAULT_TILT, DEFAULT_ZOOM, useMapCamera } from "../hooks/useMapCamera";
import { speciesTheme } from "../utils/speciesTheme";
import { ActivePetMarker } from "./ActivePetMarker";
import { CameraControls } from "./CameraControls";
import { NearbyPetMarker } from "./NearbyPetMarker";
import { NearbyPetPopover } from "./NearbyPetPopover";
import { PackPetMarker } from "./PackPetMarker";
import { RadiusRing } from "./RadiusRing";

const MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_NEIGHBOURHOOD_MAP_ID as string | undefined) ||
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ||
  "DEMO_MAP_ID";

interface NeighbourhoodMapProps {
  apiKey: string;
  activePet: MyNeighbourhoodPet;
  activePosition: { lat: number; lng: number };
  packPets: MyNeighbourhoodPet[];
  nearbyPets: NearbyPet[];
  radiusMeters: number;
  ownerName: string;
  selected: NearbyPet | null;
  isPlacing: boolean;
  isBusy: boolean;
  onSelect: (pet: NearbyPet | null) => void;
  onSwitchPet: (petId: string) => void;
  onMovePet: (position: { lat: number; lng: number }) => void;
  onSendRequest: (pet: NearbyPet) => void;
  onCancelRequest: (friendshipId: string) => void;
  onRespond: (friendshipId: string, action: "accept" | "reject") => void;
  onUnfriend: (friendshipId: string) => void;
}

export function NeighbourhoodMap(props: NeighbourhoodMapProps) {
  const { apiKey, activePosition, isPlacing, onMovePet, onSelect } = props;

  return (
    <APIProvider apiKey={apiKey}>
      <style>{INFO_WINDOW_CSS}</style>
      <style>{MARKER_CSS}</style>

      <Map
        mapId={MAP_ID}
        defaultCenter={activePosition}
        defaultZoom={DEFAULT_ZOOM}
        defaultTilt={DEFAULT_TILT}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        // Vector rendering is what makes tilt/heading (the 3D read) possible.
        renderingType={"VECTOR" as google.maps.RenderingType}
        className={`h-full w-full ${isPlacing ? "cursor-crosshair" : ""}`}
        onClick={(event) => {
          if (isPlacing) {
            const lat = event.detail.latLng?.lat;
            const lng = event.detail.latLng?.lng;
            if (lat != null && lng != null) onMovePet({ lat, lng });
            return;
          }
          onSelect(null);
        }}
      >
        <MapContents {...props} />
      </Map>
    </APIProvider>
  );
}

/** Inside <Map> so `useMap()` (via useMapCamera) resolves to this instance. */
function MapContents({
  activePet,
  activePosition,
  packPets,
  nearbyPets,
  radiusMeters,
  ownerName,
  selected,
  isPlacing,
  isBusy,
  onSelect,
  onSwitchPet,
  onMovePet,
  onSendRequest,
  onCancelRequest,
  onRespond,
  onUnfriend
}: NeighbourhoodMapProps) {
  const camera = useMapCamera({
    target: activePosition,
    focusKey: activePet.id
  });

  const theme = speciesTheme(activePet.species);

  return (
    <>
      <RadiusRing
        center={activePosition}
        radiusMeters={radiusMeters}
        color={theme.color}
      />

      {packPets.map((pet) => (
        <PackPetMarker key={pet.id} pet={pet} onSelect={onSwitchPet} />
      ))}

      {nearbyPets.map((pet) => (
        <NearbyPetMarker
          key={pet.id}
          pet={pet}
          selected={selected?.id === pet.id}
          onSelect={onSelect}
        />
      ))}

      <ActivePetMarker
        pet={activePet}
        position={activePosition}
        ownerName={ownerName}
        isFollowingOwner={activePet.location?.source === "inherited"}
        draggable={!isPlacing}
        onDragEnd={onMovePet}
      />

      {selected && (
        <InfoWindow
          position={selected.location}
          pixelOffset={[0, -44]}
          headerDisabled
          onCloseClick={() => onSelect(null)}
        >
          <NearbyPetPopover
            pet={selected}
            activePet={activePet}
            isBusy={isBusy}
            onClose={() => onSelect(null)}
            onSendRequest={() => onSendRequest(selected)}
            onCancelRequest={onCancelRequest}
            onRespond={onRespond}
            onUnfriend={onUnfriend}
          />
        </InfoWindow>
      )}

      <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <CameraControls
          onRecenter={() => camera.frameTarget(true)}
          onRotateLeft={() => camera.rotateBy(-45)}
          onRotateRight={() => camera.rotateBy(45)}
          onToggleTilt={camera.toggleTilt}
          onResetNorth={camera.resetNorth}
        />
      </MapControl>
    </>
  );
}

/**
 * Marker motion. Kept as a plain stylesheet (rather than Tailwind utilities)
 * because these run inside Google's marker DOM, and every animation is
 * disabled under `prefers-reduced-motion`.
 */
const MARKER_CSS = `
@keyframes nb-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes nb-pulse { 0% { transform: scale(.85); opacity: .65; } 70% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1.5); opacity: 0; } }
@keyframes nb-shadow { 0%,100% { transform: scaleX(1); opacity: .35; } 50% { transform: scaleX(.82); opacity: .22; } }
.nb-bob { animation: nb-bob 2.4s ease-in-out infinite; }
.nb-pulse { animation: nb-pulse 2.8s cubic-bezier(0,0,.2,1) infinite; }
.nb-ground-shadow { animation: nb-shadow 2.4s ease-in-out infinite; }
.nb-marker { will-change: transform; }
@media (prefers-reduced-motion: reduce) {
  .nb-bob, .nb-pulse, .nb-ground-shadow { animation: none !important; }
}
`;
