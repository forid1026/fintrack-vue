import { CURRENCY_SYMBOL, LOCALE } from '../config.js';
import { formatMoney } from './money.js';
import {
  formatDate as formatDateRaw,
  formatMonthKey as formatMonthKeyRaw,
} from './date.js';

export const money = (value) =>
  formatMoney(value, { locale: LOCALE, symbol: CURRENCY_SYMBOL });

export const formatDate = (isoDate) => formatDateRaw(isoDate, LOCALE);

export const formatMonth = (key) => formatMonthKeyRaw(key, LOCALE);
