import type { PreventiveCareScheduleItem } from "../../api/preventiveCareApi";

export type PreventiveCareItemStats = {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
};

function toIsoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getPreventiveCareItemStats(
  items: PreventiveCareScheduleItem[]
): PreventiveCareItemStats {
  const today = toIsoToday();
  const completed = items.filter((item) => item.completedAt).length;
  const overdue = items.filter(
    (item) => !item.completedAt && item.dueDate < today
  ).length;

  return {
    total: items.length,
    completed,
    pending: items.length - completed,
    overdue
  };
}
