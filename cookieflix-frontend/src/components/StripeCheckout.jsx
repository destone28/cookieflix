import { useState } from 'react';
import { createCheckoutSession } from '../services/subscriptionService';
import { useNavigate } from 'react-router-dom';

const StripeCheckout = ({ plan, billingPeriod }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Funzione per ottenere il prezzo in base alla periodicità
  const getPrice = () => {
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

  // Calcola il prezzo scontato in base alla periodicità
  const getDiscount = () => {
    const monthlyPrice = plan.monthly_price;
    const currentPrice = getPrice();
    
    switch (billingPeriod) {
      case 'quarterly':
        return Math.round(100 - (currentPrice / (monthlyPrice * 3)) * 100);
      case 'semiannual':
        return Math.round(100 - (currentPrice / (monthlyPrice * 6)) * 100);
      case 'annual':
        return Math.round(100 - (currentPrice / (monthlyPrice * 12)) * 100);
      default:
        return 0;
    }
  };

  // Funzione per avviare il checkout con Stripe
  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    
    try {
      const checkoutData = {
        plan_slug: plan.slug,
        billing_period: billingPeriod
      };
      
      const response = await createCheckoutSession(checkoutData);
      
      // Reindirizza l'utente all'URL di checkout di Stripe
      window.location.href = response.checkout_url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Si è verificato un errore durante il checkout. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const discount = getDiscount();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        {plan.is_popular && (
          <span className="bg-tertiary text-dark-text text-xs px-2 py-1 rounded-full">
            Più popolare
          </span>
        )}
      </div>
      
      <p className="text-gray-600 mb-4">{plan.description}</p>
      
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{getPrice().toFixed(2)} €</span>
          {billingPeriod === 'monthly' ? (
            <span className="text-gray-500 ml-2">/mese</span>
          ) : (
            <span className="text-gray-500 ml-2">
              /{billingPeriod === 'quarterly' ? 'trimestre' : billingPeriod === 'semiannual' ? 'semestre' : 'anno'}
            </span>
          )}
        </div>
        
        {discount > 0 && (
          <div className="text-green-600 text-sm mt-1">
            Risparmi il {discount}% rispetto al pagamento mensile
          </div>
        )}
      </div>
      
      <ul className="mb-6 space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg 
              className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Elaborazione in corso...
          </span>
        ) : (
          'Abbonati ora'
        )}
      </button>
    </div>
  );
};

export default StripeCheckout;