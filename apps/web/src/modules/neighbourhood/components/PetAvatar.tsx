import { Icon } from "@repo/ui";

import type { SpeciesSummary } from "../api/neighbourhoodApi";
import { speciesTheme } from "../utils/speciesTheme";

interface PetAvatarProps {
  species: SpeciesSummary;
  name: string;
  /** Pixel diameter. */
  size?: number;
  className?: string;
}

/**
 * Circular species portrait, falling back to a themed glyph when the species
 * has no image. Used by markers, popovers, tabs, and request cards so a pet
 * looks the same everywhere it appears.
 */
export function PetAvatar({
  species,
  name,
  size = 40,
  className = ""
}: PetAvatarProps) {
  const theme = speciesTheme(species);

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `color-mix(in srgb, ${theme.color} 22%, transparent)`
      }}
    >
      {species.imageUrl ? (
        <img
          src={species.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon
          name={theme.icon}
          style={{ color: theme.color, fontSize: size * 0.55 }}
          aria-hidden
        />
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
