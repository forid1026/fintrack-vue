<script setup>
defineProps({
  search: { type: String, default: '' },
  typeFilter: { type: String, default: 'all' },
  categoryFilter: { type: String, default: 'all' },
  sort: { type: String, default: 'newest' },
  categories: { type: Array, default: () => [] }
});

defineEmits([
  'update:search',
  'update:typeFilter',
  'update:categoryFilter',
  'update:sort'
]);
</script>


<template>
  <div class="filters-card">

    <div class="filters-header">
      <div>
        <h3>Transactions</h3>
        <p>Search, filter and sort your transactions</p>
      </div>
    </div>

    <div class="filters-grid">

      <div class="filter-group search-group">
        <label for="filter-search">Search</label>

        <div class="input-wrapper">
          <span class="input-icon" aria-hidden="true">⌕</span>

          <input
            id="filter-search"
            :value="search"
            type="text"
            inputmode="search"
            placeholder="Search transactions..."
            autocomplete="off"
            @input="$emit('update:search', $event.target.value)"
          />
        </div>
      </div>

      <div class="filter-group">
        <label for="filter-type">Type</label>

        <select
          id="filter-type"
          :value="typeFilter"
          @change="$emit('update:typeFilter', $event.target.value)"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-category">Category</label>

        <select
          id="filter-category"
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

      <div class="filter-group">
        <label for="filter-sort">Sort by</label>

        <select
          id="filter-sort"
          :value="sort"
          @change="$emit('update:sort', $event.target.value)"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
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
  color: #8b9ab3;
  font-size: 13px;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(140px, 1fr) minmax(160px, 1fr) minmax(150px, 1fr);
  gap: 14px;
}

.filter-group {
  min-width: 0;
}

.filter-group label {
  display: block;
  margin-bottom: 7px;
  color: #9aa8bf;
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
  color: #8b9ab3;
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
    linear-gradient(45deg, transparent 50%, #8b9ab3 50%),
    linear-gradient(135deg, #8b9ab3 50%, transparent 50%);
  background-position:
    calc(100% - 17px) 19px,
    calc(100% - 12px) 19px;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
}

input::placeholder {
  color: #7b8aa3;
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
