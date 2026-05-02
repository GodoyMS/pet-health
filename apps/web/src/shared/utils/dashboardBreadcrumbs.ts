/** Labels for `/dashboard/pets/:petId/<slug>` segments */
export const PET_SECTION_LABELS: Record<string, string> = {
  edit: "Edit",
  "preventive-care": "Preventive Care",
  "health-logs": "Health Logs",
  analytics: "Analytics",
  lifestyle: "Lifestyle",
  "ai-summary": "AI Summary"
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
  /** Last segment — not rendered as a link */
  current?: boolean;
};

export function buildDashboardBreadcrumbs(
  pathname: string,
  opts: { petName?: string | null } = {}
): BreadcrumbItem[] {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const parts = normalized.split("/").filter(Boolean);

  if (parts.length === 0 || (parts.length === 1 && parts[0] === "dashboard")) {
    return [{ label: "Dashboard", current: true }];
  }

  const items: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard" }
  ];

  if (parts[0] === "dashboard" && parts[1] === "pets") {
    items.push({ label: "Pets", href: "/dashboard/pets" });

    if (parts.length === 2) {
      items[items.length - 1] = { label: "Pets", current: true };
      return items;
    }

    const petId = parts[2];
    if (!petId) {
      items[items.length - 1] = { label: "Pets", current: true };
      return items;
    }

    const petLabel = opts.petName?.trim() || "Pet";
    items.push({
      label: petLabel,
      href: `/dashboard/pets/${petId}`
    });

    if (parts.length === 3) {
      items[items.length - 1] = {
        label: petLabel,
        current: true
      };
      return items;
    }

    const tail = parts[3];
    const sectionLabel = PET_SECTION_LABELS[tail] ?? tail;
    items.push({ label: sectionLabel, current: true });
    return items;
  }

  if (parts[0] === "dashboard" && parts[1] === "account") {
    items.push({ label: "Account", current: true });
    return items;
  }

  return [{ label: "Dashboard", href: "/dashboard", current: true }];
}
