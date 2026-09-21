<script setup>
defineProps({
  totalIncome: Number,
  totalExpense: Number,
  totalBalance: Number
});

const formatAmount = amount => {
  return new Intl.NumberFormat('en-BD').format(
    Number(amount)
  );
};
</script>

<template>
  <section class="summary-grid">

    <div class="summary-card">

      <div class="summary-icon income">
        ↗
      </div>

      <div>
        <span>Total Income</span>

        <strong>
          ৳ {{ formatAmount(totalIncome) }}
        </strong>
      </div>

    </div>

    <div class="summary-card">

      <div class="summary-icon expense">
        ↘
      </div>

      <div>
        <span>Total Expense</span>

        <strong>
          ৳ {{ formatAmount(totalExpense) }}
        </strong>
      </div>

    </div>

    <div class="summary-card">

      <div class="summary-icon balance">
        ৳
      </div>

      <div>
        <span>Balance</span>

        <strong
          :class="{
            negative: totalBalance < 0
          }"
        >
          ৳ {{ formatAmount(totalBalance) }}
        </strong>
      </div>

    </div>

  </section>
</template>

<style scoped>
.summary-grid {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 16px;
}

.summary-card {
  padding: 22px;

  background: #111827;

  border: 1px solid #1f2b40;

  border-radius: 14px;

  display: flex;
  align-items: center;
  gap: 15px;
}

.summary-icon {
  width: 45px;
  height: 45px;

  border-radius: 11px;

  display: grid;
  place-items: center;

  font-size: 20px;
  font-weight: 800;
}

.income {
  background: #0d2b1d;
  color: #22c55e;
}

.expense {
  background: #30161b;
  color: #ef4444;
}

.balance {
  background: #18233b;
  color: #60a5fa;
}

.summary-card span {
  display: block;

  color: #64748b;

  font-size: 13px;

  margin-bottom: 5px;
}

.summary-card strong {
  font-size: 21px;

  color: #f8fafc;
}

.summary-card strong.negative {
  color: #ef4444;
}

@media (max-width: 700px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>