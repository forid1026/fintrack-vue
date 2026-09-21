<script setup>
import { computed } from 'vue';

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  },

  editingId: {
    default: null
  },

  incomeCategories: {
    type: Array,
    default: () => []
  },

  expenseCategories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'submit',
  'cancel',
  'type-change'
]);

const availableCategories = computed(() => {
  if (props.transaction.type === 'income') {
    return props.incomeCategories;
  }

  if (props.transaction.type === 'expense') {
    return props.expenseCategories;
  }

  return [];
});
</script>

<template>
  <section class="form-card">

    <div class="heading">

      <div>
        <h3>
          {{
            editingId !== null
              ? 'Edit Transaction'
              : 'Add Transaction'
          }}
        </h3>

        <p>
          {{
            editingId !== null
              ? 'Update your transaction details'
              : 'Record your income or expense'
          }}
        </p>
      </div>

    </div>

    <form
      class="form"
      @submit.prevent="emit('submit')"
    >

      <div class="group">
        <label>Title</label>

        <input
          v-model="transaction.title"
          type="text"
          placeholder="e.g. Monthly Salary"
        />
      </div>

      <div class="group">
        <label>Type</label>

        <select
          v-model="transaction.type"
          @change="emit('type-change')"
        >
          <option value="">
            Select type
          </option>

          <option value="income">
            Income
          </option>

          <option value="expense">
            Expense
          </option>
        </select>
      </div>

      <div class="group">
        <label>Category</label>

        <select
          v-model="transaction.category"
          :disabled="!transaction.type"
        >
          <option value="">
            {{
              transaction.type
                ? 'Select category'
                : 'Select type first'
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

      <div class="group">
        <label>Amount</label>

        <input
          v-model="transaction.amount"
          type="number"
          min="1"
          placeholder="0"
        />
      </div>

      <div class="group">
        <label>Date</label>

        <input
          v-model="transaction.date"
          type="date"
        />
      </div>

      <div class="actions">

        <button
          type="submit"
          class="submit"
          :class="{
            update: editingId !== null
          }"
        >
          {{
            editingId !== null
              ? '✓ Update Transaction'
              : '+ Add Transaction'
          }}
        </button>

        <button
          v-if="editingId !== null"
          type="button"
          class="cancel"
          @click="emit('cancel')"
        >
          Cancel
        </button>

      </div>

    </form>

  </section>
</template>

<style scoped>
.form-card {
  margin-top: 18px;

  background: #111827;

  border: 1px solid #1f2b40;

  border-radius: 14px;

  padding: 22px;
}

.heading h3 {
  margin: 0;

  color: #f8fafc;

  font-size: 18px;
}

.heading p {
  margin: 5px 0 0;

  color: #64748b;

  font-size: 13px;
}

.form {
  margin-top: 22px;

  display: grid;

  grid-template-columns:
    1.5fr 1fr 1.2fr 1fr 1fr;

  gap: 14px;

  align-items: end;
}

.group label {
  display: block;

  margin-bottom: 7px;

  color: #94a3b8;

  font-size: 12px;
}

.group input,
.group select {
  width: 100%;

  border: 1px solid #29364d;

  background: #0d1525;

  color: #e5e7eb;

  padding: 11px 12px;

  border-radius: 8px;

  outline: none;
}

.group input:focus,
.group select:focus {
  border-color: #3b82f6;
}

.group select:disabled {
  opacity: 0.5;
}

.actions {
  display: flex;

  gap: 8px;
}

.submit,
.cancel {
  border: none;

  padding: 11px 14px;

  border-radius: 8px;

  cursor: pointer;

  white-space: nowrap;
}

.submit {
  background: #2563eb;
  color: white;
}

.submit:hover {
  background: #1d4ed8;
}

.submit.update {
  background: #d97706;
}

.cancel {
  background: #273449;
  color: #cbd5e1;
}

@media (max-width: 950px) {
  .form {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions {
    grid-column: span 2;
  }
}

@media (max-width: 600px) {
  .form {
    grid-template-columns: 1fr;
  }

  .actions {
    grid-column: auto;
  }
}
</style>