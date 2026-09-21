<script setup>
defineProps({
  expenses: {
    type: Array,
    default: () => []
  },

  highestExpense: {
    type: Number,
    default: 0
  }
});

const formatAmount = amount => {
  return new Intl.NumberFormat('en-BD').format(
    Number(amount)
  );
};
</script>

<template>
  <section
    v-if="expenses.length"
    class="card"
  >

    <div class="heading">
      <div>
        <h3>Expense Breakdown</h3>

        <p>
          Where your money is going
        </p>
      </div>
    </div>

    <div class="list">

      <div
        v-for="item in expenses"
        :key="item.category"
        class="item"
      >

        <div class="top">

          <span>
            {{ item.category }}
          </span>

          <strong>
            ৳ {{ formatAmount(item.amount) }}
          </strong>

        </div>

        <div class="progress">

          <div
            class="bar"
            :style="{
              width:
                highestExpense
                  ? `${(item.amount / highestExpense) * 100}%`
                  : '0%'
            }"
          ></div>

        </div>

      </div>

    </div>

  </section>
</template>

<style scoped>
.card {
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

.list {
  margin-top: 20px;
}

.item {
  margin-bottom: 18px;
}

.item:last-child {
  margin-bottom: 0;
}

.top {
  display: flex;

  justify-content: space-between;

  margin-bottom: 7px;

  font-size: 13px;
}

.top span {
  color: #cbd5e1;
}

.top strong {
  color: #e5e7eb;
}

.progress {
  height: 7px;

  background: #1c2738;

  border-radius: 20px;

  overflow: hidden;
}

.bar {
  height: 100%;

  background: #2563eb;

  border-radius: inherit;
}
</style>