// src/components/StripeCheckout.jsx (aggiornato per prezzi Stripe)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createCheckoutSession } from '../services/subscriptionService';

const StripeCheckout = ({ plan, billingPeriod }) => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Funzione per ottenere il prezzo corretto in base al periodo
  const getPricePerMonth = () => {
    if (!plan) return 0;
    
    switch (billingPeriod) {
      case 'monthly':
        return plan.monthly_price;
      case 'quarterly': 
        return (plan.quarterly_price / 3);
      case 'semiannual':
        return (plan.semiannual_price / 6);
      case 'annual':
        return (plan.annual_price / 12);
      default:
        return plan.monthly_price;
    }
  };

  // Funzione per ottenere il prezzo totale
  const getTotalPrice = () => {
    if (!plan) return 0;
    
    switch (billingPeriod) {
      case 'monthly':
        return plan.monthly_price;
      case 'quarterly': 
        return plan.quarterly_price;
      case 'semiannual':
        return plan.semiannual_price;
      case 'annual':
        return plan.annual_price;
      default:
        return plan.monthly_price;
    }
  };

  // Gestisce il processo di checkout
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.showError('Devi accedere per sottoscrivere un abbonamento');
      navigate('/login', { 
        state: { 
          message: 'Accedi per continuare con l\'abbonamento',
          returnTo: '/plans'
        } 
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Crea una sessione di checkout
      const checkoutData = {
        plan_slug: plan.slug,
        billing_period: billingPeriod
      };
      
      const response = await createCheckoutSession(checkoutData);
      
      // Reindirizza l'utente alla pagina di checkout di Stripe
      if (response.checkout_url) {
        // Per i test, mostra le credenziali di test
        toast.showSuccess('Verrai reindirizzato alla pagina di pagamento...');
        
        // Ottieni l'URL di base per le redirect
        const baseUrl = window.location.origin;
        
        // Modifica l'URL di redirect success per usare la pagina frontend
        // Il backend redirecterà alla pagina frontend dopo la verifica
        let checkoutUrl = response.checkout_url;
        if (checkoutUrl.includes('success_url=')) {
          checkoutUrl = checkoutUrl.replace(
            /success_url=([^&]*)/,
            `success_url=${encodeURIComponent(`${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`)}`
          );
        }
        
        // Modifica l'URL di redirect cancel per usare la pagina frontend
        if (checkoutUrl.includes('cancel_url=')) {
          checkoutUrl = checkoutUrl.replace(
            /cancel_url=([^&]*)/,
            `cancel_url=${encodeURIComponent(`${baseUrl}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`)}`
          );
        }
        
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL di checkout non disponibile');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.showError('Errore durante il checkout. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Formatta il periodo in italiano
  const formatPeriod = () => {
    switch (billingPeriod) {
      case 'monthly':
        return 'mensile';
      case 'quarterly':
        return 'trimestrale';
      case 'semiannual':
        return 'semestrale';
      case 'annual':
        return 'annuale';
      default:
        return billingPeriod;
    }
  };

  // Formatta il numero come prezzo in euro
  const formatPrice = (price) => {
    return price.toFixed(2).replace('.', ',') + ' €';
  };

  // Ottieni il numero di mesi per il periodo selezionato
  const getMonthsInPeriod = () => {
    switch (billingPeriod) {
      case 'monthly': return 1;
      case 'quarterly': return 3;
      case 'semiannual': return 6;
      case 'annual': return 12;
      default: return 1;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Riepilogo ordine</h3>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600">Piano selezionato:</span>
        <span className="font-medium">{plan.name}</span>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600">Periodicità:</span>
        <span className="font-medium">{formatPeriod()}</span>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-600">Prezzo mensile:</span>
        <span className="font-medium">{formatPrice(getPricePerMonth())} / mese</span>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-bold">Totale da pagare:</span>
          <span className="font-bold text-lg text-primary">{formatPrice(getTotalPrice())}</span>
        </div>
        {billingPeriod !== 'monthly' && (
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formatPrice(getPricePerMonth())} al mese per {getMonthsInPeriod()} mesi
          </p>
        )}
      </div>
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Elaborazione in corso...
          </>
        ) : (
          'Procedi al pagamento'
        )}
      </button>
      
      <div className="mt-4">
        <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
          <h4 className="text-sm font-medium mb-2 text-center">Informazioni per il test</h4>
          <p className="text-xs text-gray-600 mb-1">Usa queste credenziali nella pagina di checkout Stripe:</p>
          <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc">
            <li>Numero carta: <span className="font-mono">4242 4242 4242 4242</span></li>
            <li>Data: Qualsiasi data futura</li>
            <li>CVC: Qualsiasi 3 numeri</li>
            <li>Nome e indirizzo: Qualsiasi valore</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;