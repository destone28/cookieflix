// src/services/apiConfig.js
import axios from 'axios';

// Configurazione diversa per ambiente di sviluppo e produzione
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In produzione, l'API è sulla stessa origine
  : 'http://localhost:8000/api'; // In sviluppo, potrebbe essere un server separato

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 secondi di timeout per le richieste
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Funzione per gestire la notifica di errori
// Da implementare con il sistema di notifica globale dell'app
const handleApiError = (error) => {
  const errorMessage = error.response?.data?.detail || 
                    error.response?.data?.message || 
                    error.message || 
                    'Si è verificato un errore sconosciuto';
  
  // Qui possiamo collegare la gestione degli errori al sistema di toast o notifiche dell'app
  console.error('API Error:', errorMessage);
  
  // Se esiste una funzione globale di notifica nell'app, chiamarla
  if (window.notify) {
    window.notify('error', errorMessage);
  }
  
  return errorMessage;
};

// Interceptor per aggiungere il token di autenticazione
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Logging in sviluppo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Interceptor per gestire gli errori di risposta
api.interceptors.response.use(
  (response) => {
    // Logging in sviluppo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error) => {
    // Logging dell'errore
    if (process.env.NODE_ENV !== 'production') {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
    }
    
    // Gestione degli errori specifici
    if (error.response) {
      // Il server ha risposto con un codice di stato al di fuori del range 2xx
      const { status } = error.response;
      
      if (status === 401) {
        // Non autorizzato: pulisci i dati di autenticazione e reindirizza al login
        localStorage.removeItem('admin_token');
        
        // Se non siamo già sulla pagina di login, reindirizzare
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } 
      else if (status === 403) {
        // Accesso vietato
        handleApiError({ 
          message: "Non hai i permessi necessari per accedere a questa risorsa" 
        });
      }
      else if (status === 429) {
        // Troppi tentativi
        handleApiError({ 
          message: "Troppe richieste. Riprova più tardi." 
        });
      }
      else if (status >= 500) {
        // Errore del server
        handleApiError({ 
          message: "Si è verificato un errore sul server. Riprova più tardi." 
        });
      }
      else {
        // Altri errori
        handleApiError(error);
      }
    } 
    else if (error.request) {
      // La richiesta è stata effettuata ma non è stata ricevuta alcuna risposta
      handleApiError({ 
        message: "Nessuna risposta dal server. Controlla la tua connessione di rete." 
      });
    } 
    else {
      // Errore durante la configurazione della richiesta
      handleApiError(error);
    }
    
    return Promise.reject(error);
  }
);

// Funzioni helper per semplificare le chiamate API comuni
api.fetchData = async (url, options = {}) => {
  try {
    const response = await api.get(url, options);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

api.submitData = async (url, data, method = 'post', options = {}) => {
  try {
    const response = await api[method](url, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export default api;

// Esporta anche le funzioni helper per un uso più pulito
export const fetchData = api.fetchData;
export const submitData = api.submitData;