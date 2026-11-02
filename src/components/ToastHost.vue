<script setup>
import { useToast } from '../composables/useToast.js';

const { toasts, dismissToast } = useToast();

const runAction = (toastItem) => {
  toastItem.action?.handler();
  dismissToast(toastItem.id);
};
</script>

<template>
  <div
    class="toast-host"
    role="status"
    aria-live="polite"
    aria-atomic="false"
  >
    <div
      v-for="item in toasts"
      :key="item.id"
      class="toast"
      :class="item.type"
    >
      <span class="message">{{ item.message }}</span>

      <button
        v-if="item.action"
        type="button"
        class="action"
        @click="runAction(item)"
      >
        {{ item.action.label }}
      </button>

      <button
        type="button"
        class="close"
        aria-label="Dismiss notification"
        @click="dismissToast(item.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(380px, calc(100% - 32px));
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #26344d;
  border-left-width: 4px;
  border-radius: 10px;
  background: #162033;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.toast.success {
  border-left-color: #22c55e;
}

.toast.error {
  border-left-color: #ef4444;
}

.toast.info {
  border-left-color: #3b82f6;
}

.message {
  flex: 1;
}

.action {
  border: none;
  background: transparent;
  color: #60a5fa;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
}

.action:hover {
  background: rgba(96, 165, 250, 0.12);
}

.close {
  border: none;
  background: transparent;
  color: #8b9ab3;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
}

.close:hover {
  color: #fff;
}

@media (max-width: 480px) {
  .toast-host {
    right: 12px;
    left: 12px;
    width: auto;
  }
}
</style>
