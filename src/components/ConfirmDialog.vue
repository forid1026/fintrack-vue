<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  danger: { type: Boolean, default: false }
});

const emit = defineEmits(['confirm', 'cancel']);

const dialog = ref(null);
const cancelButton = ref(null);

// The native <dialog> gives us focus trapping, Esc handling and a backdrop.
watch(
  () => props.open,
  async (isOpen) => {
    const el = dialog.value;
    if (!el) {
      return;
    }
    if (isOpen && !el.open) {
      el.showModal();
      await nextTick();
      cancelButton.value?.focus();
    } else if (!isOpen && el.open) {
      el.close();
    }
  }
);

const onBackdropClick = (event) => {
  if (event.target === dialog.value) {
    emit('cancel');
  }
};
</script>

<template>
  <dialog
    ref="dialog"
    class="dialog"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
    @cancel.prevent="emit('cancel')"
    @click="onBackdropClick"
  >
    <div class="body">
      <h3 id="confirm-title">{{ title }}</h3>
      <p id="confirm-message">{{ message }}</p>

      <div class="buttons">
        <button
          ref="cancelButton"
          type="button"
          class="btn cancel"
          @click="emit('cancel')"
        >
          Cancel
        </button>

        <button
          type="button"
          class="btn confirm"
          :class="{ danger }"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(420px, calc(100% - 32px));
  padding: 0;
  border: 1px solid #26344d;
  border-radius: 14px;
  background: #111827;
  color: #e2e8f0;
}

.dialog::backdrop {
  background: rgba(2, 6, 23, 0.75);
}

.body {
  padding: 24px;
}

h3 {
  margin: 0 0 8px;
  color: #f8fafc;
  font-size: 18px;
}

p {
  margin: 0;
  color: #9aa8bf;
  font-size: 14px;
  line-height: 1.6;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.cancel {
  background: #273449;
  color: #cbd5e1;
}

.cancel:hover {
  background: #31405a;
}

.confirm {
  background: #2563eb;
  color: #fff;
}

.confirm.danger {
  background: #dc2626;
}

.confirm:hover {
  filter: brightness(1.1);
}
</style>
