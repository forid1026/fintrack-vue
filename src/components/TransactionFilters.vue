<script setup>
defineProps({
  search: {
    type: String,
    default: ''
  },
  typeFilter: {
    type: String,
    default: 'all'
  },
  categoryFilter: {
    type: String,
    default: 'all'
  },
  categories: {
    type: Array,
    default: () => []
  }
});

defineEmits([
  'update:search',
  'update:typeFilter',
  'update:categoryFilter'
]);
</script>

<template>
  <div class="filters-card">

    <div class="filters-header">
      <div>
        <h3>Transactions</h3>
        <p>Search and filter your transactions</p>
      </div>
    </div>

    <div class="filters-grid">

      <!-- Search -->
      <div class="filter-group search-group">
        <label>Search</label>

        <div class="input-wrapper">
          <span class="input-icon">⌕</span>

          <input
            :value="search"
            type="text"
            placeholder="Search transactions..."
            @input="$emit('update:search', $event.target.value)"
          />
        </div>
      </div>

      <!-- Type -->
      <div class="filter-group">
        <label>Type</label>

        <select
          :value="typeFilter"
          @change="$emit('update:typeFilter', $event.target.value)"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <!-- Category -->
      <div class="filter-group">
        <label>Category</label>

        <select
          :value="categoryFilter"
          @change="$emit('update:categoryFilter', $event.target.value)"
        >
          <option value="all">All Categories</option>

          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

    </div>

  </div>
</template>

<style scoped>
.filters-card {
  background: #111827;
  border: 1px solid #1f2b40;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 20px;
}

.filters-header {
  margin-bottom: 18px;
}

.filters-header h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 17px;
  font-weight: 700;
}

.filters-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(160px, 1fr) minmax(180px, 1fr);
  gap: 14px;
}

.filter-group {
  min-width: 0;
}

.filter-group label {
  display: block;
  margin-bottom: 7px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 13px;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 20px;
  line-height: 1;
  pointer-events: none;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  border: 1px solid #263449;
  border-radius: 10px;
  background: #0b1120;
  color: #e2e8f0;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  transition: 0.2s ease;
}
input {
  padding: 0 14px 0 40px;
}

select {
  padding: 0 38px 0 14px;
  cursor: pointer;
  appearance: none;

  background-image:
    linear-gradient(45deg, transparent 50%, #64748b 50%),
    linear-gradient(135deg, #64748b 50%, transparent 50%);
  background-position:
    calc(100% - 17px) 19px,
    calc(100% - 12px) 19px;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
}

input::placeholder {
  color: #475569;
}

input:hover,
select:hover {
  border-color: #334155;
}

input:focus,
select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.10);
}

select option {
  background: #111827;
  color: #e2e8f0;
}

/* Tablet */
@media (max-width: 850px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  .search-group {
    grid-column: 1 / -1;
  }
}

/* Mobile */
@media (max-width: 520px) {
  .filters-card {
    padding: 18px;
    border-radius: 14px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .search-group {
    grid-column: auto;
  }

  .filters-header {
    margin-bottom: 15px;
  }

  .filters-header h3 {
    font-size: 16px;
  }

  .filters-header p {
    font-size: 12px;
  }
}
</style>
