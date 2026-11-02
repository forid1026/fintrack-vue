<script setup>
import { ref } from 'vue';

defineProps({
  transactionCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['export-csv', 'export-json', 'import-file']);

const fileInput = ref(null);

const onFileChange = (event) => {
  const file = event.target.files?.[0];

  if (file) {
    emit('import-file', file);
  }

  // Allow selecting the same file again.
  event.target.value = '';
};
</script>

<template>
  <header class="header">
    <div class="brand">
      <div class="brand-icon" aria-hidden="true">
        ↗
      </div>

      <div>
        <h1>FinTrack</h1>
        <p>Personal Finance Tracker</p>
      </div>
    </div>

    <div class="header-actions">
      <span class="count" aria-live="polite">
        {{ transactionCount }}
        {{ transactionCount === 1 ? 'Transaction' : 'Transactions' }}
      </span>

      <button
        type="button"
        class="header-btn"
        title="Import transactions from a CSV or JSON backup"
        @click="fileInput.click()"
      >
        ↑ Import
      </button>

      <button
        type="button"
        class="header-btn"
        title="Download a full JSON backup"
        :disabled="!transactionCount"
        @click="emit('export-json')"
      >
        ⤓ Backup
      </button>

      <button
        type="button"
        class="header-btn"
        :disabled="!transactionCount"
        @click="emit('export-csv')"
      >
        ↓ Export CSV
      </button>

      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept=".csv,.json,text/csv,application/json"
        tabindex="-1"
        aria-hidden="true"
        @change="onFileChange"
      />
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
  flex-wrap: wrap;
  gap: 16px 20px;
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
  color: #8b9ab3;
  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.count {
  margin-right: 4px;
  color: #8b9ab3;
  font-size: 12px;
}

.header-btn {
  border: 1px solid #26344d;
  background: #121a2b;
  color: #cbd5e1;
  padding: 10px 15px;
  border-radius: 9px;
  font-size: 13px;
  cursor: pointer;
}

.header-btn:hover:not(:disabled) {
  background: #182238;
  color: #fff;
}

.header-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

@media (max-width: 650px) {
  .count {
    display: none;
  }
}

@media (max-width: 450px) {
  .header {
    width: calc(100% - 24px);
  }

  .header-btn {
    padding: 9px 12px;
    font-size: 12px;
  }
}
</style>
