import { CATEGORIES_BY_TYPE } from '../constants/categories.js';
import { normalizeTransaction } from './validation.js';

const HEADERS = ['Title', 'Category', 'Type', 'Amount', 'Date'];

// Cells starting with these characters can be executed as formulas by Excel /
// Sheets (CSV injection). We prefix them with an apostrophe on export and strip
// it again on import.
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value) {
  let text = String(value ?? '');
  if (FORMULA_START.test(text)) {
    text = `'${text}`;
  }
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCSV(transactions) {
  const lines = [HEADERS.join(',')];
  for (const t of transactions) {
    lines.push(
      [
        escapeCell(t.title),
        escapeCell(t.category),
        t.type,
        Number(t.amount).toFixed(2),
        t.date,
      ].join(','),
    );
  }
  // BOM so Excel opens UTF-8 (Bangla etc.) correctly; CRLF per RFC 4180.
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** Minimal RFC 4180 parser (quotes, escaped quotes, CRLF/LF, embedded newlines). */
export function parseCSV(text) {
  const input = String(text ?? '').replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') {
        i += 1;
      }
      row.push(cell);
      cell = '';
      rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }

  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const unescapeFormula = (text) =>
  /^'[=+\-@\t\r]/.test(text) ? text.slice(1) : text;

/** Convert CSV text to clean transactions. Returns { items, dropped }. */
export function csvToTransactions(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) {
    return { items: [], dropped: 0 };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name);
  const idx = {
    title: col('title'),
    category: col('category'),
    type: col('type'),
    amount: col('amount'),
    date: col('date'),
  };

  if (Object.values(idx).some((i) => i === -1)) {
    throw new Error(
      'CSV must have these columns: Title, Category, Type, Amount, Date.',
    );
  }

  const items = [];
  let dropped = 0;

  for (const row of rows.slice(1)) {
    const type = (row[idx.type] ?? '').trim().toLowerCase();
    const candidate = normalizeTransaction({
      title: unescapeFormula(row[idx.title] ?? ''),
      category: unescapeFormula((row[idx.category] ?? '').trim()),
      type,
      amount: String(row[idx.amount] ?? '').replace(/,/g, '').trim(),
      date: (row[idx.date] ?? '').trim(),
      // no id: a fresh one is generated
    });

    if (candidate && CATEGORIES_BY_TYPE[candidate.type]) {
      items.push(candidate);
    } else {
      dropped += 1;
    }
  }

  return { items, dropped };
}
