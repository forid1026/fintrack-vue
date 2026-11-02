import { ref } from 'vue';

// Module-level state: one toast queue shared by the whole app.
const toasts = ref([]);
let nextId = 1;
const timers = new Map();

export function dismissToast(id) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

function push(type, message, { action = null, duration = 4000 } = {}) {
  const id = nextId++;
  // Keep the stack short.
  toasts.value = [...toasts.value.slice(-3), { id, type, message, action }];
  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismissToast(id), duration),
    );
  }
  return id;
}

export const toast = {
  success: (message, options) => push('success', message, options),
  error: (message, options) =>
    push('error', message, { duration: 7000, ...options }),
  info: (message, options) => push('info', message, options),
};

export function useToast() {
  return { toasts, toast, dismissToast };
}
