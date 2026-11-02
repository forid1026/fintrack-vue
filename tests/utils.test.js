import test from 'node:test';
import assert from 'node:assert/strict';

import { sumAmounts, round2, formatMoney } from '../src/utils/money.js';
import {
  todayISO,
  currentMonthKey,
  isValidISODate,
  formatMonthKey,
} from '../src/utils/date.js';
import {
  validateTransactionInput,
  normalizeTransaction,
  normalizeTransactions,
  fingerprint,
} from '../src/utils/validation.js';
import { toCSV, parseCSV, csvToTransactions } from '../src/utils/csv.js';
import { toBackupJSON, parseBackupJSON } from '../src/utils/backup.js';
import { createTransactionStorage } from '../src/utils/storage.js';

const valid = {
  title: '  Salary  ',
  type: 'income',
  category: 'Salary',
  amount: '40000.555',
  date: '2026-10-01',
};

// ── money ────────────────────────────────────────────────
test('sumAmounts avoids floating point drift', () => {
  assert.equal(sumAmounts([{ amount: 0.1 }, { amount: 0.2 }]), 0.3);
  assert.equal(sumAmounts([]), 0);
});

test('round2 rounds to 2 decimals', () => {
  assert.equal(round2('12.345'), 12.35);
  assert.equal(round2(10), 10);
});

test('formatMoney handles sign, symbol and bad input', () => {
  assert.equal(formatMoney(1500, { symbol: '৳' }), '৳ 1,500');
  assert.equal(formatMoney(-1500, { symbol: '৳' }), '-৳ 1,500');
  assert.equal(formatMoney(NaN), '0');
  assert.equal(formatMoney(12.5), '12.5');
});

// ── date ─────────────────────────────────────────────────
test('todayISO uses the local calendar, not UTC', () => {
  // 00:30 local time on Oct 5 must stay Oct 5 whatever the TZ offset is.
  assert.equal(todayISO(new Date(2026, 9, 5, 0, 30)), '2026-10-05');
  assert.equal(currentMonthKey(new Date(2026, 0, 31, 23, 59)), '2026-01');
});

test('isValidISODate rejects impossible dates', () => {
  assert.equal(isValidISODate('2026-02-29'), false);
  assert.equal(isValidISODate('2028-02-29'), true);
  assert.equal(isValidISODate('2026-13-01'), false);
  assert.equal(isValidISODate('26-01-01'), false);
  assert.equal(isValidISODate(''), false);
  assert.equal(isValidISODate(null), false);
});

test('formatMonthKey', () => {
  assert.equal(formatMonthKey('2026-10', 'en-US'), 'October 2026');
});

// ── validation ───────────────────────────────────────────
test('validateTransactionInput cleans valid input', () => {
  const result = validateTransactionInput(valid);
  assert.equal(result.valid, true);
  assert.equal(result.value.title, 'Salary');
  assert.equal(result.value.amount, 40000.56);
});

test('validateTransactionInput reports every field error', () => {
  const result = validateTransactionInput({
    title: ' ',
    type: '',
    category: '',
    amount: '',
    date: 'nope',
  });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    'amount',
    'date',
    'title',
    'type',
  ]);
});

test('category must belong to the selected type', () => {
  const result = validateTransactionInput({ ...valid, category: 'Groceries' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.category);
});

test('amount must be positive, finite and bounded', () => {
  for (const amount of [0, -5, 'abc', Infinity, 1e12]) {
    assert.equal(validateTransactionInput({ ...valid, amount }).valid, false);
  }
  assert.equal(validateTransactionInput({ ...valid, amount: 0.01 }).valid, true);
});

test('normalizeTransaction salvages legacy records', () => {
  const legacy = {
    id: 1700000000000,
    title: 'Rent',
    category: 'Weird',
    amount: 5000,
    type: 'expense',
    date: '2026-09-21',
  };
  const out = normalizeTransaction(legacy);
  assert.equal(out.id, 1700000000000);
  assert.equal(out.category, 'Other');
});

test('normalizeTransactions drops junk and fixes duplicate ids', () => {
  const base = { title: 'A', category: 'Other', amount: 1, type: 'expense', date: '2026-01-01' };
  const { items, dropped } = normalizeTransactions([
    { ...base, id: 'x' },
    { ...base, id: 'x' },
    null,
    { ...base, amount: -1, id: 'y' },
    'text',
  ]);
  assert.equal(items.length, 2);
  assert.equal(dropped, 3);
  assert.notEqual(items[0].id, items[1].id);
});

test('fingerprint is case-insensitive on title', () => {
  const a = { title: 'Lunch', type: 'expense', category: 'Restaurants', amount: 10, date: '2026-01-01' };
  assert.equal(fingerprint(a), fingerprint({ ...a, title: 'LUNCH' }));
});

// ── csv ──────────────────────────────────────────────────
test('CSV export/import round trip incl. quotes, commas and newlines', () => {
  const items = [
    { id: '1', title: 'Dinner, "family"\nnight', category: 'Restaurants', type: 'expense', amount: 1250.5, date: '2026-10-02' },
    { id: '2', title: 'বেতন', category: 'Salary', type: 'income', amount: 40000, date: '2026-10-01' },
  ];
  const csv = toCSV(items);
  assert.ok(csv.startsWith('﻿'));
  const back = csvToTransactions(csv);
  assert.equal(back.dropped, 0);
  assert.equal(back.items.length, 2);
  assert.equal(back.items[0].title, 'Dinner, "family"\nnight');
  assert.equal(back.items[0].amount, 1250.5);
  assert.equal(back.items[1].title, 'বেতন');
});

test('CSV export neutralises formula injection and import restores it', () => {
  const csv = toCSV([
    { id: '1', title: '=HYPERLINK("http://evil")', category: 'Other', type: 'expense', amount: 1, date: '2026-01-01' },
  ]);
  assert.ok(csv.includes("'=HYPERLINK"));
  const { items } = csvToTransactions(csv);
  assert.equal(items[0].title, '=HYPERLINK("http://evil")');
});

test('CSV import rejects files with missing columns and drops bad rows', () => {
  assert.throws(() => csvToTransactions('a,b\n1,2'), /columns/);
  const { items, dropped } = csvToTransactions(
    'Title,Category,Type,Amount,Date\nOk,Other,expense,"1,200",2026-01-01\nBad,Other,expense,-5,2026-01-01\nBad2,Other,transfer,5,2026-01-01',
  );
  assert.equal(items.length, 1);
  assert.equal(items[0].amount, 1200);
  assert.equal(dropped, 2);
});

test('parseCSV handles CRLF and blank lines', () => {
  assert.deepEqual(parseCSV('a,b\r\n\r\n1,2\r\n'), [['a', 'b'], ['1', '2']]);
});

// ── backup ───────────────────────────────────────────────
test('JSON backup round trip and bare array support', () => {
  const items = [{ id: 'a', title: 'T', category: 'Other', type: 'income', amount: 5, date: '2026-01-01' }];
  const json = toBackupJSON(items, new Date('2026-10-28T00:00:00Z'));
  assert.equal(parseBackupJSON(json).items.length, 1);
  assert.equal(parseBackupJSON(JSON.stringify(items)).items.length, 1);
  assert.throws(() => parseBackupJSON('not json'), /valid JSON/);
  assert.throws(() => parseBackupJSON('{"a":1}'), /No transactions/);
});

// ── storage ──────────────────────────────────────────────
function memoryBackend(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

test('storage: empty, save and load', () => {
  const backend = memoryBackend();
  const storage = createTransactionStorage('k', backend);
  assert.deepEqual(storage.load(), { items: [], status: 'ok', dropped: 0 });
  const item = { id: 'a', title: 'T', category: 'Other', type: 'income', amount: 5, date: '2026-01-01' };
  assert.equal(storage.save([item]).ok, true);
  assert.equal(storage.load().items.length, 1);
});

test('storage: corrupted data is preserved in a backup key', () => {
  const backend = memoryBackend({ k: '{broken' });
  const result = createTransactionStorage('k', backend).load();
  assert.equal(result.status, 'corrupt');
  assert.equal(backend.data.k__corrupt, '{broken');
});

test('storage: quota and unavailable errors never throw', () => {
  const quota = {
    getItem: () => null,
    setItem: () => {
      const e = new Error('full');
      e.name = 'QuotaExceededError';
      throw e;
    },
  };
  assert.deepEqual(createTransactionStorage('k', quota).save([]), { ok: false, reason: 'quota' });

  const broken = {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('denied');
    },
  };
  assert.equal(createTransactionStorage('k', broken).load().status, 'unavailable');
  assert.equal(createTransactionStorage('k', broken).save([]).ok, false);
});
