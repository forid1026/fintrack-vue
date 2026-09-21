<script setup>
import { ref, computed, onMounted, watch } from 'vue';

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

const transaction = ref({
  title: '',
  category: '',
  amount: null,
  type: ''
});

const transactions = ref([]);

const editingId = ref(null);

// Dynamic categories based on transaction type
const availableCategories = computed(() => {
  if (transaction.value.type === 'income') {
    return incomeCategories;
  }

  if (transaction.value.type === 'expense') {
    return expenseCategories;
  }

  return [];
});

// Reset category when type changes
const changeType = () => {
  transaction.value.category = '';
};

// Reset form
const resetForm = () => {
  transaction.value = {
    title: '',
    category: '',
    amount: null,
    type: ''
  };

  editingId.value = null;
};

// Add / Update Transaction
const submit = () => {
  if (
    !transaction.value.title ||
    !transaction.value.category ||
    !transaction.value.amount ||
    !transaction.value.type
  ) {
    alert('Please fill in all fields.');
    return;
  }

  // Update existing transaction
  if (editingId.value !== null) {
    const index = transactions.value.findIndex(
      trans => trans.id === editingId.value
    );

    if (index !== -1) {
      transactions.value[index] = {
        ...transactions.value[index],
        title: transaction.value.title,
        category: transaction.value.category,
        amount: transaction.value.amount,
        type: transaction.value.type
      };
    }

    resetForm();

    return;
  }

  // Add new transaction
  transactions.value.unshift({
    id: Date.now(),
    title: transaction.value.title,
    category: transaction.value.category,
    amount: transaction.value.amount,
    type: transaction.value.type
  });

  resetForm();
};

// Edit transaction
const editTransaction = (trans) => {
  transaction.value = {
    title: trans.title,
    category: trans.category,
    amount: trans.amount,
    type: trans.type
  };

  editingId.value = trans.id;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Delete transaction
const deleteTransaction = (id) => {
  const confirmed = confirm(
    'Are you sure you want to delete this transaction?'
  );

  if (!confirmed) {
    return;
  }

  transactions.value = transactions.value.filter(
    trans => trans.id !== id
  );

  // If currently editing the deleted transaction
  if (editingId.value === id) {
    resetForm();
  }
};

// Save data to local storage
const saveToLocalStorage = () => {
  localStorage.setItem(
    'transactions',
    JSON.stringify(transactions.value)
  );
};

// Load data from local storage
const loadFromLocalStorage = () => {
  const data = localStorage.getItem('transactions');

  if (data) {
    transactions.value = JSON.parse(data);
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

// Total Income
const totalIncome = computed(() => {
  return transactions.value
    .filter(trans => trans.type === 'income')
    .reduce(
      (total, trans) => total + Number(trans.amount),
      0
    );
});

// Total Expense
const totalExpense = computed(() => {
  return transactions.value
    .filter(trans => trans.type === 'expense')
    .reduce(
      (total, trans) => total + Number(trans.amount),
      0
    );
});

// Balance
const totalBalance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

// Format amount
const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-BD').format(amount);
};
</script>

<template>
  <div class="app">

    <!-- Header -->
    <header class="header">
      <div>
        <p class="eyebrow">PERSONAL FINANCE</p>

        <h1>Expense Tracker</h1>

        <p class="subtitle">
          Keep track of your income and expenses in one place.
        </p>
      </div>

      <div class="header-icon">
        💰
      </div>
    </header>


    <!-- Summary -->
    <section class="summary-grid">

      <!-- Balance -->
      <div class="summary-card balance-card">
        <div class="card-top">
          <span class="card-label">
            Total Balance
          </span>

          <span class="card-icon">
            ৳
          </span>
        </div>

        <h2>
          ৳ {{ formatAmount(totalBalance) }}
        </h2>

        <p class="card-description">
          Current available balance
        </p>
      </div>


      <!-- Income -->
      <div class="summary-card income-card">
        <div class="card-top">
          <span class="card-label">
            Total Income
          </span>

          <span class="card-icon">
            ↗
          </span>
        </div>

        <h2>
          ৳ {{ formatAmount(totalIncome) }}
        </h2>

        <p class="card-description">
          Money coming in
        </p>
      </div>


      <!-- Expense -->
      <div class="summary-card expense-card">
        <div class="card-top">
          <span class="card-label">
            Total Expenses
          </span>

          <span class="card-icon">
            ↘
          </span>
        </div>

        <h2>
          ৳ {{ formatAmount(totalExpense) }}
        </h2>

        <p class="card-description">
          Money going out
        </p>
      </div>

    </section>


    <!-- Main Content -->
    <main class="main-grid">

      <!-- Add / Edit Transaction -->
      <section class="panel form-panel">

        <div class="panel-header">
          <div>
            <p class="section-label">
              TRANSACTION
            </p>

            <h2>
              {{ editingId !== null
                ? 'Edit Transaction'
                : 'Add Transaction'
              }}
            </h2>
          </div>

          <div
            class="plus-icon"
            :class="{ editing: editingId !== null }"
          >
            {{ editingId !== null ? '✎' : '+' }}
          </div>
        </div>


        <form
          @submit.prevent="submit"
          autocomplete="off"
        >

          <!-- Title -->
          <div class="form-group">

            <label for="title">
              Transaction Title
            </label>

            <input
              id="title"
              type="text"
              v-model.trim="transaction.title"
              placeholder="e.g. Monthly Salary"
            />

          </div>


          <!-- Type -->
          <div class="form-group">

            <label>
              Transaction Type
            </label>

            <div class="type-options">

              <!-- Income -->
              <label
                class="type-option income-option"
                :class="{
                  active: transaction.type === 'income'
                }"
              >

                <input
                  type="radio"
                  value="income"
                  v-model="transaction.type"
                  @change="changeType"
                />

                <span class="radio-icon">
                  ↗
                </span>

                <span>
                  <strong>Income</strong>

                  <small>
                    Money received
                  </small>
                </span>

              </label>


              <!-- Expense -->
              <label
                class="type-option expense-option"
                :class="{
                  active: transaction.type === 'expense'
                }"
              >

                <input
                  type="radio"
                  value="expense"
                  v-model="transaction.type"
                  @change="changeType"
                />

                <span class="radio-icon">
                  ↘
                </span>

                <span>
                  <strong>Expense</strong>

                  <small>
                    Money spent
                  </small>
                </span>

              </label>

            </div>

          </div>


          <!-- Category -->
          <div class="form-group">

            <label for="category">
              Category
            </label>

            <select
              id="category"
              v-model="transaction.category"
              :disabled="!transaction.type"
            >

              <option value="" disabled>
                {{
                  transaction.type
                    ? 'Select category'
                    : 'Select transaction type first'
                }}
              </option>

              <option
                v-for="category in availableCategories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>

            </select>

          </div>


          <!-- Amount -->
          <div class="form-group">

            <label for="amount">
              Amount
            </label>

            <div class="amount-input">

              <span>৳</span>

              <input
                id="amount"
                type="number"
                min="1"
                v-model.number="transaction.amount"
                placeholder="0"
              />

            </div>

          </div>


          <!-- Buttons -->
          <div class="form-actions">

            <button
              type="submit"
              class="submit-btn"
              :class="{ update: editingId !== null }"
            >

              <span>
                {{ editingId !== null ? '✓' : '+' }}
              </span>

              {{
                editingId !== null
                  ? 'Update Transaction'
                  : 'Add Transaction'
              }}

            </button>


            <!-- Cancel Edit -->
            <button
              v-if="editingId !== null"
              type="button"
              class="cancel-btn"
              @click="resetForm"
            >
              Cancel
            </button>

          </div>

        </form>

      </section>


      <!-- Transactions -->
      <section class="panel transactions-panel">

        <div class="panel-header">

          <div>
            <p class="section-label">
              ACTIVITY
            </p>

            <h2>
              Recent Transactions
            </h2>
          </div>

          <span class="transaction-count">
            {{ transactions.length }}
          </span>

        </div>


        <!-- Empty State -->
        <div
          v-if="transactions.length === 0"
          class="empty-state"
        >

          <div class="empty-icon">
            📊
          </div>

          <h3>
            No transactions yet
          </h3>

          <p>
            Add your first income or expense
            to start tracking your finances.
          </p>

        </div>


        <!-- Transactions -->
        <div
          v-else
          class="transaction-list"
        >

          <div
            v-for="trans in transactions"
            :key="trans.id"
            class="transaction-item"
            :class="{
              'is-editing': editingId === trans.id
            }"
          >

            <!-- Icon -->
            <div
              class="transaction-icon"
              :class="trans.type"
            >

              {{
                trans.type === 'income'
                  ? '↗'
                  : '↘'
              }}

            </div>


            <!-- Info -->
            <div class="transaction-info">

              <h3>
                {{ trans.title }}
              </h3>

              <div class="transaction-meta">

                <span>
                  {{ trans.category }}
                </span>

                <span>•</span>

                <span>
                  {{
                    trans.type === 'income'
                      ? 'Income'
                      : 'Expense'
                  }}
                </span>

              </div>

            </div>


            <!-- Amount -->
            <div
              class="transaction-amount"
              :class="trans.type"
            >

              {{
                trans.type === 'income'
                  ? '+'
                  : '-'
              }}

              ৳{{ formatAmount(trans.amount) }}

            </div>


            <!-- Actions -->
            <div class="transaction-actions">

              <button
                type="button"
                class="action-btn edit-btn"
                title="Edit transaction"
                @click="editTransaction(trans)"
              >
                ✎
              </button>

              <button
                type="button"
                class="action-btn delete-btn"
                title="Delete transaction"
                @click="deleteTransaction(trans.id)"
              >
                🗑
              </button>

            </div>

          </div>

        </div>

      </section>

    </main>

  </div>
</template>


<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  min-height: 100vh;
  padding: 45px 25px;

  background:
    radial-gradient(
      circle at top right,
      rgba(59, 130, 246, 0.12),
      transparent 30%
    ),
    #0b1120;

  color: #e5e7eb;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}


/* Header */

.header,
.summary-grid,
.main-grid {
  width: 100%;
  max-width: 1180px;

  margin-left: auto;
  margin-right: auto;
}

.header {
  display: flex;

  justify-content: space-between;
  align-items: center;

  margin-bottom: 35px;
}

.eyebrow,
.section-label {
  margin: 0 0 8px;

  color: #60a5fa;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 1.8px;
}

.header h1 {
  margin: 0;

  color: #f8fafc;

  font-size: 38px;
  line-height: 1.1;
}

.subtitle {
  margin: 10px 0 0;

  color: #94a3b8;

  font-size: 15px;
}

.header-icon {
  width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #243047;
  border-radius: 16px;

  background: #111a2d;

  font-size: 25px;
}


/* Summary */

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 18px;

  margin-bottom: 25px;
}

.summary-card {
  padding: 24px;

  border: 1px solid #202c42;
  border-radius: 18px;

  background: rgba(17, 26, 45, 0.85);

  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.15);
}

.card-top {
  display: flex;

  align-items: center;
  justify-content: space-between;
}

.card-label {
  color: #94a3b8;

  font-size: 14px;
}

.card-icon {
  width: 35px;
  height: 35px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #1e293b;

  color: #93c5fd;

  font-weight: 700;
}

.summary-card h2 {
  margin: 17px 0 5px;

  color: #f8fafc;

  font-size: 29px;
}

.card-description {
  margin: 0;

  color: #64748b;

  font-size: 13px;
}

.income-card .card-icon {
  color: #4ade80;

  background: rgba(34, 197, 94, 0.1);
}

.expense-card .card-icon {
  color: #f87171;

  background: rgba(239, 68, 68, 0.1);
}


/* Main */

.main-grid {
  display: grid;

  grid-template-columns:
    390px 1fr;

  gap: 22px;

  align-items: start;
}

.panel {
  border: 1px solid #202c42;
  border-radius: 20px;

  background: rgba(15, 23, 42, 0.88);

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.18);
}

.form-panel {
  padding: 27px;
}

.transactions-panel {
  min-height: 500px;

  padding: 27px;
}

.panel-header {
  display: flex;

  justify-content: space-between;
  align-items: center;

  margin-bottom: 27px;
}

.panel-header h2 {
  margin: 0;

  color: #f8fafc;

  font-size: 21px;
}

.plus-icon {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: rgba(59, 130, 246, 0.12);

  color: #60a5fa;

  font-size: 22px;
}

.plus-icon.editing {
  background: rgba(245, 158, 11, 0.1);

  color: #fbbf24;
}


/* Form */

.form-group {
  margin-bottom: 20px;
}

.form-group > label {
  display: block;

  margin-bottom: 8px;

  color: #cbd5e1;

  font-size: 13px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;

  padding: 12px 14px;

  border: 1px solid #26344d;
  outline: none;

  border-radius: 10px;

  background: #0b1324;

  color: #e2e8f0;

  font-size: 14px;

  transition: 0.2s;
}

.form-group input::placeholder {
  color: #475569;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3b82f6;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group select:disabled {
  cursor: not-allowed;

  opacity: 0.55;
}


/* Amount */

.amount-input {
  position: relative;
}

.amount-input span {
  position: absolute;

  left: 14px;
  top: 50%;

  transform: translateY(-50%);

  color: #64748b;

  font-weight: 600;
}

.amount-input input {
  padding-left: 35px;
}


/* Type */

.type-options {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 10px;
}

.type-option {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 12px;

  border: 1px solid #26344d;
  border-radius: 10px;

  cursor: pointer;

  background: #0b1324;

  transition: 0.2s;
}

.type-option input {
  display: none;
}

.type-option strong {
  display: block;

  color: #cbd5e1;

  font-size: 12px;
}

.type-option small {
  display: block;

  margin-top: 3px;

  color: #64748b;

  font-size: 10px;
}

.radio-icon {
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  font-weight: 700;
}

.income-option .radio-icon {
  background: rgba(34, 197, 94, 0.1);

  color: #4ade80;
}

.expense-option .radio-icon {
  background: rgba(239, 68, 68, 0.1);

  color: #f87171;
}

.income-option.active {
  border-color: rgba(34, 197, 94, 0.5);

  background: rgba(34, 197, 94, 0.06);
}

.expense-option.active {
  border-color: rgba(239, 68, 68, 0.5);

  background: rgba(239, 68, 68, 0.06);
}


/* Form Actions */

.form-actions {
  display: flex;

  flex-direction: column;

  gap: 10px;

  margin-top: 8px;
}


/* Submit */

.submit-btn {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  padding: 13px;

  border: none;
  border-radius: 10px;

  background: #2563eb;

  color: white;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}

.submit-btn:hover {
  background: #3b82f6;

  transform: translateY(-1px);
}

.submit-btn.update {
  background: #d97706;
}

.submit-btn.update:hover {
  background: #f59e0b;
}

.submit-btn span {
  font-size: 18px;
}


/* Cancel */

.cancel-btn {
  width: 100%;

  padding: 11px;

  border: 1px solid #334155;
  border-radius: 10px;

  background: transparent;

  color: #94a3b8;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s;
}

.cancel-btn:hover {
  border-color: #475569;

  background: #1e293b;

  color: #e2e8f0;
}


/* Transactions */

.transaction-count {
  min-width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 9px;

  border-radius: 8px;

  background: #1e293b;

  color: #94a3b8;

  font-size: 12px;
  font-weight: 600;
}

.transaction-list {
  display: flex;

  flex-direction: column;
}

.transaction-item {
  display: flex;

  align-items: center;

  gap: 14px;

  padding: 16px 4px;

  border-bottom: 1px solid #1e293b;

  transition: 0.2s;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item.is-editing {
  padding-left: 10px;
  padding-right: 10px;

  border-radius: 12px;

  background: rgba(245, 158, 11, 0.06);
}


/* Transaction Icon */

.transaction-icon {
  width: 43px;
  height: 43px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  font-size: 18px;
  font-weight: 700;
}

.transaction-icon.income {
  background: rgba(34, 197, 94, 0.1);

  color: #4ade80;
}

.transaction-icon.expense {
  background: rgba(239, 68, 68, 0.1);

  color: #f87171;
}


/* Transaction Info */

.transaction-info {
  min-width: 0;

  flex: 1;
}

.transaction-info h3 {
  margin: 0 0 5px;

  overflow: hidden;

  color: #e2e8f0;

  font-size: 14px;
  font-weight: 600;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.transaction-meta {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #64748b;

  font-size: 11px;
}


/* Amount */

.transaction-amount {
  font-size: 14px;

  font-weight: 700;

  white-space: nowrap;
}

.transaction-amount.income {
  color: #4ade80;
}

.transaction-amount.expense {
  color: #f87171;
}


/* Actions */

.transaction-actions {
  display: flex;

  align-items: center;

  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #26344d;
  border-radius: 8px;

  background: #111a2d;

  font-size: 13px;

  cursor: pointer;

  transition: 0.2s;
}

.edit-btn {
  color: #60a5fa;
}

.edit-btn:hover {
  border-color: rgba(59, 130, 246, 0.5);

  background: rgba(59, 130, 246, 0.1);
}

.delete-btn {
  color: #f87171;
}

.delete-btn:hover {
  border-color: rgba(239, 68, 68, 0.5);

  background: rgba(239, 68, 68, 0.1);
}


/* Empty */

.empty-state {
  min-height: 350px;

  display: flex;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-icon {
  width: 65px;
  height: 65px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 17px;

  border-radius: 18px;

  background: #111c31;

  font-size: 27px;
}

.empty-state h3 {
  margin: 0 0 8px;

  color: #cbd5e1;

  font-size: 16px;
}

.empty-state p {
  max-width: 330px;

  margin: 0;

  color: #64748b;

  font-size: 13px;

  line-height: 1.6;
}


/* Responsive */

@media (max-width: 900px) {

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 700px) {

  .transaction-item {
    align-items: flex-start;

    flex-wrap: wrap;
  }

  .transaction-info {
    flex: 1;
  }

  .transaction-amount {
    margin-left: 57px;
  }

  .transaction-actions {
    margin-left: auto;
  }

}


@media (max-width: 600px) {

  .app {
    padding: 25px 15px;
  }

  .header {
    align-items: flex-start;
  }

  .header h1 {
    font-size: 30px;
  }

  .header-icon {
    width: 48px;
    height: 48px;

    font-size: 20px;
  }

  .summary-card,
  .form-panel,
  .transactions-panel {
    padding: 20px;
  }

  .type-options {
    grid-template-columns: 1fr;
  }

  .transaction-item {
    gap: 10px;
  }

  .transaction-amount {
    margin-left: 0;

    font-size: 12px;
  }

  .action-btn {
    width: 30px;
    height: 30px;
  }

}
</style>