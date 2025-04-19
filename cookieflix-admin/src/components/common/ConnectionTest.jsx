// src/components/common/ConnectionTest.jsx
import { useState, useEffect } from 'react';
import { fetchData } from '../../services/apiConfig';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

/**
 * Componente per testare la connessione con il backend
 * @param {Object} props - Props del componente
 * @param {string} props.endpoint - Endpoint da testare (default: '/health')
 * @param {boolean} props.autoTest - Se testare automaticamente all'avvio (default: true)
 * @param {Function} props.onStatusChange - Callback chiamato quando cambia lo stato della connessione
 */
const ConnectionTest = ({ 
  endpoint = '/health', 
  autoTest = true, 
  onStatusChange = null,
  className = ''
}) => {
  // Stati del componente
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // Funzione per testare la connessione
  const testConnection = async () => {
    setLoading(true);
    setStatus('pending');
    setMessage('');
    
    const startTime = Date.now();
    
    try {
      // Incrementa il contatore dei tentativi
      setAttempts(prev => prev + 1);
      
      // Esegui la chiamata API
      const response = await fetchData(endpoint, {}, { 
        timeout: 5000,
        useMock: endpoint === '/health',
        mockData: {
          status: 'healthy',
          version: '1.0.0',
          uptime: '3h 24m',
          env: 'development'
        }
      });
      
      // Calcola tempo di risposta
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      // Imposta stato di successo
      setStatus('success');
      setMessage(
        typeof response === 'object' 
          ? JSON.stringify(response, null, 2) 
          : String(response)
      );
      
      // Richiama callback se presente
      if (onStatusChange) onStatusChange('success', response);
    } catch (error) {
      // Calcola tempo di risposta anche in caso di errore
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      // Imposta stato di errore
      setStatus('error');
      setMessage(error.message || 'Si è verificato un errore sconosciuto');
      
      // Richiama callback se presente
      if (onStatusChange) onStatusChange('error', error);
    } finally {
      setLoading(false);
    }
  };

  // Esegui test automatico all'avvio se richiesto
  useEffect(() => {
    if (autoTest) {
      testConnection();
    }
  }, [autoTest]);

  // Rendering condizionale in base allo stato
  const renderStatus = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            <span>Connessione riuscita</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-500">
            <XCircleIcon className="w-5 h-5 mr-2" />
            <span>Errore di connessione</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <div className="w-5 h-5 mr-2 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>
            <span>Verifica connessione...</span>
          </div>
        );
    }
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow-md ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Test Connessione API</h3>
        <button
          onClick={testConnection}
          disabled={loading}
          className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Riprova
        </button>
      </div>
      
      <div className="mb-3">
        {renderStatus()}
        
        {responseTime !== null && (
          <div className="text-sm text-gray-500 mt-1">
            Tempo di risposta: {responseTime}ms
          </div>
        )}
        
        {attempts > 0 && (
          <div className="text-sm text-gray-500">
            Tentativi: {attempts}
          </div>
        )}
      </div>
      
      {endpoint && (
        <div className="mb-3 text-sm text-gray-600">
          <span className="font-medium">Endpoint:</span> {endpoint}
        </div>
      )}
      
      {message && (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Dettagli:</h4>
          <pre className="p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40">
            {message}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;