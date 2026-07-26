/** e.g. "15 Mar 2026" — accepts `YYYY-MM-DD` or ISO datetime strings. */
export function formatDueDate(isoDate: string): string {
  const datePart = isoDate.includes("T") ? isoDate.slice(0, 10) : isoDate;
  const d = new Date(`${datePart}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
