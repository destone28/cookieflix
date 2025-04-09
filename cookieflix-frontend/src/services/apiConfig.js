import axios from 'axios';

// Base URL dell'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Istanza axios con configurazioni comuni
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercetta le richieste per aggiungere il token di autenticazione
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercetta le risposte per gestire gli errori comuni
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestione errori comuni
    if (error.response?.status === 401) {
      // Token non valido o scaduto
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;