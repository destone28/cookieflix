// src/components/auth/ProtectedAdminRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../services/apiConfig';

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Verifico se c'è un token
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Verifico se l'utente è admin
        const response = await api.get('/auth/me');
        setIsAdmin(response.data.is_admin);
      } catch (error) {
        console.error('Errore nella verifica admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-600">Verifica accesso...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Reindirizzo alla pagina di login con il ritorno alla posizione attuale
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedAdminRoute;