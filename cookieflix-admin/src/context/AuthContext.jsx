// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

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
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('admin_token');
        setError('Sessione non valida');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Invece di un token fittizio semplice, creiamo un formato JWT valido
      // Formato: header.payload.signature
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        id: 1,
        email,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600 // Scade tra 1 ora
      }));
      const signature = btoa('fake_signature'); // Una firma finta per lo sviluppo
      
      const fakeToken = `${header}.${payload}.${signature}`;
      
      localStorage.setItem('admin_token', fakeToken);
      setCurrentUser({ id: 1, email, role: 'admin' });
      return true;
    } catch (err) {
      setError(err.message || 'Errore durante il login');
      return false;
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