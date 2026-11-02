<template>
  <div class="skeleton-grid" aria-hidden="true">
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.5fr;
  gap: 18px;
  margin-top: 18px;
}

.skeleton {
  height: 392px;
  border: 1px solid #1f2b40;
  border-radius: 14px;
  background: #111827;
}

@media (max-width: 850px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
