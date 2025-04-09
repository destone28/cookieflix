import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPeriodicity, setSelectedPeriodicity] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verifica autenticazione
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(auth);
      return auth;
    };
    
    checkAuth();
  }, []);

  // Simula caricamento dei dati
  useEffect(() => {
    setTimeout(() => {
      const plansData = [
        {
          id: 1,
          name: 'Starter',
          slug: 'starter',
          description: 'Piano base per iniziare',
          categories_count: 1,
          items_per_month: 4,
          monthly_price: 15.90,
          quarterly_price: 42.90,
          semiannual_price: 76.30,
          annual_price: 133.50,
          features: [
            '4 cookie cutters al mese',
            '1 categoria a scelta',
            'Accesso alla community'
          ],
          is_popular: false
        },
        {
          id: 2,
          name: 'Creator',
          slug: 'creator',
          description: 'Il piano più popolare',
          categories_count: 2,
          items_per_month: 7,
          monthly_price: 23.90,
          quarterly_price: 64.50,
          semiannual_price: 114.70,
          annual_price: 200.80,
          features: [
            '7 cookie cutters al mese',
            '2 categorie a scelta',
            'Accesso alla community',
            'Anteprima nuovi design'
          ],
          is_popular: true
        },
        {
          id: 3,
          name: 'Master',
          slug: 'master',
          description: 'Per veri appassionati',
          categories_count: 3,
          items_per_month: 10,
          monthly_price: 29.90,
          quarterly_price: 80.70,
          semiannual_price: 143.50,
          annual_price: 251.20,
          features: [
            '10 cookie cutters al mese',
            '3 categorie a scelta',
            'Accesso alla community',
            'Anteprima nuovi design',
            'Accesso esclusivo a design speciali'
          ],
          is_popular: false
        },
        {
          id: 4,
          name: 'Collection',
          slug: 'collection',
          description: 'L\'esperienza completa',
          categories_count: 100,  // Tutte le categorie
          items_per_month: 15,
          monthly_price: 42.90,
          quarterly_price: 115.80,
          semiannual_price: 205.90,
          annual_price: 360.40,
          features: [
            '15 cookie cutters al mese',
            'Tutte le categorie',
            'Accesso alla community',
            'Anteprima nuovi design',
            'Accesso esclusivo a design speciali',
            'Design su richiesta (1 al mese)'
          ],
          is_popular: false
        }
      ];
      
      setSubscriptionPlans(plansData);
      
      // Se utente autenticato, simula recupero abbonamento attivo (se presente)
      if (isAuthenticated) {
        // Simula un utente con abbonamento Creator trimestrale
        setCurrentSubscription({
          id: 1,
          plan_id: 2,
          plan_name: 'Creator',
          status: 'active',
          billing_period: 'quarterly',
          start_date: '2025-01-15',
          end_date: '2025-04-15',
          next_billing_date: '2025-04-15',
          price: 64.50
        });
      }
      
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated]);

  // Ottieni il prezzo in base alla periodicità
  const getPriceByPeriodicity = (plan) => {
    switch (selectedPeriodicity) {
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

  // Calcola lo sconto rispetto al prezzo mensile
  const calculateDiscount = (plan) => {
    const monthlyPrice = plan.monthly_price;
    const currentPrice = getPriceByPeriodicity(plan);
    
    let months = 1;
    switch (selectedPeriodicity) {
      case 'quarterly':
        months = 3;
        break;
      case 'semiannual':
        months = 6;
        break;
      case 'annual':
        months = 12;
        break;
      default:
        months = 1;
    }
    
    const equivalentMonthlyPrice = currentPrice / months;
    const discountPercentage = ((monthlyPrice - equivalentMonthlyPrice) / monthlyPrice) * 100;
    
    return Math.round(discountPercentage);
  };

  // Gestisce il click sul pulsante "Scegli Piano"
  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/subscription', message: 'Accedi per sottoscrivere un abbonamento' } });
      return;
    }
    
    // Se l'utente ha già un abbonamento attivo, mostra un messaggio
    if (currentSubscription && currentSubscription.status === 'active') {
      setSelectedPlan(plan);
      setShowConfirmModal(true);
      return;
    }
    
    // Altrimenti procedi direttamente al checkout
    proceedToCheckout(plan);
  };

  // Procedi al checkout
  const proceedToCheckout = (plan) => {
    setIsProcessing(true);
    
    // Simula chiamata API per creare sessione checkout
    setTimeout(() => {
      console.log(`Checkout per piano: ${plan.name}, periodicità: ${selectedPeriodicity}`);
      // In un'applicazione reale, qui ci sarebbe una redirezione all'URL di checkout Stripe
      alert(`Checkout iniziato per piano ${plan.name} con periodicità ${selectedPeriodicity}`);
      setIsProcessing(false);
    }, 1500);
  };

  // Mostra stato di caricamento
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-700">Caricamento piani di abbonamento...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-bg min-h-screen pb-12">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Piani di Abbonamento</h1>
          <p className="mt-2">
            Scegli il piano perfetto per te e inizia a ricevere cookie cutters 3D unici ogni mese
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Avviso abbonamento attivo */}
        {currentSubscription && (
          <div className="bg-tertiary bg-opacity-20 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-tertiary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Hai già un abbonamento attivo</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    Hai un abbonamento <strong>{currentSubscription.plan_name}</strong> con fatturazione <strong>{
                      currentSubscription.billing_period === 'monthly' ? 'mensile' :
                      currentSubscription.billing_period === 'quarterly' ? 'trimestrale' :
                      currentSubscription.billing_period === 'semiannual' ? 'semestrale' : 'annuale'
                    }</strong>. 
                    Il tuo abbonamento si rinnoverà automaticamente il {new Date(currentSubscription.next_billing_date).toLocaleDateString('it-IT')}.
                  </p>
                  <p className="mt-2">
                    Se scegli un nuovo piano, l'abbonamento attuale verrà annullato e sostituito con il nuovo piano.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selettore periodicità */}
        <div className="mb-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Seleziona la periodicità</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setSelectedPeriodicity('monthly')}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedPeriodicity === 'monthly' 
                  ? 'border-primary bg-primary bg-opacity-5' 
                  : 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Mensile</h3>
                <div className={`w-5 h-5 rounded-full ${
                  selectedPeriodicity === 'monthly' 
                    ? 'bg-primary' 
                    : 'border border-gray-300'
                }`}>
                  {selectedPeriodicity === 'monthly' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pagamento mensile</p>
              <p className="text-sm mt-1">Nessuno sconto</p>
            </div>
            
            <div 
              onClick={() => setSelectedPeriodicity('quarterly')}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedPeriodicity === 'quarterly' 
                  ? 'border-primary bg-primary bg-opacity-5' 
                  : 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Trimestrale</h3>
                <div className={`w-5 h-5 rounded-full ${
                  selectedPeriodicity === 'quarterly' 
                    ? 'bg-primary' 
                    : 'border border-gray-300'
                }`}>
                  {selectedPeriodicity === 'quarterly' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pagamento ogni 3 mesi</p>
              <p className="text-sm mt-1 text-green-600">
                Sconto del 10% circa
              </p>
            </div>
            
            <div 
              onClick={() => setSelectedPeriodicity('semiannual')}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedPeriodicity === 'semiannual' 
                  ? 'border-primary bg-primary bg-opacity-5' 
                  : 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Semestrale</h3>
                <div className={`w-5 h-5 rounded-full ${
                  selectedPeriodicity === 'semiannual' 
                    ? 'bg-primary' 
                    : 'border border-gray-300'
                }`}>
                  {selectedPeriodicity === 'semiannual' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pagamento ogni 6 mesi</p>
              <p className="text-sm mt-1 text-green-600">
                Sconto del 20% circa
              </p>
            </div>
            
            <div 
              onClick={() => setSelectedPeriodicity('annual')}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedPeriodicity === 'annual' 
                  ? 'border-primary bg-primary bg-opacity-5' 
                  : 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Annuale</h3>
                <div className={`w-5 h-5 rounded-full ${
                  selectedPeriodicity === 'annual' 
                    ? 'bg-primary' 
                    : 'border border-gray-300'
                }`}>
                  {selectedPeriodicity === 'annual' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Pagamento annuale</p>
              <p className="text-sm mt-1 text-green-600">
                Sconto del 30% circa
              </p>
            </div>
          </div>
        </div>

        {/* Piani di abbonamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {subscriptionPlans.map(plan => {
            const price = getPriceByPeriodicity(plan);
            const discount = calculateDiscount(plan);
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition ${
                  plan.is_popular ? 'border-2 border-tertiary relative transform lg:-translate-y-2' : ''
                }`}
              >
                {plan.is_popular && (
                  <div className="bg-tertiary text-dark-text text-xs font-bold uppercase px-3 py-1 absolute top-0 right-0 rounded-bl-lg">
                    Più Popolare
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold">{price.toFixed(2)}€</span>
                      {selectedPeriodicity === 'monthly' ? (
                        <span className="text-gray-600 ml-1">/mese</span>
                      ) : (
                        <span className="text-gray-600 ml-1">
                          {selectedPeriodicity === 'quarterly' ? '/3 mesi' : 
                           selectedPeriodicity === 'semiannual' ? '/6 mesi' : '/anno'}
                        </span>
                      )}
                    </div>
                    
                    {selectedPeriodicity !== 'monthly' && (
                      <div className="mt-2 flex items-center text-green-600 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Risparmi il {discount}% rispetto al mensile
                      </div>
                    )}
                  </div>
                  
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-primary flex-shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isProcessing}
                    className={`block w-full text-center py-3 px-4 rounded-lg font-bold transition ${
                      plan.is_popular 
                        ? 'bg-primary text-white hover:bg-opacity-90' 
                        : 'bg-white border border-primary text-primary hover:bg-primary hover:text-white'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Elaborazione...
                      </div>
                    ) : currentSubscription && currentSubscription.plan_id === plan.id ? (
                      'Piano Attuale'
                    ) : (
                      'Scegli Piano'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ e CTA */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold mb-6">Domande Frequenti</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Quali materiali utilizzate per i cookie cutters?</h4>
                <p className="text-gray-600">I nostri cookie cutters sono stampati in 3D utilizzando PLA alimentare di alta qualità, resistente e sicuro per l'uso con gli alimenti.</p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Posso disdire l'abbonamento in qualsiasi momento?</h4>
                <p className="text-gray-600">Sì, puoi disdire l'abbonamento in qualsiasi momento dal tuo profilo. L'abbonamento rimarrà attivo fino alla fine del periodo pagato.</p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Come funziona il sistema di votazione?</h4>
                <p className="text-gray-600">Ogni mese, gli abbonati possono votare fino a 3 design per categoria. I design più votati vengono selezionati per la produzione del mese successivo.</p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Quando vengono spediti i cookie cutters?</h4>
                <p className="text-gray-600">I cookie cutters vengono spediti entro i primi 10 giorni di ogni mese. Riceverai una email con il tracking non appena il pacco sarà spedito.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 text-white rounded-lg shadow-md p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Soddisfatti o rimborsati</h3>
              <p className="mb-4">
                Se non sei soddisfatto del tuo primo set di cookie cutters, ti rimborsiamo completamente l'abbonamento. Nessuna domanda, nessuna complicazione.
              </p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-tertiary flex-shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>30 giorni di garanzia</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-tertiary flex-shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Rimborso completo</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-tertiary flex-shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Procedura semplice</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <p className="font-bold mb-2">Hai altre domande?</p>
              <button className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-tertiary hover:text-dark-text transition">
                Contatta il Supporto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal di conferma cambio piano */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowConfirmModal(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Conferma cambio piano
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Hai già un abbonamento attivo al piano <strong>{currentSubscription.plan_name}</strong>. 
                        Cambiando piano, l'abbonamento attuale verrà annullato e sostituito con il nuovo piano <strong>{selectedPlan.name}</strong>.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Il nuovo abbonamento inizierà immediatamente e ti verrà addebitato il costo del nuovo piano.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowConfirmModal(false);
                    proceedToCheckout(selectedPlan);
                  }}
                >
                  Conferma cambio piano
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;