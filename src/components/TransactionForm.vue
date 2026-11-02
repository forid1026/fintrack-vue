<script setup>
import { reactive, ref, computed, watch, nextTick } from 'vue';
import { CATEGORIES_BY_TYPE } from '../constants/categories.js';
import {
  validateTransactionInput,
  MAX_TITLE_LENGTH
} from '../utils/validation.js';
import { todayISO } from '../utils/date.js';

const props = defineProps({
  // The transaction being edited, or null when adding a new one.
  editing: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const blank = () => ({
  title: '',
  type: '',
  category: '',
  amount: '',
  date: todayISO()
});

// Local copy: the form never mutates props.
const form = reactive(blank());
const errors = ref({});
const titleInput = ref(null);

const isEditing = computed(() => props.editing !== null);

const categories = computed(() => CATEGORIES_BY_TYPE[form.type] ?? []);

const fill = (values) => {
  Object.assign(form, values);
  errors.value = {};
};

// Keyed on the id so edits made elsewhere (another tab) don't overwrite
// what the user is currently typing.
watch(
  () => props.editing?.id ?? null,
  async () => {
    const transaction = props.editing;

    if (transaction) {
      fill({
        title: transaction.title,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date
      });

      await nextTick();
      titleInput.value?.focus({ preventScroll: true });
    } else {
      fill(blank());
    }
  },
  { immediate: true }
);

const onTypeChange = () => {
  form.category = '';
  delete errors.value.type;
};

const submit = async () => {
  const result = validateTransactionInput(form);

  errors.value = result.errors;

  if (!result.valid) {
    const firstInvalid = ['title', 'type', 'category', 'amount', 'date'].find(
      (field) => result.errors[field]
    );

    await nextTick();
    document.getElementById(`tx-${firstInvalid}`)?.focus();
    return;
  }

  emit('submit', result.value);

  // When editing, the parent clears `editing` which resets the form.
  if (!isEditing.value) {
    fill(blank());
    await nextTick();
    titleInput.value?.focus({ preventScroll: true });
  }
};
</script>

<template>
  <section
    id="transaction-form"
    class="form-card"
    aria-labelledby="form-title"
  >
    <div class="heading">
      <div>
        <h3 id="form-title">
          {{ isEditing ? 'Edit Transaction' : 'Add Transaction' }}
        </h3>

        <p>
          {{
            isEditing
              ? 'Update your transaction details'
              : 'Record your income or expense'
          }}
        </p>
      </div>
    </div>

    <form class="form" novalidate @submit.prevent="submit">
      <div class="group">
        <label for="tx-title">Title</label>

        <input
          id="tx-title"
          ref="titleInput"
          v-model="form.title"
          type="text"
          placeholder="e.g. Monthly Salary"
          autocomplete="off"
          :maxlength="MAX_TITLE_LENGTH"
          :aria-invalid="!!errors.title"
          :aria-describedby="errors.title ? 'tx-title-error' : undefined"
        />

        <p v-if="errors.title" id="tx-title-error" class="error">
          {{ errors.title }}
        </p>
      </div>

      <div class="group">
        <label for="tx-type">Type</label>

        <select
          id="tx-type"
          v-model="form.type"
          :aria-invalid="!!errors.type"
          :aria-describedby="errors.type ? 'tx-type-error' : undefined"
          @change="onTypeChange"
        >
          <option value="">Select type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <p v-if="errors.type" id="tx-type-error" class="error">
          {{ errors.type }}
        </p>
      </div>

      <div class="group">
        <label for="tx-category">Category</label>

        <select
          id="tx-category"
          v-model="form.category"
          :disabled="!form.type"
          :aria-invalid="!!errors.category"
          :aria-describedby="errors.category ? 'tx-category-error' : undefined"
        >
          <option value="">
            {{ form.type ? 'Select category' : 'Select type first' }}
          </option>

          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>

        <p v-if="errors.category" id="tx-category-error" class="error">
          {{ errors.category }}
        </p>
      </div>

      <div class="group">
        <label for="tx-amount">Amount</label>

        <input
          id="tx-amount"
          v-model="form.amount"
          type="number"
          min="0.01"
          step="0.01"
          inputmode="decimal"
          placeholder="0.00"
          :aria-invalid="!!errors.amount"
          :aria-describedby="errors.amount ? 'tx-amount-error' : undefined"
        />

        <p v-if="errors.amount" id="tx-amount-error" class="error">
          {{ errors.amount }}
        </p>
      </div>

      <div class="group">
        <label for="tx-date">Date</label>

        <input
          id="tx-date"
          v-model="form.date"
          type="date"
          :aria-invalid="!!errors.date"
          :aria-describedby="errors.date ? 'tx-date-error' : undefined"
        />

        <p v-if="errors.date" id="tx-date-error" class="error">
          {{ errors.date }}
        </p>
      </div>

      <div class="actions">
        <button
          type="submit"
          class="submit"
          :class="{ update: isEditing }"
        >
          {{ isEditing ? '✓ Update Transaction' : '+ Add Transaction' }}
        </button>

        <button
          v-if="isEditing"
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
  scroll-margin-top: 16px;
}

.heading h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 18px;
}

.heading p {
  margin: 5px 0 0;
  color: #8b9ab3;
  font-size: 13px;
}

.form {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr 1fr 1fr;
  gap: 14px;
  align-items: start;
}

.group {
  min-width: 0;
}

.group label {
  display: block;
  margin-bottom: 7px;
  color: #9aa8bf;
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
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.group [aria-invalid='true'] {
  border-color: #ef4444;
}

.group select:disabled {
  opacity: 0.5;
}

.error {
  margin: 6px 0 0;
  color: #f87171;
  font-size: 12px;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 8px;
  align-self: end;
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
