// Money helpers. Sums are done in integer cents to avoid floating point drift
// (e.g. 0.1 + 0.2 !== 0.3).

export const toCents = (value) => Math.round(Number(value) * 100);

export const round2 = (value) => toCents(value) / 100;

export function sumAmounts(items) {
  const cents = items.reduce((total, item) => total + toCents(item.amount), 0);
  return cents / 100;
}

const formatterCache = new Map();

function getFormatter(locale) {
  if (!formatterCache.has(locale)) {
    formatterCache.set(
      locale,
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    );
  }
  return formatterCache.get(locale);
}

/** formatNumber(1234.5, 'en-US') -> "1,234.5" */
export function formatNumber(value, locale = 'en-US') {
  const number = Number(value);
  return getFormatter(locale).format(Number.isFinite(number) ? number : 0);
}

/** formatMoney(-1500, { symbol: '৳' }) -> "-৳ 1,500" */
export function formatMoney(value, { locale = 'en-US', symbol = '' } = {}) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  const sign = number < 0 ? '-' : '';
  const body = getFormatter(locale).format(Math.abs(number));
  return symbol ? `${sign}${symbol} ${body}` : `${sign}${body}`;
}
