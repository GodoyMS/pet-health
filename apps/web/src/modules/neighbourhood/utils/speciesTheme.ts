/**
 * Stable colour + icon per species.
 *
 * Species are database rows, not a fixed enum, so known species get a hand-
 * picked identity and anything else falls back to a hash-derived hue. That
 * keeps an unseeded or newly added species looking deliberate instead of grey.
 */
export interface SpeciesTheme {
  /** Marker fill / halo colour. */
  color: string;
  /** Material Symbols glyph used when the species has no image. */
  icon: string;
}

const KNOWN: Record<string, SpeciesTheme> = {
  dog: { color: "#f59e0b", icon: "sound_detection_dog_barking" },
  cat: { color: "#8b5cf6", icon: "pets" },
  bird: { color: "#06b6d4", icon: "raven" },
  parrot: { color: "#06b6d4", icon: "raven" },
  rabbit: { color: "#ec4899", icon: "cruelty_free" },
  hamster: { color: "#f97316", icon: "cruelty_free" },
  fish: { color: "#0ea5e9", icon: "phishing" },
  turtle: { color: "#10b981", icon: "pets" },
  reptile: { color: "#84cc16", icon: "pets" },
  horse: { color: "#a16207", icon: "pets" }
};

/** Evenly spaced, saturated hues for species outside the known set. */
const FALLBACK_HUES = [340, 24, 48, 96, 168, 200, 260, 300];

export function speciesTheme(species: { id: string; name: string }): SpeciesTheme {
  const key = species.name.trim().toLowerCase();
  const known = KNOWN[key];
  if (known) return known;

  let hash = 0;
  for (let i = 0; i < species.id.length; i++) {
    hash = (hash * 31 + species.id.charCodeAt(i)) >>> 0;
  }
  const hue = FALLBACK_HUES[hash % FALLBACK_HUES.length];
  return { color: `hsl(${hue} 72% 52%)`, icon: "pets" };
}
