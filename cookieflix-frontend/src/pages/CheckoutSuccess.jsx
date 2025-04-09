import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyCheckoutSession } from '../services/subscriptionService';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [subscription, setSubscription] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }
      
      try {
        const result = await verifyCheckoutSession(sessionId);
        setSubscription(result);
        setStatus('success');
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };
    
    verifySession();
  }, [sessionId]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Stiamo verificando il tuo abbonamento...</p>
          </div>
        );
      
      case 'success':
        return (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Pagamento completato con successo!</h2>
              <p className="text-gray-600">Il tuo abbonamento a Cookieflix è ora attivo.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Dettagli abbonamento</h3>
              {subscription && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Piano:</span>
                    <span className="font-medium">{subscription.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Periodicità:</span>
                    <span className="font-medium">
                      {
                        subscription.billing_period === 'monthly' ? 'Mensile' :
                        subscription.billing_period === 'quarterly' ? 'Trimestrale' :
                        subscription.billing_period === 'semiannual' ? 'Semestrale' : 'Annuale'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data attivazione:</span>
                    <span className="font-medium">
                      {new Date(subscription.start_date).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prossimo addebito:</span>
                    <span className="font-medium">
                      {new Date(subscription.next_billing_date).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-lg">È ora di scegliere le tue categorie preferite!</p>
              <Link 
                to="/category-selection" 
                className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Seleziona le tue categorie
              </Link>
              <div className="pt-2">
                <Link 
                  to="/dashboard" 
                  className="text-secondary hover:text-primary underline"
                >
                  Vai alla dashboard
                </Link>
              </div>
            </div>
          </>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Si è verificato un errore</h2>
            <p className="text-gray-600 mb-6">Non è stato possibile verificare il tuo abbonamento.</p>
            <Link 
              to="/subscription" 
              className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Riprova
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {renderContent()}
    </div>
  );
};

export default CheckoutSuccess;