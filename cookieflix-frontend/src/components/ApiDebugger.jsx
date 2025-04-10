// src/components/ApiDebugger.jsx
import { useState } from 'react';
import api from '../services/apiConfig';

const ApiDebugger = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Dati di prova che dovrebbero corrispondere alle aspettative del backend
      const userData = {
        email: "test@example.com",
        full_name: "Test User",
        password: "password123"
      };

      console.log('Sending registration data:', userData);
      
      const response = await api.post('/auth/register', userData);
      setResponse(response.data);
      console.log('Registration success:', response.data);
    } catch (err) {
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      console.error('Registration error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 z-50">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">API Debugger</h3>
        <button 
          onClick={testRegistration}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Registration'}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 rounded-md">
          <p className="font-bold">Error: {error.message}</p>
          <p>Status: {error.status}</p>
          <pre className="mt-2 text-xs overflow-auto max-h-32">
            {JSON.stringify(error.response, null, 2)}
          </pre>
        </div>
      )}
      
      {response && (
        <div className="mt-2 p-2 bg-green-100 rounded-md">
          <p className="font-bold">Success:</p>
          <pre className="mt-2 text-xs overflow-auto max-h-32">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;