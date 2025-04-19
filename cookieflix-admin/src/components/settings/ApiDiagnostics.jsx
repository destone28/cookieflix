// src/components/settings/ApiDiagnostics.jsx
import { useState } from 'react';
import ConnectionTest from '../common/ConnectionTest';

const ApiDiagnostics = () => {
  const [apiStatus, setApiStatus] = useState({
    health: { status: null, timestamp: null, response: null },
    users: { status: null, timestamp: null, response: null },
    subscriptions: { status: null, timestamp: null, response: null },
    categories: { status: null, timestamp: null, response: null }
  });
  
  const [showTests, setShowTests] = useState(true);
  
  // Gestisce il cambio di stato della connessione
  const handleStatusChange = (endpoint, status, response) => {
    const endpointKey = endpoint.includes('health') 
      ? 'health' 
      : endpoint.includes('users') 
        ? 'users' 
        : endpoint.includes('subscriptions')
          ? 'subscriptions'
          : 'categories';
    
    setApiStatus(prev => ({
      ...prev,
      [endpointKey]: {
        status,
        timestamp: new Date().toISOString(),
        response
      }
    }));
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Diagnostica API</h3>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowTests(!showTests)}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            {showTests ? 'Nascondi test' : 'Mostra test'}
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Verifica la connessione con i vari endpoint dell'API del backend.
      </p>
      
      {showTests && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Test API Health */}
            <div>
              <ConnectionTest 
                endpoint="/health" 
                onStatusChange={(status, response) => handleStatusChange('/health', status, response)}
                className="h-full"
              />
            </div>
            
            {/* Test API Utenti */}
            <div>
              <ConnectionTest 
                endpoint="/admin/users/stats" 
                autoTest={false}
                onStatusChange={(status, response) => handleStatusChange('/admin/users/stats', status, response)}
                className="h-full" 
              />
            </div>
            
            {/* Test API Abbonamenti */}
            <div>
              <ConnectionTest 
                endpoint="/admin/subscriptions/stats" 
                autoTest={false}
                onStatusChange={(status, response) => handleStatusChange('/admin/subscriptions/stats', status, response)}
                className="h-full" 
              />
            </div>
            
            {/* Test API Categorie */}
            <div>
              <ConnectionTest 
                endpoint="/admin/categories" 
                autoTest={false}
                onStatusChange={(status, response) => handleStatusChange('/admin/categories', status, response)}
                className="h-full" 
              />
            </div>
          </div>
          
          {/* Riepilogo API */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium mb-3">Riepilogo stato API</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(apiStatus).map(([key, test]) => (
                <div key={key} className="bg-white p-3 rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    {test.status ? (
                      <span className={`text-sm px-2 py-1 rounded ${test.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {test.status === 'success' ? 'OK' : 'Errore'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Non testato</span>
                    )}
                  </div>
                  {test.timestamp && (
                    <div className="text-xs text-gray-500 mt-1">
                      Ultimo test: {new Date(test.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDiagnostics;