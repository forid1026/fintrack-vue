import { normalizeTransactions } from './validation.js';

export const BACKUP_VERSION = 1;

export function toBackupJSON(transactions, now = new Date()) {
  return JSON.stringify(
    {
      app: 'fintrack',
      version: BACKUP_VERSION,
      exportedAt: now.toISOString(),
      transactions,
    },
    null,
    2,
  );
}

/** Accepts either a FinTrack backup object or a bare array. */
export function parseBackupJSON(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  const list = Array.isArray(data) ? data : data?.transactions;
  if (!Array.isArray(list)) {
    throw new Error('No transactions found in this file.');
  }

  return normalizeTransactions(list);
}
