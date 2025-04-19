// src/services/apiConfig.js
import axios from 'axios';

// Configurazione basata sull'ambiente (Vite usa import.meta.env)
const API_URL = '/api'; // Usiamo il proxy configurato in vite.config.js

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 secondi di timeout per le richieste
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
    console.error('Request error:', error);
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
      
      // Verifichiamo di non essere già sulla pagina di login per evitare loop
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Funzione helper per recuperare dati
 * @param {string} url - L'endpoint da chiamare
 * @param {Object} params - Parametri della query
 * @param {Object} options - Opzioni aggiuntive
 * @returns {Promise} Promise con i dati della risposta
 */
export const fetchData = async (url, params = {}, options = {}) => {
  try {
    const response = await api.get(url, { params, ...options });
    return response.data;
  } catch (error) {
    if (options && options.useMock) {
      console.warn(`Using mock data for ${url}`);
      return options.mockData || null;
    }
    throw error;
  }
};

/**
 * Funzione helper per inviare dati
 * @param {string} method - Il metodo HTTP (post, put, delete)
 * @param {string} url - L'endpoint da chiamare
 * @param {Object} data - I dati da inviare
 * @param {Object} options - Opzioni aggiuntive
 * @returns {Promise} Promise con i dati della risposta
 */
export const submitData = async (method, url, data = {}, options = {}) => {
  try {
    let response;
    if (method === 'delete') {
      response = await api.delete(url, { data, ...options });
    } else {
      response = await api[method](url, data, options);
    }
    return response.data;
  } catch (error) {
    if (options && options.useMock) {
      console.warn(`Using mock data for ${method} ${url}`);
      return options.mockData || null;
    }
    throw error;
  }
};

export default api;