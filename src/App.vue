<script setup>
import { ref, computed, watch, onMounted } from 'vue';

import AppHeader from './components/AppHeader.vue';
import SummaryCards from './components/SummaryCards.vue';
import MonthlySummary from './components/MonthlySummary.vue';
import TransactionForm from './components/TransactionForm.vue';
import TransactionFilters from './components/TransactionFilters.vue';
import TransactionList from './components/TransactionList.vue';
import ExpenseBreakdown from './components/ExpenseBreakdown.vue';
import FinanceCharts from './components/FinanceCharts.vue';


// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

const expenseCategories = [
  'Groceries',
  'Utilities',
  'Entertainment',
  'Restaurants',
  'Travel',
  'Clothing',
  'Healthcare',
  'Personal',
  'Education',
  'Other'
];

const incomeCategories = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Bonus',
  'Gift',
  'Other'
];


// ─────────────────────────────────────────────
// Transaction State
// ─────────────────────────────────────────────

const transaction = ref({
  title: '',
  category: '',
  amount: null,
  type: '',
  date: new Date().toISOString().split('T')[0]
});

const transactions = ref([]);

const editingId = ref(null);


// ─────────────────────────────────────────────
// Filters
// ─────────────────────────────────────────────

const search = ref('');
const typeFilter = ref('all');
const categoryFilter = ref('all');


// ─────────────────────────────────────────────
// Form
// ─────────────────────────────────────────────

const resetForm = () => {
  transaction.value = {
    title: '',
    category: '',
    amount: null,
    type: '',
    date: new Date().toISOString().split('T')[0]
  };

  editingId.value = null;
};


const changeType = () => {
  transaction.value.category = '';
};


const submit = () => {
  if (
    !transaction.value.title ||
    !transaction.value.category ||
    !transaction.value.amount ||
    !transaction.value.type ||
    !transaction.value.date
  ) {
    return;
  }

  const amount = Number(transaction.value.amount);

  if (amount <= 0) {
    return;
  }

  if (editingId.value) {
    const index = transactions.value.findIndex(
      item => item.id === editingId.value
    );

    if (index !== -1) {
      transactions.value[index] = {
        ...transaction.value,
        amount
      };
    }
  } else {
    transactions.value.unshift({
      id: Date.now(),
      title: transaction.value.title,
      category: transaction.value.category,
      amount,
      type: transaction.value.type,
      date: transaction.value.date
    });
  }

  resetForm();
};


// ─────────────────────────────────────────────
// Edit
// ─────────────────────────────────────────────

const editTransaction = (trans) => {
  editingId.value = trans.id;

  transaction.value = {
    title: trans.title,
    category: trans.category,
    amount: trans.amount,
    type: trans.type,
    date: trans.date
  };

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};


// ─────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────

const deleteTransaction = (id) => {
  if (!confirm('Are you sure you want to delete this transaction?')) {
    return;
  }

  transactions.value = transactions.value.filter(
    transaction => transaction.id !== id
  );

  if (editingId.value === id) {
    resetForm();
  }
};


// ─────────────────────────────────────────────
// Clear All
// ─────────────────────────────────────────────

const clearAll = () => {
  if (!transactions.value.length) {
    return;
  }

  if (!confirm('Are you sure you want to delete all transactions?')) {
    return;
  }

  transactions.value = [];
  resetForm();
};


// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

const totalIncome = computed(() => {
  return transactions.value
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
});


const totalExpense = computed(() => {
  return transactions.value
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
});


const totalBalance = computed(() => {
  return totalIncome.value - totalExpense.value;
});


// ─────────────────────────────────────────────
// Monthly Summary
// ─────────────────────────────────────────────

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const monthlyTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    const date = new Date(`${transaction.date}T00:00:00`);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });
});


const monthlyIncome = computed(() => {
  return monthlyTransactions.value
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
});


const monthlyExpense = computed(() => {
  return monthlyTransactions.value
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
});


const monthlyBalance = computed(() => {
  return monthlyIncome.value - monthlyExpense.value;
});


// ─────────────────────────────────────────────
// Filter Categories
// ─────────────────────────────────────────────

const filterCategories = computed(() => {
  return [...new Set(
    transactions.value.map(transaction => transaction.category)
  )].sort();
});


// ─────────────────────────────────────────────
// Filtered Transactions
// ─────────────────────────────────────────────

const filteredTransactions = computed(() => {
  const searchTerm = search.value.trim().toLowerCase();

  return transactions.value.filter(transaction => {

    const matchesSearch =
      !searchTerm ||
      transaction.title.toLowerCase().includes(searchTerm) ||
      transaction.category.toLowerCase().includes(searchTerm);

    const matchesType =
      typeFilter.value === 'all' ||
      transaction.type === typeFilter.value;

    const matchesCategory =
      categoryFilter.value === 'all' ||
      transaction.category === categoryFilter.value;

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory
    );
  });
});


// ─────────────────────────────────────────────
// Expense Breakdown
// ─────────────────────────────────────────────

const expenseBreakdown = computed(() => {
  const categories = {};

  transactions.value
    .filter(transaction => transaction.type === 'expense')
    .forEach(transaction => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = 0;
      }

      categories[transaction.category] += Number(transaction.amount);
    });

  return Object.entries(categories)
    .map(([category, amount]) => ({
      category,
      amount
    }))
    .sort((a, b) => b.amount - a.amount);
});


const highestExpense = computed(() => {
  return expenseBreakdown.value.length
    ? expenseBreakdown.value[0].amount
    : 0;
});


// ─────────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────────

const exportCSV = () => {
  if (!transactions.value.length) {
    return;
  }

  const headers = [
    'Title',
    'Category',
    'Type',
    'Amount',
    'Date'
  ];

  const rows = transactions.value.map(transaction => [
    `"${transaction.title.replace(/"/g, '""')}"`,
    `"${transaction.category.replace(/"/g, '""')}"`,
    transaction.type,
    transaction.amount,
    transaction.date
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(
    [csvContent],
    { type: 'text/csv;charset=utf-8;' }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = 'fintrack-transactions.csv';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};


// ─────────────────────────────────────────────
// LocalStorage
// ─────────────────────────────────────────────

const STORAGE_KEY = 'fintrack_transactions';


const saveToLocalStorage = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions.value)
  );
};


const loadFromLocalStorage = () => {
  const savedTransactions = localStorage.getItem(STORAGE_KEY);

  if (!savedTransactions) {
    return;
  }

  try {
    const parsedTransactions = JSON.parse(savedTransactions);

    if (Array.isArray(parsedTransactions)) {
      transactions.value = parsedTransactions;
    }
  } catch (error) {
    console.error(
      'Failed to load transactions from LocalStorage:',
      error
    );
  }
};


watch(
  transactions,
  saveToLocalStorage,
  { deep: true }
);


onMounted(() => {
  loadFromLocalStorage();
});
</script>


<template>
  <div class="app">

    <!-- Header -->
    <AppHeader
      :transaction-count="transactions.length"
      @export="exportCSV"
    />


    <main class="container">

      <!-- Welcome -->
      <section class="welcome">
        <div>
          <span class="welcome-label">
            PERSONAL FINANCE
          </span>

          <h1>
            Manage your money with confidence.
          </h1>

          <p>
            Track your income and expenses in one simple place.
          </p>
        </div>
      </section>


      <!-- Summary Cards -->
      <SummaryCards
        :total-income="totalIncome"
        :total-expense="totalExpense"
        :total-balance="totalBalance"
      />


      <!-- Monthly Summary -->
      <MonthlySummary
        :income="monthlyIncome"
        :expense="monthlyExpense"
        :balance="monthlyBalance"
      />


      <!-- Charts -->
      <FinanceCharts
        :transactions="transactions"
      />


      <!-- Transaction Form -->
      <TransactionForm
        :transaction="transaction"
        :editing-id="editingId"
        :income-categories="incomeCategories"
        :expense-categories="expenseCategories"
        @submit="submit"
        @cancel="resetForm"
        @type-change="changeType"
      />


      <!-- Transactions -->
      <section class="transactions-section">

        <div class="section-heading">

          <div>
            <span class="section-label">
              TRANSACTION HISTORY
            </span>

            <h2>
              Your Transactions
            </h2>
          </div>

          <button
            v-if="transactions.length"
            class="clear-btn"
            @click="clearAll"
          >
            Clear All
          </button>

        </div>


        <!-- Filters -->
        <TransactionFilters
          :search="search"
          :type-filter="typeFilter"
          :category-filter="categoryFilter"
          :categories="filterCategories"
          @update:search="search = $event"
          @update:type-filter="typeFilter = $event"
          @update:category-filter="categoryFilter = $event"
        />


        <!-- No Transactions -->
        <div
          v-if="!transactions.length"
          class="empty-state"
        >
          <div class="empty-icon">
            $
          </div>

          <h3>
            No transactions yet
          </h3>

          <p>
            Add your first income or expense to start
            tracking your finances.
          </p>
        </div>


        <!-- No Filter Results -->
        <div
          v-else-if="!filteredTransactions.length"
          class="empty-state"
        >
          <div class="empty-icon">
            ⌕
          </div>

          <h3>
            No matching transactions
          </h3>

          <p>
            Try changing your search or filter options.
          </p>
        </div>


        <!-- Transaction List -->
        <TransactionList
          v-else
          :transactions="filteredTransactions"
          :editing-id="editingId"
          @edit="editTransaction"
          @delete="deleteTransaction"
        />

      </section>


      <!-- Expense Breakdown -->
      <ExpenseBreakdown
        :expenses="expenseBreakdown"
        :highest-expense="highestExpense"
      />

    </main>


    <!-- Footer -->
    <footer class="footer">
      <p>
        FinTrack · Personal Finance Tracker
      </p>
    </footer>

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

.welcome h1 {
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
  color: #64748b;
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
  color: #64748b;
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
  color: #64748b;
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
  color: #475569;
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

  .welcome h1 {
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

  .welcome h1 {
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
</style>