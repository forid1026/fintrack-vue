<script setup>
defineProps({
  transactions: {
    type: Array,
    default: () => []
  },

  editingId: {
    default: null
  }
});

const emit = defineEmits([
  'edit',
  'delete'
]);

const formatAmount = amount => {
  return new Intl.NumberFormat('en-BD').format(
    Number(amount)
  );
};

const formatDate = date => {
  if (!date) {
    return '';
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getIcon = category => {
  const icons = {
    Groceries: '🛒',
    Utilities: '💡',
    Entertainment: '🎬',
    Restaurants: '🍔',
    Travel: '✈️',
    Clothing: '👕',
    Healthcare: '🏥',
    Personal: '👤',
    Education: '📚',
    Salary: '💼',
    Freelance: '💻',
    Business: '🏢',
    Investment: '📈',
    Bonus: '🎁',
    Gift: '🎁',
    Other: '📌'
  };

  return icons[category] || '💰';
};
</script>

<template>
  <div class="list">

    <div
      v-for="trans in transactions"
      :key="trans.id"
      class="transaction"
      :class="{
        editing:
          editingId === trans.id
      }"
    >

      <div
        class="icon"
        :class="trans.type"
      >
        {{ getIcon(trans.category) }}
      </div>

      <div class="info">

        <h4>
          {{ trans.title }}
        </h4>

        <div class="meta">

          <span>
            {{ trans.category }}
          </span>

          <span>•</span>

          <span>
            {{ formatDate(trans.date) }}
          </span>

        </div>

      </div>

      <div
        class="type"
        :class="trans.type"
      >
        {{
          trans.type === 'income'
            ? 'Income'
            : 'Expense'
        }}
      </div>

      <div
        class="amount"
        :class="trans.type"
      >
        {{
          trans.type === 'income'
            ? '+'
            : '-'
        }}
        ৳ {{ formatAmount(trans.amount) }}
      </div>

      <div class="actions">

        <button
          class="edit"
          title="Edit"
          @click="emit('edit', trans)"
        >
          ✎
        </button>

        <button
          class="delete"
          title="Delete"
          @click="emit('delete', trans.id)"
        >
          ×
        </button>

      </div>

    </div>

  </div>
</template>

<style scoped>
.list {
  margin-top: 10px;
}

.transaction {
  display: grid;

  grid-template-columns:
    45px 1fr auto auto auto;

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

.info h4 {
  margin: 0 0 5px;

  color: #e5e7eb;

  font-size: 14px;
}

.meta {
  display: flex;

  gap: 7px;

  color: #64748b;

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
  color: #ef4444;
}

.amount {
  min-width: 115px;

  text-align: right;

  font-weight: 700;
}

.amount.income {
  color: #22c55e;
}

.amount.expense {
  color: #ef4444;
}

.actions {
  display: flex;

  gap: 6px;
}

.actions button {
  width: 31px;
  height: 31px;

  border-radius: 7px;

  border: 1px solid #29364d;

  background: #172033;

  cursor: pointer;
}

.edit {
  color: #60a5fa;
}

.delete {
  color: #ef4444;
}

.actions button:hover {
  background: #25334b;
}

@media (max-width: 700px) {
  .transaction {
    grid-template-columns:
      42px 1fr auto;
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