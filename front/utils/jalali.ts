import * as jalaali from 'jalaali-js';

export function toJalali(date: Date): string {
  const j = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}

export function jalaliToGregorian(jalaliStr: string): Date {
  const [y, m, d] = jalaliStr.split('/').map(Number);
  const g = jalaali.toGregorian(y, m, d);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function addJalaliDays(jalaliStr: string, days: number): string {
  const date = jalaliToGregorian(jalaliStr);
  date.setDate(date.getDate() + days);
  return toJalali(date);
}

export function getWeekDates(startDate: string): string[] {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addJalaliDays(startDate, i));
  }
  return dates;
}

const persianWeekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

export function getPersianWeekday(jalaliStr: string): string {
  const date = jalaliToGregorian(jalaliStr);
  return persianWeekdays[date.getDay()];
}

export function todayJalali(): string {
  return toJalali(new Date());
}

export function isValidJalali(str: string): boolean {
  try {
    const [y, m, d] = str.split('/').map(Number);
    if (!y || !m || !d) return false;
    return jalaali.isValidJalaaliDate(y, m, d);
  } catch {
    return false;
  }
}

export function normalizePersianDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
}
