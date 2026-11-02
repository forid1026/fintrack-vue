import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { STORAGE_KEY } from '../config.js';
import { createTransactionStorage } from '../utils/storage.js';
import { validateTransactionInput, fingerprint } from '../utils/validation.js';
import { createId } from '../utils/id.js';
import { sumAmounts } from '../utils/money.js';

/**
 * Single source of truth for transactions.
 *
 * - Every change goes through `commit()` which updates state and persists.
 * - Changes made in another browser tab are picked up live (storage event).
 */
export function useTransactions() {
  const storage = createTransactionStorage(STORAGE_KEY);

  const initial = storage.load();
  const transactions = ref(initial.items);
  // 'ok' | 'unavailable' | 'quota' | 'corrupt'
  const storageStatus = ref(initial.status);
  const loadNotice = ref(
    initial.dropped > 0
      ? `${initial.dropped} invalid saved record(s) were skipped.`
      : '',
  );

  function commit(next) {
    transactions.value = next;
    const result = storage.save(next);
    storageStatus.value = result.ok ? 'ok' : result.reason;
    return result.ok;
  }

  // ── CRUD ───────────────────────────────────────────────
  function add(input) {
    const { valid, errors, value } = validateTransactionInput(input);
    if (!valid) {
      return { ok: false, errors };
    }
    const item = { id: createId(), ...value };
    commit([item, ...transactions.value]);
    return { ok: true, item };
  }

  function update(id, input) {
    const { valid, errors, value } = validateTransactionInput(input);
    if (!valid) {
      return { ok: false, errors };
    }
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index === -1) {
      return { ok: false, errors: { _: 'This transaction no longer exists.' } };
    }
    const next = [...transactions.value];
    next[index] = { id, ...value };
    commit(next);
    return { ok: true, item: next[index] };
  }

  function remove(id) {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index === -1) {
      return null;
    }
    const item = transactions.value[index];
    commit(transactions.value.filter((t) => t.id !== id));
    return { item, index };
  }

  function restore(item, index) {
    if (transactions.value.some((t) => t.id === item.id)) {
      return;
    }
    const next = [...transactions.value];
    next.splice(Math.min(index, next.length), 0, item);
    commit(next);
  }

  function clearAll() {
    const previous = transactions.value;
    commit([]);
    return previous;
  }

  function replaceAll(items) {
    commit(items);
  }

  /** Merge already-normalized items, skipping exact duplicates. */
  function importItems(items) {
    const known = new Set(transactions.value.map(fingerprint));
    const ids = new Set(transactions.value.map((t) => t.id));
    const fresh = [];

    for (const item of items) {
      const key = fingerprint(item);
      if (known.has(key)) {
        continue;
      }
      known.add(key);
      fresh.push(ids.has(item.id) ? { ...item, id: createId() } : item);
      ids.add(fresh[fresh.length - 1].id);
    }

    if (fresh.length) {
      commit([...fresh, ...transactions.value]);
    }
    return { added: fresh.length, duplicates: items.length - fresh.length };
  }

  // ── Live sync between tabs ─────────────────────────────
  function onStorage(event) {
    // event.key === null means localStorage.clear() was called.
    if (event.key !== null && event.key !== STORAGE_KEY) {
      return;
    }
    const result = storage.load();
    if (result.status === 'ok') {
      transactions.value = result.items;
    }
  }

  onMounted(() => window.addEventListener('storage', onStorage));
  onBeforeUnmount(() => window.removeEventListener('storage', onStorage));

  // ── Totals ─────────────────────────────────────────────
  const totalIncome = computed(() =>
    sumAmounts(transactions.value.filter((t) => t.type === 'income')),
  );
  const totalExpense = computed(() =>
    sumAmounts(transactions.value.filter((t) => t.type === 'expense')),
  );
  const totalBalance = computed(
    () => Math.round((totalIncome.value - totalExpense.value) * 100) / 100,
  );

  return {
    transactions,
    storageStatus,
    loadNotice,
    add,
    update,
    remove,
    restore,
    clearAll,
    replaceAll,
    importItems,
    totalIncome,
    totalExpense,
    totalBalance,
  };
}
