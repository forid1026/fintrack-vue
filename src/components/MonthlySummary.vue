<script setup>
defineProps({
  income: Number,
  expense: Number,
  balance: Number
});

const formatAmount = amount => {
  return new Intl.NumberFormat('en-BD').format(
    Number(amount)
  );
};
</script>

<template>
  <section class="monthly-card">

    <div class="heading">

      <div>
        <h3>This Month</h3>

        <p>
          Current month financial summary
        </p>
      </div>

      <span class="badge">
        {{
          new Date().toLocaleDateString(
            'en-BD',
            {
              month: 'long',
              year: 'numeric'
            }
          )
        }}
      </span>

    </div>

    <div class="monthly-grid">

      <div>
        <span>Income</span>

        <strong class="green">
          + ৳ {{ formatAmount(income) }}
        </strong>
      </div>

      <div>
        <span>Expense</span>

        <strong class="red">
          - ৳ {{ formatAmount(expense) }}
        </strong>
      </div>

      <div>
        <span>Net Balance</span>

        <strong>
          ৳ {{ formatAmount(balance) }}
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

  color: #64748b;

  font-size: 13px;
}

.badge {
  background: #172033;

  color: #94a3b8;

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

  color: #64748b;

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