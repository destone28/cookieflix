// src/pages/CheckoutCancel.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useEffect } from 'react';

const CheckoutCancel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    // Notifica all'utente
    toast.showInfo('Checkout annullato');
    
    // Opzionale: invia una richiesta al backend per registrare l'annullamento
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');
    
    if (sessionId) {
      fetch(`/api/subscriptions/cancel-checkout?session_id=${sessionId}`)
        .catch(err => console.error('Errore nel notificare l\'annullamento:', err));
    }
  }, [location.search, toast]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gray-200 text-gray-600 mb-6">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Checkout annullato</h1>
          <p className="text-lg text-gray-600 mb-0">
            Hai annullato il processo di checkout. Il tuo abbonamento non è stato attivato e non ti è stato addebitato alcun importo.
          </p>
        </div>
        
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Perché abbonarsi a Cookieflix?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Design unici ogni mese</h3>
                  <p className="text-gray-600">Ricevi cookie cutters esclusivi direttamente a casa tua ogni mese.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-pink-100 rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Spedizione gratuita</h3>
                  <p className="text-gray-600">Spedizione gratuita per tutti gli abbonamenti.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Cancella quando vuoi</h3>
                  <p className="text-gray-600">Nessun vincolo, puoi disdire il tuo abbonamento in qualsiasi momento.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/plans')}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Rivedi i piani
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Torna alla home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;