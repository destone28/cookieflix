// src/components/settings/TokenManager.jsx
import { useState, useEffect } from 'react';
import api from '../../services/apiConfig';

const TokenManager = () => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveToken = () => {
    if (!token.trim()) {
      setMessage('Inserisci un token valido');
      setStatus('error');
      return;
    }

    localStorage.setItem('admin_token', token);
    setMessage('Token salvato in localStorage');
    setStatus('success');
    
    // Forza un reload per aggiornare gli header di richiesta
    window.location.reload();
  };

  const handleClearToken = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setMessage('Token rimosso da localStorage');
    setStatus('success');
    
    // Forza un reload per aggiornare gli header di richiesta
    window.location.reload();
  };

  const handleGenerateToken = async () => {
    setLoading(true);
    setMessage('');
    setStatus('');
    
    try {
      const response = await api.get('/auth/debug/admin-token');
      const { access_token } = response.data;
      
      setToken(access_token);
      localStorage.setItem('admin_token', access_token);
      setMessage('Token admin generato e salvato con successo');
      setStatus('success');
      
      // Forza un reload per aggiornare gli header di richiesta
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Errore nella generazione del token:', error);
      setMessage(`Errore: ${error.response?.data?.detail || error.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Token Admin Manager</h3>
        <button
          onClick={handleGenerateToken}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Generazione...' : 'Genera Token Admin'}
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Utilizza questa sezione per gestire il token di autenticazione admin.
      </p>
      
      <div className="mb-4">
        <label htmlFor="admin-token" className="block text-sm font-medium text-gray-700 mb-1">
          Token Admin JWT
        </label>
        <textarea
          id="admin-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="Incolla qui il token JWT admin..."
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleSaveToken}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Salva Token
        </button>
        <button
          onClick={handleClearToken}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Rimuovi Token
        </button>
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TokenManager;