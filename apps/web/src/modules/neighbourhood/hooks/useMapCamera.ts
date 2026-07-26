import { useCallback, useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

import { prefersReducedMotion } from "../utils/motion";

export const DEFAULT_TILT = 60;
export const DEFAULT_ZOOM = 17;

interface UseMapCameraArgs {
  /** Point the camera should follow (usually the active pet). */
  target: { lat: number; lng: number } | null;
  /** Changing this re-frames the camera — used when switching pets. */
  focusKey: string | undefined;
}

/**
 * Owns the tilted "companion" camera.
 *
 * Google only honours tilt/heading on vector maps, so every call is guarded:
 * on a raster map (e.g. the DEMO map id) these degrade to a plain pan instead
 * of throwing.
 */
export function useMapCamera({ target, focusKey }: UseMapCameraArgs) {
  const map = useMap();
  const lastFocus = useRef<string | undefined>(undefined);

  const applyTilt = useCallback(
    (tilt: number) => {
      if (!map) return;
      try {
        map.setTilt(tilt);
      } catch {
        // Raster map: tilt unsupported. The view stays flat, which is fine.
      }
    },
    [map]
  );

  /** Re-frame on the target: centre, tilt in, and pick a close zoom. */
  const frameTarget = useCallback(
    (animate = true) => {
      if (!map || !target) return;

      if (animate && !prefersReducedMotion()) {
        map.panTo(target);
      } else {
        map.setCenter(target);
      }

      if ((map.getZoom() ?? 0) < DEFAULT_ZOOM - 2) map.setZoom(DEFAULT_ZOOM);
      applyTilt(DEFAULT_TILT);
    },
    [map, target, applyTilt]
  );

  // Re-frame whenever the active pet changes — but not on every coordinate
  // nudge, or dragging your own pin would fight the camera.
  useEffect(() => {
    if (!map || !target || !focusKey) return;
    if (lastFocus.current === focusKey) return;
    lastFocus.current = focusKey;
    frameTarget(true);
  }, [map, target, focusKey, frameTarget]);

  const rotateBy = useCallback(
    (degrees: number) => {
      if (!map) return;
      try {
        map.setHeading(((map.getHeading() ?? 0) + degrees + 360) % 360);
      } catch {
        // Heading unsupported on raster maps.
      }
    },
    [map]
  );

  const toggleTilt = useCallback(() => {
    if (!map) return;
    const current = map.getTilt() ?? 0;
    applyTilt(current > 5 ? 0 : DEFAULT_TILT);
  }, [map, applyTilt]);

  const resetNorth = useCallback(() => {
    if (!map) return;
    try {
      map.setHeading(0);
    } catch {
      // No-op on raster maps.
    }
  }, [map]);

  return { frameTarget, rotateBy, toggleTilt, resetNorth };
}
