import { normalizeTransactions } from './validation.js';

/**
 * Safe wrapper around localStorage for the transaction list.
 *
 * - Never throws (private mode, blocked storage, quota exceeded).
 * - If saved data is corrupted, the raw text is kept under `${key}__corrupt`
 *   so nothing is silently lost.
 */
export function createTransactionStorage(key, backend) {
  const resolveBackend = () => {
    try {
      return backend ?? globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  };

  function load() {
    const store = resolveBackend();
    if (!store) {
      return { items: [], status: 'unavailable', dropped: 0 };
    }

    let raw;
    try {
      raw = store.getItem(key);
    } catch {
      return { items: [], status: 'unavailable', dropped: 0 };
    }

    if (raw === null || raw === '') {
      return { items: [], status: 'ok', dropped: 0 };
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('not an array');
      }
      const { items, dropped } = normalizeTransactions(parsed);
      return { items, status: 'ok', dropped };
    } catch {
      try {
        store.setItem(`${key}__corrupt`, raw);
      } catch {
        /* ignore */
      }
      return { items: [], status: 'corrupt', dropped: 0 };
    }
  }

  function save(items) {
    const store = resolveBackend();
    if (!store) {
      return { ok: false, reason: 'unavailable' };
    }
    try {
      store.setItem(key, JSON.stringify(items));
      return { ok: true };
    } catch (error) {
      const quota =
        error?.name === 'QuotaExceededError' ||
        error?.name === 'NS_ERROR_DOM_QUOTA_REACHED';
      return { ok: false, reason: quota ? 'quota' : 'unavailable' };
    }
  }

  return { load, save };
}
