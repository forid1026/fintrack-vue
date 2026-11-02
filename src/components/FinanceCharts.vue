<script setup>
import { computed, ref, watch } from 'vue';
import { CURRENCY_SYMBOL, LOCALE } from '../config.js';
import { money } from '../utils/format.js';
import { yearOf, monthIndexOf } from '../utils/date.js';
import { round2 } from '../utils/money.js';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

import { Doughnut, Bar } from 'vue-chartjs';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  }
});

// =========================
// Currency Formatter
// =========================

const formatCurrency = money;

// =========================
// Chart Colors
// =========================

const chartColors = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#8b9ab3'
];

// =========================
// Expense Doughnut Data
// =========================

const expenseData = computed(() => {
  const categories = {};

  props.transactions
    .filter(trans => trans.type === 'expense')
    .forEach(trans => {
      categories[trans.category] =
        (categories[trans.category] || 0) +
        Number(trans.amount);
    });

  const entries = Object.entries(categories);

  return {
    labels: entries.map(item => item[0]),

    datasets: [
      {
        data: entries.map(item => item[1]),

        backgroundColor: chartColors.slice(
          0,
          entries.length
        ),

        borderColor: '#111827',

        borderWidth: 3,

        hoverOffset: 6
      }
    ]
  };
});

// =========================
// Monthly Income / Expense
// =========================

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

// Years that actually have data (newest first), always including this year.
const availableYears = computed(() => {
  const years = new Set([new Date().getFullYear()]);

  props.transactions.forEach(trans => years.add(yearOf(trans.date)));

  return [...years].sort((a, b) => b - a);
});

const selectedYear = ref(availableYears.value[0]);

// If the selected year disappears (e.g. data deleted), fall back.
watch(availableYears, years => {
  if (!years.includes(selectedYear.value)) {
    selectedYear.value = years[0];
  }
});

const hasYearData = computed(() =>
  props.transactions.some(trans => yearOf(trans.date) === selectedYear.value)
);

const monthlyData = computed(() => {
  const income = Array(12).fill(0);
  const expense = Array(12).fill(0);

  props.transactions.forEach(trans => {
    if (yearOf(trans.date) !== selectedYear.value) {
      return;
    }

    const month = monthIndexOf(trans.date);

    if (trans.type === 'income') {
      income[month] = round2(income[month] + Number(trans.amount));
    }

    if (trans.type === 'expense') {
      expense[month] = round2(expense[month] + Number(trans.amount));
    }
  });

  return {
    labels: monthNames,

    datasets: [
      {
        label: 'Income',

        data: income,

        backgroundColor: '#22c55e',

        borderRadius: 6,

        borderSkipped: false
      },

      {
        label: 'Expense',

        data: expense,

        backgroundColor: '#ef4444',

        borderRadius: 6,

        borderSkipped: false
      }
    ]
  };
});

// =========================
// Doughnut Options
// =========================

const doughnutOptions = {
  responsive: true,

  maintainAspectRatio: false,

  cutout: '68%',

  plugins: {
    legend: {
      position: 'bottom',

      labels: {
        color: '#9aa8bf',

        padding: 16,

        usePointStyle: true,

        pointStyle: 'circle'
      }
    },

    tooltip: {
      callbacks: {
        label: context => {
          const value = context.raw;

          return ` ${formatCurrency(value)}`;
        }
      }
    }
  }
};

// =========================
// Bar Options
// =========================

const barOptions = {
  responsive: true,

  maintainAspectRatio: false,

  interaction: {
    mode: 'index',
    intersect: false
  },

  plugins: {
    legend: {
      position: 'bottom',

      labels: {
        color: '#9aa8bf',

        padding: 16,

        usePointStyle: true,

        pointStyle: 'circle'
      }
    },

    tooltip: {
      callbacks: {
        label: context => {
          return ` ${context.dataset.label}: ${formatCurrency(
            context.raw
          )}`;
        }
      }
    }
  },

  scales: {
    x: {
      ticks: {
        color: '#8b9ab3',

        font: {
          size: 11
        }
      },

      grid: {
        display: false
      },

      border: {
        display: false
      }
    },

    y: {
      beginAtZero: true,

      ticks: {
        color: '#8b9ab3',

        font: {
          size: 11
        },

        callback: value => {
          return `${CURRENCY_SYMBOL} ${new Intl.NumberFormat(
            LOCALE,
            {
              notation: 'compact',
              maximumFractionDigits: 1
            }
          ).format(value)}`;
        }
      },

      grid: {
        color: '#1f2b40'
      },

      border: {
        display: false
      }
    }
  }
};
</script>

<template>
  <section class="charts-grid">

    <!-- =========================
         Expense Distribution
    ========================== -->

    <div class="chart-card">

      <div class="chart-heading">

        <div>
          <h3>Expense Distribution</h3>

          <p>
            See where your money is going
          </p>
        </div>

      </div>

      <div
        v-if="
          transactions.some(
            trans => trans.type === 'expense'
          )
        "
        class="doughnut-wrapper"
        role="img"
        aria-label="Expense distribution by category"
      >
        <Doughnut
          :data="expenseData"
          :options="doughnutOptions"
        />
      </div>

      <div
        v-else
        class="chart-empty"
      >
        <span>📊</span>

        <p>
          No expense data available
        </p>
      </div>

    </div>

    <!-- =========================
         Income vs Expense
    ========================== -->

    <div class="chart-card">

      <div class="chart-heading">

        <div>
          <h3>Income vs Expense</h3>

          <p>
            Monthly financial overview
          </p>
        </div>

        <select
          v-model="selectedYear"
          class="year-select"
          aria-label="Select year"
        >
          <option
            v-for="year in availableYears"
            :key="year"
            :value="year"
          >
            {{ year }}
          </option>
        </select>

      </div>

      <div
        v-if="hasYearData"
        class="bar-wrapper"
        role="img"
        :aria-label="`Income versus expense by month for ${selectedYear}`"
      >
        <Bar
          :data="monthlyData"
          :options="barOptions"
        />
      </div>

      <div
        v-else
        class="chart-empty"
      >
        <span>📈</span>

        <p>
          No transactions in {{ selectedYear }}
        </p>
      </div>

    </div>

  </section>
</template>

<style scoped>
.charts-grid {
  display: grid;

  grid-template-columns:
    0.9fr 1.5fr;

  gap: 18px;

  margin-top: 18px;
}

.chart-card {
  background: #111827;

  border: 1px solid #1f2b40;

  border-radius: 14px;

  padding: 22px;

  min-width: 0;
}

.chart-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.year-select {
  background: #172033;
  color: #cbd5e1;
  border: 1px solid #26344d;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.chart-heading h3 {
  margin: 0;

  color: #f8fafc;

  font-size: 18px;
}

.chart-heading p {
  margin: 5px 0 0;

  color: #8b9ab3;

  font-size: 13px;
}

.doughnut-wrapper {
  height: 310px;

  margin-top: 18px;
}

.bar-wrapper {
  height: 310px;

  margin-top: 18px;
}

.chart-empty {
  height: 310px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: #8b9ab3;
}

.chart-empty span {
  font-size: 35px;

  margin-bottom: 10px;
}

.chart-empty p {
  margin: 0;

  font-size: 13px;
}

@media (max-width: 850px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .chart-card {
    padding: 16px;
  }

  .doughnut-wrapper,
  .bar-wrapper,
  .chart-empty {
    height: 270px;
  }
}
</style>