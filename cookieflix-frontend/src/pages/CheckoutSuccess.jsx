// src/pages/CheckoutSuccess.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { verifyCheckoutSession } from '../services/subscriptionService';

const CheckoutSuccess = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error, requires_login
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
    setSessionId(sid);
    
    const verifySession = async () => {
      if (!sid) {
        setStatus('error');
        setMessage('Parametro session_id mancante. Impossibile verificare il pagamento.');
        toast.showError('Impossibile verificare il pagamento');
        return;
      }
  
      try {
        const result = await verifyCheckoutSession(sid);
        
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
  
  // Gestisce il click sul pulsante
  const handleButtonClick = () => {
    if (status === 'success') {
      navigate('/categories'); // Vai alla selezione categorie
    } else if (status === 'requires_login') {
      // Reindirizza al login e ricorda di tornare qui dopo
      navigate('/login', { 
        state: { 
          message: 'Accedi per completare l\'attivazione dell\'abbonamento',
          returnTo: `/checkout/success?session_id=${sessionId}`
        } 
      });
    } else if (status === 'error') {
      navigate('/plans'); // Torna alla pagina abbonamento
    } else {
      navigate('/dashboard'); // Vai alla dashboard
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Verifica del pagamento in corso...</h2>
            <p className="text-gray-600">Stiamo verificando lo stato del tuo pagamento. Attendi qualche istante.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Pagamento completato con successo!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-gray-600 mb-6">Ora puoi selezionare le tue categorie preferite per iniziare a ricevere i tuoi cookie cutters mensili.</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Pagamento in elaborazione</h2>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === 'requires_login' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Accesso richiesto</h2>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mt-6 mb-2">Si è verificato un errore</h2>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        <button
          onClick={handleButtonClick}
          className="w-full py-3 rounded-md text-white font-medium transition-colors bg-primary hover:bg-opacity-90"
        >
          {status === 'success' ? 'Seleziona le tue categorie' : 
           status === 'requires_login' ? 'Accedi per continuare' :
           status === 'error' ? 'Torna agli abbonamenti' : 
           'Vai alla dashboard'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;