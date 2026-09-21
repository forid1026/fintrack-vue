<script setup>
defineProps({
  transactionCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  'export'
]);
</script>

<template>
  <header class="header">

    <div class="brand">

      <div class="brand-icon">
        ↗
      </div>

      <div>
        <h1>FinTrack</h1>

        <p>
          Personal Finance Tracker
        </p>
      </div>

    </div>

    <div class="header-actions">

      <span class="count">
        {{ transactionCount }}
        {{ transactionCount === 1
          ? 'Transaction'
          : 'Transactions'
        }}
      </span>

      <button
        class="export-btn"
        @click="emit('export')"
      >
        ↓ Export CSV
      </button>

    </div>

  </header>
</template>

<style scoped>
.header {
  width: min(1180px, calc(100% - 32px));
  margin: auto;
  padding: 26px 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.brand-icon {
  width: 45px;
  height: 45px;

  display: grid;
  place-items: center;

  border-radius: 13px;

  background: #172033;
  border: 1px solid #26344d;

  color: #22c55e;

  font-size: 25px;
  font-weight: 800;
}

.brand h1 {
  margin: 0;

  color: #f8fafc;

  font-size: 22px;
}

.brand p {
  margin: 3px 0 0;

  color: #64748b;

  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  color: #64748b;
  font-size: 12px;
}

.export-btn {
  border: 1px solid #26344d;

  background: #121a2b;
  color: #cbd5e1;

  padding: 10px 15px;

  border-radius: 9px;

  cursor: pointer;
}

.export-btn:hover {
  background: #182238;
  color: #fff;
}

@media (max-width: 650px) {
  .count {
    display: none;
  }
}

@media (max-width: 450px) {
  .header {
    width: calc(100% - 20px);
  }

  .header-actions {
    display: none;
  }
}
</style>