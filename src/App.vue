<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent } from 'vue';

import AppHeader from './components/AppHeader.vue';
import SummaryCards from './components/SummaryCards.vue';
import MonthlySummary from './components/MonthlySummary.vue';
import TransactionForm from './components/TransactionForm.vue';
import TransactionFilters from './components/TransactionFilters.vue';
import TransactionList from './components/TransactionList.vue';
import ExpenseBreakdown from './components/ExpenseBreakdown.vue';
import ChartsSkeleton from './components/ChartsSkeleton.vue';
import ToastHost from './components/ToastHost.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';

import { PAGE_SIZE } from './config.js';
import { useTransactions } from './composables/useTransactions.js';
import { useCurrentMonth } from './composables/useCurrentMonth.js';
import { useToast } from './composables/useToast.js';
import { sumAmounts } from './utils/money.js';
import { monthKeyOf, todayISO } from './utils/date.js';
import { toCSV, csvToTransactions } from './utils/csv.js';
import { toBackupJSON, parseBackupJSON } from './utils/backup.js';
import { downloadFile } from './utils/download.js';

// Chart.js is the heaviest dependency, so load it on demand
// to keep the first paint fast.
const FinanceCharts = defineAsyncComponent({
  loader: () => import('./components/FinanceCharts.vue'),
  loadingComponent: ChartsSkeleton,
  delay: 150
});


const { toast } = useToast();

const {
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
  totalBalance
} = useTransactions();

const { nowMonth } = useCurrentMonth();


// ─────────────────────────────────────────────
// Storage warnings
// ─────────────────────────────────────────────

const storageWarning = computed(() => {
  switch (storageStatus.value) {
    case 'unavailable':
      return 'Browser storage is unavailable (private mode or blocked by settings). Your data will be lost when you close this tab. Use Backup to save a copy.';
    case 'quota':
      return 'Browser storage is full, so your latest changes are not being saved. Download a Backup and free up some space.';
    case 'corrupt':
      return 'Previously saved data could not be read, so the app started empty. A raw copy was kept in your browser storage under "fintrack_transactions__corrupt".';
    default:
      return '';
  }
});

onMounted(() => {
  if (loadNotice.value) {
    toast.info(loadNotice.value);
  }
});


// ─────────────────────────────────────────────
// Add / Edit
// ─────────────────────────────────────────────

const editingId = ref(null);

const editingTransaction = computed(() => {
  if (editingId.value === null) {
    return null;
  }

  return transactions.value.find(item => item.id === editingId.value) ?? null;
});

// The transaction being edited was deleted (e.g. in another tab).
watch(editingTransaction, item => {
  if (!item) {
    editingId.value = null;
  }
});

const scrollToForm = () => {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  document.getElementById('transaction-form')?.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start'
  });
};

const startEdit = (trans) => {
  editingId.value = trans.id;
  scrollToForm();
};

const cancelEdit = () => {
  editingId.value = null;
};

const onSubmit = (value) => {
  if (editingId.value !== null) {
    const result = update(editingId.value, value);

    editingId.value = null;

    if (!result.ok) {
      toast.error(result.errors._ || 'Could not update the transaction.');
      return;
    }

    toast.success('Transaction updated.');
    return;
  }

  const result = add(value);

  if (!result.ok) {
    toast.error('Could not add the transaction.');
    return;
  }

  toast.success('Transaction added.');
};


// ─────────────────────────────────────────────
// Delete (with undo)
// ─────────────────────────────────────────────

const onDelete = (id) => {
  const removed = remove(id);

  if (!removed) {
    return;
  }

  if (editingId.value === id) {
    editingId.value = null;
  }

  toast.info(`Deleted "${removed.item.title}".`, {
    duration: 8000,
    action: {
      label: 'Undo',
      handler: () => restore(removed.item, removed.index)
    }
  });
};


// ─────────────────────────────────────────────
// Clear all (confirm + undo)
// ─────────────────────────────────────────────

const showClearConfirm = ref(false);

const confirmClearAll = () => {
  showClearConfirm.value = false;

  const previous = clearAll();

  editingId.value = null;

  if (!previous.length) {
    return;
  }

  toast.info(`Deleted ${previous.length} transactions.`, {
    duration: 10000,
    action: {
      label: 'Undo',
      handler: () => replaceAll([...transactions.value, ...previous])
    }
  });
};


// ─────────────────────────────────────────────
// Filters, sorting, pagination
// ─────────────────────────────────────────────

const search = ref('');
const typeFilter = ref('all');
const categoryFilter = ref('all');
const sort = ref('newest');
const visibleCount = ref(PAGE_SIZE);

const sorters = {
  newest: (a, b) => b.date.localeCompare(a.date),
  oldest: (a, b) => a.date.localeCompare(b.date),
  highest: (a, b) => b.amount - a.amount,
  lowest: (a, b) => a.amount - b.amount
};

const filterCategories = computed(() => {
  return [...new Set(
    transactions.value.map(item => item.category)
  )].sort();
});

// A selected category may vanish when its last transaction is deleted.
watch(filterCategories, categories => {
  if (
    categoryFilter.value !== 'all' &&
    !categories.includes(categoryFilter.value)
  ) {
    categoryFilter.value = 'all';
  }
});

watch([search, typeFilter, categoryFilter, sort], () => {
  visibleCount.value = PAGE_SIZE;
});

const filteredTransactions = computed(() => {
  const term = search.value.trim().toLowerCase();

  return transactions.value
    .filter(item => {
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      const matchesType =
        typeFilter.value === 'all' || item.type === typeFilter.value;

      const matchesCategory =
        categoryFilter.value === 'all' ||
        item.category === categoryFilter.value;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort(sorters[sort.value]);
});

const visibleTransactions = computed(() =>
  filteredTransactions.value.slice(0, visibleCount.value)
);

const remainingCount = computed(() =>
  Math.max(filteredTransactions.value.length - visibleCount.value, 0)
);

const showMore = () => {
  visibleCount.value += PAGE_SIZE;
};


// ─────────────────────────────────────────────
// Monthly summary
// ─────────────────────────────────────────────

// null = "follow the current month" (rolls over automatically).
const monthOverride = ref(null);

const selectedMonth = computed({
  get: () => monthOverride.value ?? nowMonth.value,
  set: (key) => {
    monthOverride.value = key === nowMonth.value ? null : key;
  }
});

const monthOptions = computed(() => {
  const months = new Set([nowMonth.value, selectedMonth.value]);

  transactions.value.forEach(item => months.add(monthKeyOf(item.date)));

  return [...months].sort().reverse();
});

const monthlyTransactions = computed(() =>
  transactions.value.filter(
    item => monthKeyOf(item.date) === selectedMonth.value
  )
);

const monthlyIncome = computed(() =>
  sumAmounts(monthlyTransactions.value.filter(item => item.type === 'income'))
);

const monthlyExpense = computed(() =>
  sumAmounts(monthlyTransactions.value.filter(item => item.type === 'expense'))
);

const monthlyBalance = computed(
  () => Math.round((monthlyIncome.value - monthlyExpense.value) * 100) / 100
);


// ─────────────────────────────────────────────
// Expense breakdown
// ─────────────────────────────────────────────

const expenseBreakdown = computed(() => {
  const groups = {};

  transactions.value
    .filter(item => item.type === 'expense')
    .forEach(item => {
      (groups[item.category] ??= []).push(item);
    });

  return Object.entries(groups)
    .map(([category, items]) => ({ category, amount: sumAmounts(items) }))
    .sort((a, b) => b.amount - a.amount);
});

const highestExpense = computed(() =>
  expenseBreakdown.value.length ? expenseBreakdown.value[0].amount : 0
);


// ─────────────────────────────────────────────
// Export / Import
// ─────────────────────────────────────────────

const exportCSV = () => {
  if (!transactions.value.length) {
    return;
  }

  downloadFile(
    `fintrack-transactions-${todayISO()}.csv`,
    toCSV(transactions.value),
    'text/csv;charset=utf-8;'
  );
};

const exportJSON = () => {
  if (!transactions.value.length) {
    return;
  }

  downloadFile(
    `fintrack-backup-${todayISO()}.json`,
    toBackupJSON(transactions.value),
    'application/json'
  );
};

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

const importFile = async (file) => {
  if (file.size > MAX_IMPORT_BYTES) {
    toast.error('This file is too large (max 5 MB).');
    return;
  }

  try {
    const text = await file.text();

    const isJSON =
      /\.json$/i.test(file.name) || file.type === 'application/json';

    const { items, dropped } = isJSON
      ? parseBackupJSON(text)
      : csvToTransactions(text);

    if (!items.length) {
      toast.error(
        dropped
          ? `No valid rows found (${dropped} skipped).`
          : 'No transactions found in this file.'
      );
      return;
    }

    const { added, duplicates } = importItems(items);

    const parts = [`Imported ${added} transaction${added === 1 ? '' : 's'}`];

    if (duplicates) {
      parts.push(`${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped`);
    }

    if (dropped) {
      parts.push(`${dropped} invalid row${dropped === 1 ? '' : 's'} skipped`);
    }

    toast.success(`${parts.join(', ')}.`);
  } catch (error) {
    toast.error(error?.message || 'Could not read this file.');
  }
};
</script>

<template>
  <div class="app">

    <AppHeader
      :transaction-count="transactions.length"
      @export-csv="exportCSV"
      @export-json="exportJSON"
      @import-file="importFile"
    />


    <main class="container">

      <p
        v-if="storageWarning"
        class="banner"
        role="alert"
      >
        {{ storageWarning }}
      </p>


      <section class="welcome">
        <div>
          <span class="welcome-label">
            PERSONAL FINANCE
          </span>

          <h2>
            Manage your money with confidence.
          </h2>

          <p>
            Track your income and expenses in one simple place.
          </p>
        </div>
      </section>


      <SummaryCards
        :total-income="totalIncome"
        :total-expense="totalExpense"
        :total-balance="totalBalance"
      />


      <MonthlySummary
        v-model:month="selectedMonth"
        :month-options="monthOptions"
        :income="monthlyIncome"
        :expense="monthlyExpense"
        :balance="monthlyBalance"
      />


      <FinanceCharts :transactions="transactions" />


      <TransactionForm
        :editing="editingTransaction"
        @submit="onSubmit"
        @cancel="cancelEdit"
      />


      <section
        class="transactions-section"
        aria-labelledby="transactions-title"
      >

        <div class="section-heading">

          <div>
            <span class="section-label">
              TRANSACTION HISTORY
            </span>

            <h2 id="transactions-title">
              Your Transactions
            </h2>
          </div>

          <button
            v-if="transactions.length"
            type="button"
            class="clear-btn"
            @click="showClearConfirm = true"
          >
            Clear All
          </button>

        </div>


        <TransactionFilters
          v-model:search="search"
          v-model:type-filter="typeFilter"
          v-model:category-filter="categoryFilter"
          v-model:sort="sort"
          :categories="filterCategories"
        />


        <div
          v-if="!transactions.length"
          class="empty-state"
        >
          <div class="empty-icon" aria-hidden="true">
            $
          </div>

          <h3>
            No transactions yet
          </h3>

          <p>
            Add your first income or expense to start
            tracking your finances, or import a CSV / JSON backup.
          </p>
        </div>


        <div
          v-else-if="!filteredTransactions.length"
          class="empty-state"
        >
          <div class="empty-icon" aria-hidden="true">
            ⌕
          </div>

          <h3>
            No matching transactions
          </h3>

          <p>
            Try changing your search or filter options.
          </p>
        </div>


        <template v-else>
          <TransactionList
            :transactions="visibleTransactions"
            :editing-id="editingId"
            @edit="startEdit"
            @delete="onDelete"
          />

          <div
            v-if="remainingCount > 0"
            class="load-more"
          >
            <button
              type="button"
              @click="showMore"
            >
              Show more
            </button>

            <span>
              Showing {{ visibleTransactions.length }}
              of {{ filteredTransactions.length }}
            </span>
          </div>
        </template>

      </section>


      <ExpenseBreakdown
        :expenses="expenseBreakdown"
        :highest-expense="highestExpense"
      />

    </main>


    <footer class="footer">
      <p>
        FinTrack · Personal Finance Tracker ·
        Your data stays in this browser
      </p>
    </footer>


    <ConfirmDialog
      :open="showClearConfirm"
      title="Delete all transactions?"
      :message="`This will remove all ${transactions.length} transactions from this browser. You can undo right after, or restore from a backup.`"
      confirm-label="Delete all"
      danger
      @confirm="confirmClearAll"
      @cancel="showClearConfirm = false"
    />

    <ToastHost />

  </div>
</template>


<style scoped>
.app {
  min-height: 100vh;
  background: #0b1120;
  color: #e2e8f0;
}

.container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 42px 0 70px;
}


/* ─────────────────────────────────────────────
   Welcome
───────────────────────────────────────────── */

.welcome {
  margin-bottom: 32px;
}

.welcome-label,
.section-label {
  display: inline-block;
  margin-bottom: 9px;
  color: #3b82f6;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.welcome h2 {
  max-width: 700px;
  margin: 0;
  color: #f8fafc;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -1px;
}

.welcome p {
  margin: 12px 0 0;
  color: #8b9ab3;
  font-size: 15px;
  line-height: 1.6;
}


/* ─────────────────────────────────────────────
   Transactions Section
───────────────────────────────────────────── */

.transactions-section {
  margin-top: 38px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 22px;
  font-weight: 750;
  letter-spacing: -0.3px;
}

.clear-btn {
  border: 1px solid #3b2a2d;
  border-radius: 9px;
  padding: 9px 14px;
  background: transparent;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.clear-btn:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}


/* ─────────────────────────────────────────────
   Empty State
───────────────────────────────────────────── */

.empty-state {
  padding: 55px 25px;
  border: 1px solid #1f2b40;
  border-radius: 16px;
  background: #111827;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  border: 1px solid #263449;
  border-radius: 50%;
  background: #0b1120;
  color: #8b9ab3;
  font-size: 20px;
}

.empty-state h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 700;
}

.empty-state p {
  max-width: 430px;
  margin: 8px auto 0;
  color: #8b9ab3;
  font-size: 13px;
  line-height: 1.6;
}


/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */

.footer {
  border-top: 1px solid #172235;
  padding: 22px 20px;
  text-align: center;
}

.footer p {
  margin: 0;
  color: #7b8aa3;
  font-size: 12px;
}


/* ─────────────────────────────────────────────
   Responsive
───────────────────────────────────────────── */

@media (max-width: 700px) {
  .container {
    width: min(100% - 28px, 1180px);
    padding-top: 30px;
  }

  .welcome {
    margin-bottom: 25px;
  }

  .welcome h2 {
    font-size: 28px;
  }

  .welcome p {
    font-size: 13px;
  }

  .section-heading {
    align-items: center;
  }

  .section-heading h2 {
    font-size: 19px;
  }

  .clear-btn {
    padding: 8px 11px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .container {
    width: calc(100% - 24px);
    padding-bottom: 50px;
  }

  .welcome h2 {
    font-size: 25px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .clear-btn {
    align-self: flex-end;
  }
}


/* ─────────────────────────────────────────────
   Banner / Load more
───────────────────────────────────────────── */

.banner {
  margin: 0 0 24px;
  padding: 12px 16px;
  border: 1px solid #7c2d12;
  border-radius: 10px;
  background: #2a1510;
  color: #fdba74;
  font-size: 13px;
  line-height: 1.55;
}

.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

.load-more button {
  border: 1px solid #26344d;
  border-radius: 9px;
  padding: 10px 18px;
  background: #121a2b;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
}

.load-more button:hover {
  background: #182238;
  color: #fff;
}

.load-more span {
  color: #8b9ab3;
  font-size: 12px;
}
</style>