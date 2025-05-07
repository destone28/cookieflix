// src/components/settings/ApiDiagnostics.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import TokenManager from './TokenManager';

const ApiDiagnostics = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAdminToken, setHasAdminToken] = useState(!!localStorage.getItem('admin_token'));

  useEffect(() => {
    const checkToken = () => {
      setHasAdminToken(!!localStorage.getItem('admin_token'));
    };
    checkToken();
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  // Funzione per aggiungere un risultato di test
  const addResult = (title, success, data, error = null) => {
    setResults(prev => [
      {
        id: Date.now(), // Assicura che ogni risultato abbia un ID unico
        title,
        success,
        data: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data),
        error: error ? String(error) : null,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  // Test manuale per Admin Login
  const testAdminLogin = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', 'admin@cookieflix.com');
      params.append('password', 'adminpassword');
      
      const response = await axios.post('/api/auth/admin-login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      addResult('Admin Login', true, response.data);
      
      // Salva il token
      if (response.data.access_token) {
        localStorage.setItem('admin_token', response.data.access_token);
        setHasAdminToken(true);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      addResult('Admin Login', false, 
        error.response?.data || {}, 
        `${error.message} - ${error.response?.status || 'Unknown status'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Test per Debug Admin Token
  const testDebugAdminToken = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/auth/debug/admin-token');
      addResult('Debug Admin Token', true, response.data);
      
      // Salva il token
      if (response.data.access_token) {
        localStorage.setItem('admin_token', response.data.access_token);
        setHasAdminToken(true);
      }
    } catch (error) {
      console.error('Debug token error:', error);
      addResult('Debug Admin Token', false, 
        error.response?.data || {}, 
        `${error.message} - ${error.response?.status || 'Unknown status'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Test per verificare /me endpoint con token
  const testMeEndpoint = async () => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      addResult('/api/auth/me', false, {}, 'Token non trovato in localStorage');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      addResult('/api/auth/me', true, response.data);
    } catch (error) {
      console.error('Me endpoint error:', error);
      addResult('/api/auth/me', false, 
        error.response?.data || {}, 
        `${error.message} - ${error.response?.status || 'Unknown status'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per verificare il contenuto del token
  const checkTokenContent = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      addResult('Token Decoder', false, {}, 'Nessun token trovato');
      return;
    }
    
    try {
      // Decodifica il token (senza verifica)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT non valido');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      addResult('Token Decoder', true, payload);
    } catch (error) {
      console.error('Token decode error:', error);
      addResult('Token Decoder', false, {}, String(error));
    }
  };

  return (
    <div className="p-6">
      {/* Token Manager */}
      <TokenManager />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Diagnostica API</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testAdminLogin}
            disabled={isLoading}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Admin Login
          </button>
          <button
            onClick={testDebugAdminToken}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Debug Token
          </button>
          <button
            onClick={testMeEndpoint}
            disabled={isLoading}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Test /me
          </button>
          <button
            onClick={checkTokenContent}
            disabled={isLoading}
            className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Decodifica Token
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Strumento di diagnostica per verificare la connessione API e l'autenticazione. 
        {!hasAdminToken && (
          <span className="block mt-2 text-amber-600">
            ⚠️ Token admin non trovato! Usa i pulsanti sopra per ottenere un token.
          </span>
        )}
      </p>

      {/* Indicatore di caricamento */}
      {isLoading && (
        <div className="flex justify-center my-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* Risultati dei test */}
      {results.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="font-medium text-lg">Risultati dei test</h3>
          {results.map((result) => (
            <div 
              key={result.id} 
              className={`p-4 rounded border ${result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium">{result.title}</span>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              {result.error && (
                <div className="mb-2 text-red-600 text-sm font-mono whitespace-pre-wrap">
                  Errore: {result.error}
                </div>
              )}
              <div className="bg-white p-2 rounded text-xs overflow-auto max-h-64">
                <pre>{result.data}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiDiagnostics;