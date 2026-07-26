import { Icon } from "@repo/ui";

import type { NearbyPlace } from "../api/nearbyPlacesApi";
import { usePlacePhoto } from "../hooks/usePlacePhoto";
import { CATEGORY_META, formatDistance, priceLevelToDollars } from "../utils/placeMeta";

interface PlaceInfoCardProps {
  place: NearbyPlace;
  onClose?: () => void;
}

function directionsUrl(place: NearbyPlace): string {
  if (place.googleMapsUri) return place.googleMapsUri;
  const { lat, lng } = place.location;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Rich detail card for a single place — used inside the map popup. */
export function PlaceInfoCard({ place, onClose }: PlaceInfoCardProps) {
  const meta = CATEGORY_META[place.category];
  const { data: photoUrl, isLoading: photoLoading } = usePlacePhoto(place.photoRef, true);
  const distance = formatDistance(place.distanceMeters);
  const price = priceLevelToDollars(place.priceLevel);
  const closedPermanently = place.businessStatus === "CLOSED_PERMANENTLY";

  return (
    <div className="w-76 max-w-[85vw] overflow-hidden text-foreground">
      {/* Photo / gradient header */}
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {place.photoRef && photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `${meta.color}14` }}
          >
            <span style={{ color: meta.color }}>
              <Icon
                name={meta.icon}
                className={`text-4xl ${photoLoading && place.photoRef ? "animate-pulse" : ""}`}
              />
            </span>
          </div>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65"
          >
            <Icon name="close" className="text-base" />
          </button>
        )}

        <span
          className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: meta.color }}
        >
          <Icon name={meta.icon} className="text-[13px]" />
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-3.5">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight">{place.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {place.rating != null && (
              <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                <Icon name="star" variant="filled" className="text-sm" />
                <span className="text-foreground">{place.rating.toFixed(1)}</span>
                {place.userRatingCount != null && (
                  <span className="text-muted-foreground">({place.userRatingCount})</span>
                )}
              </span>
            )}
            {distance && (
              <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                <Icon name="near_me" className="text-sm" />
                {distance}
              </span>
            )}
            {price && <span className="text-muted-foreground">{price}</span>}
          </div>
        </div>

        {/* Status */}
        {closedPermanently ? (
          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <Icon name="block" className="text-sm" /> Permanently closed
          </span>
        ) : place.openNow != null ? (
          <span
            className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
              place.openNow
                ? "bg-emerald-500/12 text-emerald-600"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Icon name={place.openNow ? "schedule" : "schedule"} className="text-sm" />
            {place.openNow ? "Open now" : "Closed now"}
          </span>
        ) : null}

        {place.address && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Icon name="location_on" className="mt-px shrink-0 text-sm" />
            <span>{place.address}</span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-1 grid grid-cols-3 gap-1.5">
          <a
            href={directionsUrl(place)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex flex-col items-center gap-1 rounded-lg bg-primary/8 py-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Icon name="directions" className="text-lg" />
            Directions
          </a>
          <a
            href={place.phone ? `tel:${place.phone.replace(/\s+/g, "")}` : undefined}
            aria-disabled={!place.phone}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors ${
              place.phone
                ? "bg-muted text-foreground hover:bg-muted/70"
                : "pointer-events-none bg-muted/40 text-muted-foreground/50"
            }`}
          >
            <Icon name="call" className="text-lg" />
            Call
          </a>
          <a
            href={place.websiteUri ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            aria-disabled={!place.websiteUri}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors ${
              place.websiteUri
                ? "bg-muted text-foreground hover:bg-muted/70"
                : "pointer-events-none bg-muted/40 text-muted-foreground/50"
            }`}
          >
            <Icon name="language" className="text-lg" />
            Website
          </a>
        </div>
      </div>
    </div>
  );
}
