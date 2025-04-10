// src/components/ApiIntegrationBanner.jsx - Nuovo componente
import { useState } from 'react';

const ApiIntegrationBanner = () => {
  const [showBanner, setShowBanner] = useState(true);
  
  if (!showBanner) return null;
  
  return (
    <div className="bg-green-100 p-4 relative">
      <button 
        className="absolute top-2 right-2 text-green-800 hover:text-green-900"
        onClick={() => setShowBanner(false)}
      >
        ✕
      </button>
      <div className="max-w-7xl mx-auto">
        <h3 className="font-bold text-green-800">✅ Integrazione API funzionante</h3>
        <p className="text-green-700">Il frontend può comunicare con il backend!</p>
        <div className="mt-2 flex gap-2">
          <button 
            onClick={async () => {
              try {
                const response = await fetch('/api/health');
                const data = await response.json();
                alert(JSON.stringify(data, null, 2));
              } catch (err) {
                alert(`Errore: ${err.message}`);
              }
            }}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Test API Health
          </button>
          <button 
            onClick={async () => {
              try {
                const response = await fetch('/api/products/categories');
                const data = await response.json();
                alert(JSON.stringify(data, null, 2));
              } catch (err) {
                alert(`Errore: ${err.message}`);
              }
            }}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Test Categorie
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegrationBanner;