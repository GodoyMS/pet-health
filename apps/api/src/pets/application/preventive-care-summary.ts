/** Pure preventive-care stats from schedule items (shared logic with frontend). */

export interface PreventiveCareItemLike {
  dueDate: string;
  completedAt: string | null;
}

export interface PreventiveCareSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export function summarizePreventiveCareItems(
  items: PreventiveCareItemLike[],
  today = new Date().toISOString().slice(0, 10)
): PreventiveCareSummary {
  const completed = items.filter((i) => i.completedAt).length;
  const overdue = items.filter((i) => !i.completedAt && i.dueDate < today).length;
  return {
    total: items.length,
    completed,
    pending: items.length - completed,
    overdue
  };
}

export function findNextDueItem(
  items: PreventiveCareItemLike[],
  today = new Date().toISOString().slice(0, 10)
): { dueDate: string } | null {
  const pending = items
    .filter((i) => !i.completedAt && i.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return pending[0] ? { dueDate: pending[0].dueDate } : null;
}
