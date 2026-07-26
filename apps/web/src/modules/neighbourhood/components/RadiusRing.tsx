import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface RadiusRingProps {
  center: { lat: number; lng: number };
  radiusMeters: number;
  color: string;
}

/**
 * Translucent circle marking the search radius, so "who counts as nearby" is
 * visible rather than implied. Drawn with the Maps Circle overlay (not a DOM
 * element) so it stays glued to the ground plane when the camera tilts.
 */
export function RadiusRing({ center, radiusMeters, color }: RadiusRingProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusMeters,
      strokeColor: color,
      strokeOpacity: 0.55,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.07,
      clickable: false,
      zIndex: 1
    });
    circleRef.current = circle;

    return () => {
      circle.setMap(null);
      circleRef.current = null;
    };
  }, [map]);

  // Update in place rather than recreating, so the ring animates smoothly
  // instead of blinking when the pet moves or the radius changes.
  useEffect(() => {
    circleRef.current?.setCenter(center);
  }, [center.lat, center.lng]);

  useEffect(() => {
    circleRef.current?.setRadius(radiusMeters);
  }, [radiusMeters]);

  useEffect(() => {
    circleRef.current?.setOptions({ strokeColor: color, fillColor: color });
  }, [color]);

  return null;
}
