// src/services/authService.js (aggiornato)
import api from './apiConfig';
import axios from 'axios';

// Funzione per effettuare il login
export const loginUser = async (credentials) => {
  try {
    // Formattazione richiesta per compatibilità con FastAPI OAuth2
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    // Usa l'URL base configurato in apiConfig
    const response = await axios.post(`${api.defaults.baseURL}/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Login response:', response.data);
    
    // Salva temporaneamente il token per ottenere i dati utente
    const token = response.data.access_token;
    localStorage.setItem('token', token);
    
    // Esegue una richiesta per ottenere i dati dell'utente
    try {
      const userResponse = await api.get('/auth/me');
      console.log('User data response:', userResponse.data);
      
      return {
        token: token,
        user: userResponse.data,
      };
    } catch (userError) {
      console.error('Error fetching user data:', userError);
      // Rimuovi il token se non riesci a ottenere i dati utente
      localStorage.removeItem('token');
      throw new Error('Impossibile ottenere i dati utente dopo il login');
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Email o password non validi');
    }
    throw new Error('Errore durante il login. Riprova più tardi.');
  }
};

// Funzione per registrare un nuovo utente
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    console.log('Registration response:', response.data);
    
    // Dopo la registrazione, effettua automaticamente il login
    return await loginUser({
      email: userData.email,
      password: userData.password,
    });
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || 'Email già registrata');
    } else if (error.response?.status === 422) {
      // Gestisci errori di validazione
      const detail = error.response.data.detail || [];
      if (Array.isArray(detail) && detail.length > 0) {
        throw new Error(detail[0].msg || 'Errore di validazione');
      }
      throw new Error('Dati non validi. Verifica i campi inseriti.');
    }
    throw new Error('Errore durante la registrazione. Riprova più tardi.');
  }
};

// Ottieni dati dell'utente corrente
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message);
    throw new Error('Errore nel recupero dei dati utente');
  }
};

// Funzione di logout (lato client)
export const logoutUser = () => {
  // Nel nostro caso è sufficiente rimuovere il token dal localStorage
  return true;
};