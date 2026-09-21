<script setup>
import { computed } from 'vue';

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

const formatCurrency = value => {
  return `৳ ${new Intl.NumberFormat('en-BD').format(value)}`;
};

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
  '#64748b'
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

const monthlyData = computed(() => {
  const income = Array(12).fill(0);
  const expense = Array(12).fill(0);

  props.transactions.forEach(trans => {
    if (!trans.date) {
      return;
    }

    const month = new Date(
      `${trans.date}T00:00:00`
    ).getMonth();

    if (trans.type === 'income') {
      income[month] += Number(trans.amount);
    }

    if (trans.type === 'expense') {
      expense[month] += Number(trans.amount);
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
        color: '#94a3b8',

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
        color: '#94a3b8',

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
        color: '#64748b',

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
        color: '#64748b',

        font: {
          size: 11
        },

        callback: value => {
          return `৳ ${new Intl.NumberFormat(
            'en-BD',
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

      </div>

      <div
        v-if="transactions.length"
        class="bar-wrapper"
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
          No transaction data available
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

.chart-heading h3 {
  margin: 0;

  color: #f8fafc;

  font-size: 18px;
}

.chart-heading p {
  margin: 5px 0 0;

  color: #64748b;

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

  color: #64748b;
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