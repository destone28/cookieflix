// src/components/settings/DiagnosticsPanel.jsx
import { useState, useEffect } from 'react';
import { testEndpoint } from '../../services/diagnosticsService';

// Componente per un singolo test API
const ApiTestCard = ({ title, endpoint, onRetest }) => {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const runTest = async () => {
    setIsTesting(true);
    setAttempts(prev => prev + 1);
    
    try {
      const result = await testEndpoint(endpoint);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runTest();
  }, [endpoint, onRetest]);

  return (
    <div className="bg-white rounded-lg shadow p-5 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Test Connessione API</h3>
        <button 
          onClick={runTest}
          disabled={isTesting}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Riprova'}
        </button>
      </div>

      {testResult ? (
        testResult.success ? (
          <>
            <div className="flex items-center text-green-500 mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Connessione riuscita</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <p>Tempo di risposta: {testResult.responseTime}ms</p>
              <p>Tentativi: {attempts}</p>
            </div>
            <div className="mt-2">
              <p className="font-medium mb-1">Endpoint: {endpoint}</p>
              <div className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                <pre className="text-xs">{JSON.stringify(testResult.data, null, 2)}</pre>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center text-red-500 mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Errore di connessione</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <p>Tentativi: {attempts}</p>
              <p>Stato: {testResult.statusCode || 'Sconosciuto'}</p>
            </div>
            <div className="mt-2">
              <p className="font-medium mb-1">Endpoint: {endpoint}</p>
              <div className="bg-red-50 p-3 rounded text-red-600">
                <p>{testResult.error}</p>
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex items-center justify-center h-20">
          <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-500">Verifica connessione...</span>
        </div>
      )}
    </div>
  );
};

// Componente principale per la diagnostica
const DiagnosticsPanel = () => {
  const [retestTrigger, setRetestTrigger] = useState(0);
  const [showTests, setShowTests] = useState(true);

  const endpoints = [
    { title: 'Health', endpoint: '/api/health' },
    { title: 'Admin Health', endpoint: '/api/admin/health' },
    { title: 'Users Stats', endpoint: '/api/admin/users/stats' },
    { title: 'Subscriptions Stats', endpoint: '/api/admin/subscriptions/stats' }
  ];

  const handleRetestAll = () => {
    setRetestTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Diagnostica API</h2>
        <div className="space-x-2">
          <button
            onClick={handleRetestAll}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Riprova Tutti
          </button>
          <button
            onClick={() => setShowTests(!showTests)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {showTests ? 'Nascondi test' : 'Mostra test'}
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Verifica la connessione con i vari endpoint dell'API del backend.
      </p>

      {showTests && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endpoints.map((endpoint) => (
            <ApiTestCard
              key={endpoint.endpoint}
              title={endpoint.title}
              endpoint={endpoint.endpoint}
              onRetest={retestTrigger}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="font-medium text-lg mb-4">Riepilogo stato API</h3>
        <div className="bg-gray-100 p-4 rounded">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {endpoints.map((endpoint) => (
              <div key={`status-${endpoint.endpoint}`} className="bg-white p-3 rounded shadow-sm">
                <h4 className="font-medium text-sm mb-1">{endpoint.title}</h4>
                <ApiStatusIndicator endpoint={endpoint.endpoint} retestTrigger={retestTrigger} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente per indicatore di stato più compatto
const ApiStatusIndicator = ({ endpoint, retestTrigger }) => {
  const [status, setStatus] = useState('loading');
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      setStatus('loading');
      try {
        const result = await testEndpoint(endpoint);
        setStatus(result.success ? 'online' : 'error');
        setLastChecked(new Date());
      } catch (error) {
        setStatus('error');
        setLastChecked(new Date());
      }
    };

    checkStatus();
  }, [endpoint, retestTrigger]);

  const statusColors = {
    loading: 'text-gray-500',
    online: 'text-green-500',
    error: 'text-red-500'
  };

  const statusLabels = {
    loading: 'Verifica...',
    online: 'Online',
    error: 'Errore'
  };

  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${
        status === 'online' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-400'
      }`}></div>
      <div>
        <p className={`text-sm font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </p>
        {lastChecked && (
          <p className="text-xs text-gray-500">
            {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsPanel;