/** Local calendar date as YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

export function daysUntil(day: string): number {
  return Math.round((new Date(day).getTime() - new Date(dayKey()).getTime()) / 864e5);
}

export function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
