import { createApp } from 'vue';
import App from './App.vue';
import { toast } from './composables/useToast.js';
import './assets/main.css';

const app = createApp(App);

// Last line of defence: never leave the user with a silent failure.
app.config.errorHandler = (error, _instance, info) => {
  console.error('[FinTrack]', info, error);
  toast.error('Something went wrong. Please try again.');
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('[FinTrack] Unhandled rejection', event.reason);
});

app.mount('#app');

// Offline support (production builds only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((error) => console.warn('[FinTrack] SW registration failed', error));
  });
}
