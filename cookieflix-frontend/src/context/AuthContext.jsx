// src/context/AuthContext.jsx (aggiornato)
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../services/authService';

// Creazione del contesto
const AuthContext = createContext();

// Hook personalizzato per utilizzare il contesto
export const useAuth = () => useContext(AuthContext);

// Provider del contesto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controlla se l'utente è già autenticato (all'avvio dell'applicazione)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Tentativo di caricamento dello user
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Funzione per effettuare il login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginUser({ email, password });
      
      // Salva il token in localStorage
      localStorage.setItem('token', result.token);
      console.log('Token salvato:', result.token);
      
      // Imposta l'utente
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message || 'Errore durante il login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funzione per registrare un nuovo utente
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerUser(userData);
      
      // Salva il token in localStorage
      localStorage.setItem('token', result.token);
      console.log('Token salvato dopo registrazione:', result.token);
      
      // Imposta l'utente
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message || 'Errore durante la registrazione');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funzione per effettuare il logout
  const logout = () => {
    logoutUser();
    localStorage.removeItem('token');
    setUser(null);
  };

  // Valore del contesto
  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;