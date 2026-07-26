export function getAwarenessScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Needs Attention";
  return "Critical";
}

export function getAwarenessScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function getAwarenessScoreRingColor(score: number): string {
  if (score >= 75) return "stroke-emerald-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-rose-500";
}

export function formatReportDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}
