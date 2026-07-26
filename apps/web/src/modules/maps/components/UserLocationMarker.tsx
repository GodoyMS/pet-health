import { AdvancedMarker } from "@vis.gl/react-google-maps";

import type { Coords } from "@shared/maps";

/** A pulsing blue dot marking the user's live position. */
export function UserLocationMarker({ position }: { position: Coords }) {
  return (
    <AdvancedMarker
      position={{ lat: position.lat, lng: position.lng }}
      zIndex={500}
      title="You are here"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute size-10 rounded-full bg-blue-500/20 motion-safe:animate-ping" />
        <span className="size-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
      </div>
    </AdvancedMarker>
  );
}
