export type PetNavItem = {
  /** Route segment after `/dashboard/pets/:id/`; empty string = overview */
  slug: string;
  label: string;
  icon: string;
  description: string;
  premium?: boolean;
};

export const PET_NAV_ITEMS: PetNavItem[] = [
  {
    slug: "",
    label: "Overview",
    icon: "dashboard",
    description: "Summary and quick actions"
  },
  {
    slug: "preventive-care",
    label: "Preventive Care",
    icon: "vaccines",
    description: "Vaccines, deworming, wellness"
  },
  {
    slug: "health-logs",
    label: "Health Logs",
    icon: "assignment",
    description: "Weight, mood, and daily notes"
  },
  {
    slug: "analytics",
    label: "Analytics",
    icon: "monitoring",
    description: "Trends over time"
  },
  {
    slug: "lifestyle",
    label: "Lifestyle",
    icon: "nutrition",
    description: "Exercise, feeding, safety"
  },
  {
    slug: "ai-summary",
    label: "AI Summary",
    icon: "auto_awesome",
    description: "Unified health narrative",
    premium: true
  }
];

export function petNavPath(petId: string, slug: string): string {
  return slug ? `/dashboard/pets/${petId}/${slug}` : `/dashboard/pets/${petId}`;
}
