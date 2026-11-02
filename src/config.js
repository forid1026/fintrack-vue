// App-wide configuration. Override via .env (see .env.example).
const env = import.meta.env ?? {};

export const APP_NAME = 'FinTrack';
export const CURRENCY_SYMBOL = env.VITE_CURRENCY_SYMBOL || '৳';
export const LOCALE = env.VITE_LOCALE || 'en-BD';

export const STORAGE_KEY = 'fintrack_transactions';
export const PAGE_SIZE = 20;
