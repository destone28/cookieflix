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
      // Questa richiesta è opzionale
      fetch(`/api/subscriptions/cancel-checkout?session_id=${sessionId}`)
        .catch(err => console.error('Errore nel notificare l\'annullamento:', err));
    }
  }, [location.search, toast]);

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Checkout annullato</h2>
        <p className="text-gray-600 mb-6">
          Hai annullato il processo di checkout. Il tuo abbonamento non è stato attivato e non ti è stato addebitato alcun importo.
        </p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => navigate('/plans')}
            className="flex-1 py-3 rounded-md text-white font-medium transition-colors bg-primary hover:bg-opacity-90"
          >
            Torna agli abbonamenti
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-md text-gray-700 font-medium transition-colors bg-gray-200 hover:bg-gray-300"
          >
            Vai alla home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;