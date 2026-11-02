<script setup>
import { money, formatMonth } from '../utils/format.js';

defineProps({
  income: Number,
  expense: Number,
  balance: Number,
  month: { type: String, required: true },
  monthOptions: { type: Array, default: () => [] }
});

defineEmits(['update:month']);
</script>


<template>
  <section class="monthly-card" aria-labelledby="monthly-title">

    <div class="heading">
      <div>
        <h3 id="monthly-title">Monthly Summary</h3>
        <p>Pick a month to review</p>
      </div>

      <select
        class="month-select"
        aria-label="Select month"
        :value="month"
        @change="$emit('update:month', $event.target.value)"
      >
        <option
          v-for="key in monthOptions"
          :key="key"
          :value="key"
        >
          {{ formatMonth(key) }}
        </option>
      </select>
    </div>


    <div class="monthly-grid">
      <div>
        <span>Income</span>
        <strong class="green">
          + {{ money(income) }}
        </strong>
      </div>

      <div>
        <span>Expense</span>
        <strong class="red">
          - {{ money(expense) }}
        </strong>
      </div>

      <div>
        <span>Net Balance</span>
        <strong :class="{ red: balance < 0 }">
          {{ money(balance) }}
        </strong>
      </div>
    </div>

  </section>
</template>


<style scoped>
.monthly-card {
  margin-top: 18px;

  background: #111827;

  border: 1px solid #1f2b40;

  border-radius: 14px;

  padding: 22px;
}

.heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.badge {
  background: #172033;

  color: #9aa8bf;

  padding: 7px 11px;

  border-radius: 7px;

  font-size: 12px;
}

.monthly-grid {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  margin-top: 22px;

  gap: 20px;
}

.monthly-grid > div {
  padding-right: 20px;

  border-right: 1px solid #1f2b40;
}

.monthly-grid > div:last-child {
  border-right: none;
}

.monthly-grid span {
  display: block;

  color: #8b9ab3;

  font-size: 12px;

  margin-bottom: 6px;
}

.monthly-grid strong {
  font-size: 17px;

  color: #e5e7eb;
}

.green {
  color: #22c55e !important;
}

.red {
  color: #ef4444 !important;
}

@media (max-width: 700px) {
  .monthly-grid {
    grid-template-columns: 1fr;
  }

  .monthly-grid > div {
    border-right: none;

    border-bottom: 1px solid #1f2b40;

    padding: 0 0 15px;
  }

  .monthly-grid > div:last-child {
    border-bottom: none;

    padding-bottom: 0;
  }
}
</style>