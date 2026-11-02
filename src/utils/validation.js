import { CATEGORIES_BY_TYPE, TYPES } from '../constants/categories.js';
import { createId } from './id.js';
import { isValidISODate } from './date.js';
import { round2 } from './money.js';

export const MAX_TITLE_LENGTH = 80;
export const MAX_AMOUNT = 999999999.99;

/**
 * Validate form input. Returns { valid, errors, value }.
 * `value` is the cleaned object (only meaningful when valid).
 */
export function validateTransactionInput(input) {
  const errors = {};

  const title = String(input?.title ?? '').trim();
  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  const type = input?.type;
  if (!TYPES.includes(type)) {
    errors.type = 'Select a type.';
  }

  const category = input?.category;
  if (!errors.type && !CATEGORIES_BY_TYPE[type].includes(category)) {
    errors.category = 'Select a category.';
  }

  const rawAmount = input?.amount;
  const amount = Number(rawAmount);
  if (rawAmount === '' || rawAmount === null || rawAmount === undefined) {
    errors.amount = 'Amount is required.';
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0.';
  } else if (amount > MAX_AMOUNT) {
    errors.amount = 'Amount is too large.';
  }

  if (!isValidISODate(input?.date)) {
    errors.date = 'Enter a valid date.';
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    value: valid
      ? { title, type, category, amount: round2(amount), date: input.date }
      : null,
  };
}

/**
 * Clean an untrusted record (localStorage / imported file).
 * Returns a safe transaction or null if it cannot be salvaged.
 */
export function normalizeTransaction(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const type = raw.type;
  if (!TYPES.includes(type)) {
    return null;
  }

  const amount = Number(raw.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    return null;
  }

  if (!isValidISODate(raw.date)) {
    return null;
  }

  const title = String(raw.title ?? '').trim().slice(0, MAX_TITLE_LENGTH);
  if (!title) {
    return null;
  }

  const category = CATEGORIES_BY_TYPE[type].includes(raw.category)
    ? raw.category
    : 'Other';

  const hasId =
    (typeof raw.id === 'string' && raw.id.length > 0) ||
    (typeof raw.id === 'number' && Number.isFinite(raw.id));

  return {
    id: hasId ? raw.id : createId(),
    title,
    type,
    category,
    amount: round2(amount),
    date: raw.date,
  };
}

/** Normalize a list, dropping invalid rows and making ids unique. */
export function normalizeTransactions(list) {
  if (!Array.isArray(list)) {
    return { items: [], dropped: 0 };
  }

  const seen = new Set();
  const items = [];
  let dropped = 0;

  for (const raw of list) {
    const item = normalizeTransaction(raw);
    if (!item) {
      dropped += 1;
      continue;
    }
    if (seen.has(item.id)) {
      item.id = createId();
    }
    seen.add(item.id);
    items.push(item);
  }

  return { items, dropped };
}

/** Key used to detect duplicates when importing. */
export function fingerprint(item) {
  return [
    item.date,
    item.type,
    item.category,
    Number(item.amount).toFixed(2),
    item.title.toLowerCase(),
  ].join('|');
}
