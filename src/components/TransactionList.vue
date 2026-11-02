<script setup>
import { CATEGORY_ICONS } from '../constants/categories.js';
import { money, formatDate } from '../utils/format.js';

defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  editingId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['edit', 'delete']);

const getIcon = (category) => CATEGORY_ICONS[category] || '💰';
</script>

<template>
  <ul class="list">
    <li
      v-for="trans in transactions"
      :key="trans.id"
      class="transaction"
      :class="{ editing: editingId === trans.id }"
    >
      <div class="icon" :class="trans.type" aria-hidden="true">
        {{ getIcon(trans.category) }}
      </div>

      <div class="info">
        <h4>{{ trans.title }}</h4>

        <div class="meta">
          <span>{{ trans.category }}</span>
          <span aria-hidden="true">•</span>
          <span>{{ formatDate(trans.date) }}</span>
        </div>
      </div>

      <div class="type" :class="trans.type">
        {{ trans.type === 'income' ? 'Income' : 'Expense' }}
      </div>

      <div class="amount" :class="trans.type">
        {{ trans.type === 'income' ? '+' : '-' }}
        {{ money(trans.amount) }}
      </div>

      <div class="actions">
        <button
          type="button"
          class="edit"
          :title="`Edit ${trans.title}`"
          :aria-label="`Edit ${trans.title}`"
          @click="emit('edit', trans)"
        >
          ✎
        </button>

        <button
          type="button"
          class="delete"
          :title="`Delete ${trans.title}`"
          :aria-label="`Delete ${trans.title}`"
          @click="emit('delete', trans.id)"
        >
          ×
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.transaction {
  display: grid;
  grid-template-columns: 45px 1fr auto auto auto;
  align-items: center;
  gap: 15px;
  padding: 16px 4px;
  border-bottom: 1px solid #1c2738;
}

.transaction:last-child {
  border-bottom: none;
}

.transaction.editing {
  background: #172033;
  border-radius: 9px;
  padding-left: 10px;
  padding-right: 10px;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #192337;
  font-size: 19px;
}

.icon.income {
  background: #0e2b1d;
}

.icon.expense {
  background: #30171c;
}

.info {
  min-width: 0;
}

.info h4 {
  margin: 0 0 5px;
  color: #e5e7eb;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  color: #8b9ab3;
  font-size: 11px;
}

.type {
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 11px;
}

.type.income {
  background: #0e2b1d;
  color: #22c55e;
}

.type.expense {
  background: #30171c;
  color: #f87171;
}

.amount {
  min-width: 115px;
  text-align: right;
  font-weight: 700;
  white-space: nowrap;
}

.amount.income {
  color: #22c55e;
}

.amount.expense {
  color: #f87171;
}

.actions {
  display: flex;
  gap: 6px;
}

.actions button {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  border: 1px solid #29364d;
  background: #172033;
  cursor: pointer;
}

.edit {
  color: #60a5fa;
}

.delete {
  color: #f87171;
}

.actions button:hover {
  background: #25334b;
}

@media (max-width: 700px) {
  .transaction {
    grid-template-columns: 42px 1fr auto;
  }

  .type {
    display: none;
  }

  .amount {
    grid-column: 2;
    text-align: left;
    min-width: auto;
  }

  .actions {
    grid-column: 3;
    grid-row: 1;
  }
}
</style>
