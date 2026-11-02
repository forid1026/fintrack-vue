// Dates are stored as plain "YYYY-MM-DD" strings in the user's LOCAL calendar.
// We never go through toISOString() (that returns UTC and can show
// "yesterday" for users east of UTC, e.g. Bangladesh before 6 AM).

const pad = (n) => String(n).padStart(2, '0');

export function todayISO(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentMonthKey(date = new Date()) {
  return todayISO(date).slice(0, 7);
}

export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1970 || year > 2100) {
    return false;
  }
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export const monthKeyOf = (isoDate) => isoDate.slice(0, 7);
export const yearOf = (isoDate) => Number(isoDate.slice(0, 4));
export const monthIndexOf = (isoDate) => Number(isoDate.slice(5, 7)) - 1;

export function formatDate(isoDate, locale = 'en-US') {
  if (!isValidISODate(isoDate)) {
    return '';
  }
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthKey(key, locale = 'en-US') {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}
