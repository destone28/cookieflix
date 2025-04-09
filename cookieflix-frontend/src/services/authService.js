// src/services/authService.js - versione corretta
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

    // Se il login ha successo, ottieni i dati dell'utente
    if (response.data.access_token) {
      const userResponse = await api.get('/auth/me');

      return {
        token: response.data.access_token,
        user: userResponse.data,
      };
    }
    throw new Error('Credenziali non valide');
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
    
    // Dopo la registrazione, effettua automaticamente il login
    return await loginUser({
      email: userData.email,
      password: userData.password,
    });
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || 'Email già registrata');
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
  // Questo viene fatto nel componente AuthContext
  return true;
};