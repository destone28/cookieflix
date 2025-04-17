// src/modules/subscriptions/SubscriptionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubscriptionById, updateSubscription, cancelSubscription } from '../../services/subscriptionService';
import SubscriptionPayments from './SubscriptionPayments';
import CancelSubscriptionModal from './CancelSubscriptionModal';

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        // In un'implementazione reale, useremmo:
        // const subscriptionData = await getSubscriptionById(id);
        
        // Per ora, simuliamo i dati
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dati di esempio
        const plans = {
          1: { id: 1, name: 'Starter', monthly_price: 15.90 },
          2: { id: 2, name: 'Creator', monthly_price: 23.90 },
          3: { id: 3, name: 'Master', monthly_price: 29.90 },
          4: { id: 4, name: 'Collection', monthly_price: 42.90 }
        };
        
        const periods = {
          'monthly': 'Mensile',
          'quarterly': 'Trimestrale',
          'semiannual': 'Semestrale',
          'annual': 'Annuale'
        };
        
        const planId = Math.floor(Math.random() * 4) + 1;
        const periodKeys = Object.keys(periods);
        const period = periodKeys[Math.floor(Math.random() * periodKeys.length)];
        const isActive = Math.random() > 0.2;
        const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        let endDate;
        
        if (period === 'monthly') {
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (period === 'quarterly') {
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 3);
        } else if (period === 'semiannual') {
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 6);
        } else { // annual
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        
        const mockSubscription = {
          id: parseInt(id),
          user_id: Math.floor(Math.random() * 20) + 1,
          user_email: `user${Math.floor(Math.random() * 20) + 1}@example.com`,
          user_name: `Utente ${Math.floor(Math.random() * 20) + 1}`,
          plan_id: planId,
          plan: plans[planId],
          billing_period: period,
          period_display: periods[period],
          is_active: isActive,
          status: isActive ? 'active' : Math.random() > 0.5 ? 'cancelled' : 'expired',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          stripe_customer_id: `cus_${Math.random().toString(36).substring(2, 15)}`,
          stripe_subscription_id: `sub_${Math.random().toString(36).substring(2, 15)}`,
          next_billing_date: isActive ? endDate.toISOString() : null,
          cancel_at_period_end: false,
          cancel_reason: null,
          created_at: startDate.toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setSubscription(mockSubscription);
        setLoading(false);
      } catch (err) {
        setError('Errore durante il caricamento dei dati dell\'abbonamento');
        console.error(err);
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [id]);

  const handleCancelSubscription = async (subscriptionId, reason) => {
    try {
      // In un'implementazione reale, useremmo:
      // await cancelSubscription(subscriptionId, reason);
      
      // Per ora, aggiorniamo solo lo stato locale
      setSubscription(prev => ({
        ...prev,
        status: 'cancelled',
        is_active: false,
        next_billing_date: null,
        cancel_reason: reason,
        updated_at: new Date().toISOString()
      }));
      
      // Mostra una notifica di successo
    } catch (err) {
      // Mostra una notifica di errore
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'pending':
        return 'In attesa';
      case 'cancelled':
        return 'Cancellato';
      case 'expired':
        return 'Scaduto';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-center p-10">Caricamento in corso...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  if (!subscription) {
    return <div className="text-center p-10">Abbonamento non trovato</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dettaglio Abbonamento</h1>
          <p className="mt-1 text-sm text-gray-500">
            Abbonamento #{subscription.id} per {subscription.user_name}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/subscriptions')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Torna alla lista
          </button>
          {subscription.status === 'active' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancella Abbonamento
            </button>
          )}
        </div>
      </div>
      
      {/* Modal di cancellazione */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        subscriptionId={subscription.id}
      />
      
      {/* Dettagli abbonamento */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Informazioni Abbonamento
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Dettagli e configurazione dell'abbonamento.
            </p>
          </div>
          <div>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}
            >
              {getStatusDisplay(subscription.status)}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            {/* Piano */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Piano</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.plan.name}
              </dd>
            </div>
            
            {/* Utente */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Utente</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.user_name} ({subscription.user_email})
              </dd>
            </div>
            
            {/* Periodo di fatturazione */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Periodo di fatturazione</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.period_display}
              </dd>
            </div>
            
            {/* Prezzo */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Prezzo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.plan.monthly_price.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                })}
                {subscription.billing_period !== 'monthly' && subscription.billing_period === 'quarterly' && (
                  <span className="text-gray-500"> (
                    {(subscription.plan.monthly_price * 3).toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR'
                    })} per trimestre)
                  </span>
                )}
                {subscription.billing_period !== 'monthly' && subscription.billing_period === 'semiannual' && (
                  <span className="text-gray-500"> (
                    {(subscription.plan.monthly_price * 6).toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR'
                    })} per semestre)
                  </span>
                )}
                {subscription.billing_period !== 'monthly' && subscription.billing_period === 'annual' && (
                  <span className="text-gray-500"> (
                    {(subscription.plan.monthly_price * 12).toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR'
                    })} per anno)
                  </span>
                )}
              </dd>
            </div>
            
            {/* Data inizio */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Data inizio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(subscription.start_date).toLocaleDateString('it-IT')}
              </dd>
            </div>
            
            {/* Data fine */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Data fine periodo corrente</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(subscription.end_date).toLocaleDateString('it-IT')}
              </dd>
            </div>
            
            {/* Prossimo rinnovo */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Prossimo rinnovo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.next_billing_date 
                  ? new Date(subscription.next_billing_date).toLocaleDateString('it-IT')
                  : 'Nessun rinnovo previsto'}
              </dd>
            </div>
            
            {/* Stripe Customer ID */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ID Cliente Stripe</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.stripe_customer_id}
              </dd>
            </div>
            
            {/* Stripe Subscription ID */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ID Abbonamento Stripe</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {subscription.stripe_subscription_id}
              </dd>
            </div>
            
            {/* Motivo cancellazione */}
            {subscription.cancel_reason && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Motivo cancellazione</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {subscription.cancel_reason}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      {/* Sezione Pagamenti */}
      <div className="mt-8">
        <SubscriptionPayments subscriptionId={id} />
      </div>
    </div>
  );
};

export default SubscriptionDetail;