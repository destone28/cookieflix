import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getSubscriptionPlans, getActiveSubscription } from '../services/subscriptionService';
import StripeCheckout from '../components/StripeCheckout';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // Carica i piani di abbonamento e l'abbonamento attivo
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carica piani e abbonamento in parallelo
        const [plansData, subscriptionData] = await Promise.all([
          getSubscriptionPlans(),
          getActiveSubscription().catch(() => null) // Se non c'è un abbonamento attivo, restituisce null
        ]);
        
        setPlans(plansData);
        setActiveSubscription(subscriptionData);
        
        // Seleziona automaticamente il piano popolare o il primo
        const popularPlan = plansData.find(plan => plan.is_popular);
        setSelectedPlan(popularPlan || plansData[0]);
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Impossibile caricare i dati. Riprova più tardi.');
        toast.showError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Mappa delle descrizioni delle periodicità
  const billingPeriodMap = {
    monthly: 'Mensile',
    quarterly: 'Trimestrale',
    semiannual: 'Semestrale',
    annual: 'Annuale'
  };

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Rendering dello stato di caricamento
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-text mb-6">Abbonamento</h1>
      
      {/* Mostra l'abbonamento attivo, se presente */}
      {activeSubscription && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Il tuo abbonamento attivo</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">{activeSubscription.plan.name}</h3>
              <p className="text-gray-600 mb-4">{activeSubscription.plan.description}</p>
              
              <ul className="space-y-2 mb-4">
                {activeSubscription.plan.features.map((feature, index) => (
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
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <span className="text-gray-600">Periodicità:</span>
                <span className="font-medium ml-2">
                  {billingPeriodMap[activeSubscription.billing_period]}
                </span>
              </div>
              
              <div className="mb-3">
                <span className="text-gray-600">Data attivazione:</span>
                <span className="font-medium ml-2">
                  {formatDate(activeSubscription.start_date)}
                </span>
              </div>
              
              <div className="mb-3">
                <span className="text-gray-600">Prossimo addebito:</span>
                <span className="font-medium ml-2">
                  {formatDate(activeSubscription.next_billing_date)}
                </span>
              </div>
              
              <div className="mb-6">
                <span className="text-gray-600">Stato:</span>
                <span className="font-medium ml-2 inline-flex items-center">
                  {activeSubscription.is_active ? (
                    <>
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Attivo
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                      Inattivo
                    </>
                  )}
                </span>
              </div>
              
              <button
                onClick={() => navigate('/category-selection')}
                className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors block w-full text-center"
              >
                Gestisci categorie
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Se non c'è un abbonamento attivo, mostra i piani disponibili */}
      {!activeSubscription && (
        <>
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Scegli il tuo piano</h2>
            
            {/* Selezione piano */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary bg-primary bg-opacity-5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {plan.categories_count} {plan.categories_count === 1 ? 'categoria' : 'categorie'}
                  </p>
                  <div className="text-lg font-bold text-primary">
                    {plan.monthly_price.toFixed(2)} €<span className="text-sm font-normal">/mese</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Selezione periodicità */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Scegli la periodicità</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {['monthly', 'quarterly', 'semiannual', 'annual'].map(period => (
                  <button
                    key={period}
                    onClick={() => setBillingPeriod(period)}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      billingPeriod === period
                        ? 'border-primary bg-primary bg-opacity-5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium">{billingPeriodMap[period]}</h4>
                    {period !== 'monthly' && (
                      <p className="text-sm text-green-600 mt-1">
                        {period === 'quarterly' && 'Risparmi il 10%'}
                        {period === 'semiannual' && 'Risparmi il 20%'}
                        {period === 'annual' && 'Risparmi il 30%'}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Riepilogo e checkout */}
            {selectedPlan && (
              <div className="max-w-md mx-auto">
                <StripeCheckout 
                  plan={selectedPlan} 
                  billingPeriod={billingPeriod} 
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;