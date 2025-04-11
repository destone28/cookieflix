// src/pages/CheckoutSuccess.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { verifyCheckoutSession } from '../services/subscriptionService';

const CheckoutSuccess = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    // Estrae il session_id dai query params
    const queryParams = new URLSearchParams(location.search);
    const sid = queryParams.get('session_id');
    
    if (!sid) {
      setStatus('error');
      setMessage('Parametro session_id mancante. Impossibile verificare il pagamento.');
      toast.showError('Impossibile verificare il pagamento');
      return;
    }
    
    setSessionId(sid);
    console.log("Session ID ricevuto:", sid); // Debug log
    
    const verifySession = async () => {
      try {
        console.log("Verifico sessione:", sid); // Debug log
        const result = await verifyCheckoutSession(sid);
        console.log("Risultato verifica:", result); // Debug log
        
        if (result.status === 'success') {
          setStatus('success');
          setMessage(result.message || 'Abbonamento attivato con successo!');
          toast.showSuccess('Abbonamento attivato con successo!');
          
          // Se non siamo autenticati ma la verifica è andata a buon fine,
          // dovremo comunque accedere per vedere l'abbonamento
          if (!isAuthenticated) {
            setStatus('requires_login');
            setMessage('Abbonamento attivato! Accedi per visualizzarlo');
          }
        } else if (result.status === 'error') {
          setStatus('error');
          setMessage(result.message || 'Si è verificato un errore durante la verifica del pagamento');
          toast.showError('Errore nella verifica del pagamento');
        } else {
          setStatus('pending');
          setMessage(result.message || 'Il pagamento è in fase di elaborazione. Riceverai una conferma a breve.');
          toast.showInfo('Il pagamento è in fase di elaborazione');
        }
      } catch (error) {
        console.error('Errore nella verifica del pagamento:', error);
        setStatus('error');
        setMessage('Si è verificato un errore durante la verifica del pagamento. Contatta il supporto.');
        toast.showError('Errore nella verifica del pagamento');
      }
    };

    verifySession();
  }, [location.search, toast, isAuthenticated]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {status === 'loading' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary mx-auto mb-8"></div>
          <h2 className="text-3xl font-bold mb-4">Elaborazione in corso...</h2>
          <p className="text-gray-600">Stiamo verificando lo stato del tuo pagamento.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary bg-opacity-10 p-8 text-center">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary bg-opacity-20 text-primary mb-6">
              <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Pagamento completato con successo!</h1>
            <p className="text-lg text-gray-600 mb-0">{message}</p>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">I prossimi passi</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Seleziona le tue categorie preferite</h3>
                    <p className="text-gray-600">Scegli le categorie per i cookie cutters che riceverai ogni mese.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Vota i design del mese</h3>
                    <p className="text-gray-600">Partecipa alla selezione dei design che verranno prodotti.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-purple-100 rounded-full p-2 mr-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Ricevi i tuoi cookie cutters</h3>
                    <p className="text-gray-600">I cookie cutters selezionati verranno spediti all'inizio di ogni mese.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/categories')}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              >
                Seleziona categorie
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Vai alla dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-100 p-8 text-center">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-200 text-red-600 mb-6">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Si è verificato un problema</h1>
            <p className="text-lg text-gray-600 mb-0">{message}</p>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <p className="text-gray-600 mb-6">Sessione ID: {sessionId || 'Non disponibile'}</p>
              <button
                onClick={() => navigate('/plans')}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              >
                Torna ai piani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutSuccess;