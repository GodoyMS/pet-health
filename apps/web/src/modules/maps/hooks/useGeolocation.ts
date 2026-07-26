import { useCallback, useEffect, useRef, useState } from "react";

export type GeoStatus =
  | "idle" // not yet requested
  | "prompting" // waiting for the first fix / permission decision
  | "granted" // live position streaming
  | "denied" // user blocked location
  | "unavailable"; // no geolocation support or hard error

export interface Coords {
  lat: number;
  lng: number;
  accuracy: number | null;
}

export interface GeolocationState {
  status: GeoStatus;
  coords: Coords | null;
  error: string | null;
  /** Begin watching the user's live position. */
  request: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 10_000
};

/**
 * Live geolocation via `watchPosition`. Nothing is requested until `request()`
 * is called, so the user always opts in explicitly. Once granted, the position
 * keeps updating (live mode) until the component unmounts.
 */
export function useGeolocation(): GeolocationState {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  const clearWatch = useCallback(() => {
    if (watchId.current != null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      setError("Your browser doesn't support location services.");
      return;
    }

    setStatus("prompting");
    setError(null);
    clearWatch();

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null
        });
        setStatus("granted");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Location permission was denied. Enable it to see nearby care.");
        } else {
          setStatus("unavailable");
          setError(
            err.code === err.TIMEOUT
              ? "Timed out getting your location. Try again."
              : "We couldn't determine your location."
          );
        }
        clearWatch();
      },
      GEO_OPTIONS
    );
  }, [clearWatch]);

  useEffect(() => clearWatch, [clearWatch]);

  return { status, coords, error, request };
}
