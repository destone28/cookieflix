// src/services/apiConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'  // URL del backend
});

// Interceptor per aggiungere il token di autenticazione
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire gli errori di risposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se riceviamo un 401 (non autorizzato), l'utente deve effettuare il login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;