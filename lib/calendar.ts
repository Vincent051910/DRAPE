const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function formatMonthTitle(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatDayTitle(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function weekdayLabels(): readonly string[] {
  return WEEKDAYS;
}

export type CalendarCell = {
  dateKey: string | null;
  day: number | null;
  inMonth: boolean;
};

/** Sunday-start month grid including leading/trailing empty cells. */
export function buildMonthGrid(month: Date): CalendarCell[] {
  const start = startOfMonth(month);
  const total = daysInMonth(month);
  const lead = start.getDay(); // 0 = Sun
  const cells: CalendarCell[] = [];

  for (let i = 0; i < lead; i++) {
    cells.push({ dateKey: null, day: null, inMonth: false });
  }

  for (let day = 1; day <= total; day++) {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    cells.push({ dateKey: toDateKey(d), day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ dateKey: null, day: null, inMonth: false });
  }

  return cells;
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey(new Date());
}
