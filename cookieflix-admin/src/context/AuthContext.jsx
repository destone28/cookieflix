// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp < currentTime) {
          // Token scaduto
          localStorage.removeItem('admin_token');
          setCurrentUser(null);
        } else {
          // Token valido
          setCurrentUser(decoded);
          
          // Verifica che l'utente sia effettivamente admin
          fetchUserProfile(token);
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('admin_token');
        setError('Sessione non valida');
      }
    }
    setIsLoading(false);
  }, []);
  
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data.is_admin) {
        // L'utente non è admin
        logout();
        setError('Questo account non ha privilegi di amministratore');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      // Utilizzo di URLSearchParams per inviare i dati in formato application/x-www-form-urlencoded
      // come richiesto da OAuth2PasswordRequestForm
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      
      const response = await axios.post('/api/auth/admin-login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      localStorage.setItem('admin_token', access_token);
      
      // Decodifica token e imposta utente
      const decoded = jwtDecode(access_token);
      setCurrentUser(decoded);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      
      // Gestione specifica degli errori
      if (err.response) {
        if (err.response.status === 403) {
          setError('Questo account non ha privilegi di amministratore');
        } else {
          setError(err.response.data?.detail || 'Errore durante il login');
        }
      } else {
        setError('Errore di connessione al server');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};