// File di costanti globali dell'applicazione

// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Mappatura periodi di fatturazione
export const BILLING_PERIODS = {
  monthly: 'Mensile',
  quarterly: 'Trimestrale',
  semiannual: 'Semestrale',
  annual: 'Annuale'
};

// Percentuali di sconto per periodo
export const DISCOUNT_PERCENTAGES = {
  monthly: 0,
  quarterly: 10,
  semiannual: 20,
  annual: 30
};

// Configurazione paginazione
export const PAGINATION = {
  itemsPerPage: 12,
  maxPagesToShow: 5
};

// Testo per modalità sviluppo
export const DEV_MODE_BANNER = 'Ambiente di sviluppo - I dati potrebbero essere resettati';

// Timeout per toast
export const TOAST_TIMEOUT = 5000; // 5 secondi

// Versione dell'app
export const APP_VERSION = '0.1.0';