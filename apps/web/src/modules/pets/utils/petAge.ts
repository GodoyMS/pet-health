/** Birth date as YYYY-MM-DD */
export function computeAgeLabel(birthDate: string): string {
  const birth = new Date(birthDate + "T12:00:00");
  if (Number.isNaN(birth.getTime())) return "—";
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "—";
  if (years === 0) {
    return months <= 0 ? "Under 1 mo" : `${months} mo`;
  }
  if (months === 0) return `${years} yr`;
  return `${years} yr, ${months} mo`;
}

export function inferLifeStageLabel(ageYears: number): string {
  if (ageYears < 0.5) return "Young";
  if (ageYears < 2) return "Juvenile";
  if (ageYears < 8) return "Adult";
  return "Senior";
}

/** Approximate decimal age for staging rules */
export function computeAgeYearsDecimal(birthDate: string): number {
  const birth = new Date(birthDate + "T12:00:00");
  if (Number.isNaN(birth.getTime())) return -1;
  const now = new Date();
  const ms = now.getTime() - birth.getTime();
  return ms / (365.25 * 24 * 60 * 60 * 1000);
}
