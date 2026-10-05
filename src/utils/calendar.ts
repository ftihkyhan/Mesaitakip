export const MONTH_NAMES_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export interface CalendarMonthData {
  year: number;
  monthIndex: number; // 0 - 11
  monthName: string;
  totalDays: number;
  firstDayWeekday: number; // 0: Mon, 1: Tue, ..., 6: Sun
  prevDays: number[];
  currentDays: number[];
  nextDays: number[];
}

export function getCurrentMonthString(): string {
  const now = new Date();
  return `${MONTH_NAMES_TR[now.getMonth()]} ${now.getFullYear()}`;
}

export function parseMonthString(monthStr: string): { year: number; monthIndex: number } {
  const now = new Date();
  if (!monthStr || typeof monthStr !== 'string') {
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  }

  const parts = monthStr.trim().split(' ');
  const monthName = parts[0];
  const year = parts[1] ? parseInt(parts[1], 10) : now.getFullYear();
  const monthIndex = MONTH_NAMES_TR.findIndex(
    (m) => m.toLowerCase() === monthName?.toLowerCase()
  );

  return {
    year: isNaN(year) ? now.getFullYear() : year,
    monthIndex: monthIndex >= 0 ? monthIndex : now.getMonth(),
  };
}

export function formatMonthString(year: number, monthIndex: number): string {
  return `${MONTH_NAMES_TR[monthIndex]} ${year}`;
}

export function getCalendarGrid(year: number, monthIndex: number): CalendarMonthData {
  const firstDate = new Date(year, monthIndex, 1);
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  // JavaScript getDay() returns 0 for Sunday, 1 for Monday...
  // Turkish calendar starts on Monday (0: Mon ... 6: Sun)
  const rawDay = firstDate.getDay();
  const firstDayWeekday = (rawDay + 6) % 7;

  // Previous month trailing days
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();
  const prevDays: number[] = [];
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    prevDays.push(prevMonthTotalDays - i);
  }

  // Current month days
  const currentDays: number[] = [];
  for (let i = 1; i <= totalDays; i++) {
    currentDays.push(i);
  }

  // Next month leading days to complete full weeks
  const totalCells = prevDays.length + currentDays.length;
  const targetCells = totalCells <= 35 ? 35 : 42;
  const remaining = targetCells - totalCells;
  const nextDays: number[] = [];
  for (let i = 1; i <= remaining; i++) {
    nextDays.push(i);
  }

  return {
    year,
    monthIndex,
    monthName: MONTH_NAMES_TR[monthIndex],
    totalDays,
    firstDayWeekday,
    prevDays,
    currentDays,
    nextDays,
  };
}

export function doesRecordMatchMonth(recordDate: string, year: number, monthIndex: number): boolean {
  try {
    const parts = recordDate.split('-');
    if (parts.length < 2) return false;
    const rYear = parseInt(parts[0], 10);
    const rMonth = parseInt(parts[1], 10) - 1;
    return rYear === year && rMonth === monthIndex;
  } catch {
    return false;
  }
}
