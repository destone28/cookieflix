// src/modules/subscriptions/SubscriptionList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSubscriptions } from '../../services/subscriptionService';
import SubscriptionFilters from './SubscriptionFilters';
import Pagination from '../../components/common/Pagination';

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [filters, setFilters] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      // In un'implementazione reale, utilizzeremmo le API
      // Per ora, simuliamo i dati
      
      // Simula un ritardo di rete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Piani di abbonamento
      const plans = {
        1: { name: 'Starter', monthly_price: 15.90 },
        2: { name: 'Creator', monthly_price: 23.90 },
        3: { name: 'Master', monthly_price: 29.90 },
        4: { name: 'Collection', monthly_price: 42.90 }
      };
      
      // Periodi
      const periods = {
        'monthly': 'Mensile',
        'quarterly': 'Trimestrale',
        'semiannual': 'Semestrale',
        'annual': 'Annuale'
      };
      
      // Dati di esempio
      const mockSubscriptions = Array.from({ length: 25 }, (_, index) => {
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
        
        return {
          id: index + 1,
          user_id: Math.floor(Math.random() * 20) + 1,
          user_email: `user${Math.floor(Math.random() * 20) + 1}@example.com`,
          user_name: `Utente ${Math.floor(Math.random() * 20) + 1}`,
          plan_id: planId,
          plan_name: plans[planId].name,
          price: plans[planId].monthly_price,
          billing_period: period,
          period_display: periods[period],
          is_active: isActive,
          status: isActive ? 'active' : Math.random() > 0.5 ? 'cancelled' : 'expired',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          stripe_subscription_id: `sub_${Math.random().toString(36).substring(2, 15)}`,
          next_billing_date: isActive ? endDate.toISOString() : null
        };
      });
      
      // Filtraggio simulato
      let filteredSubscriptions = [...mockSubscriptions];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredSubscriptions = filteredSubscriptions.filter(
          sub => sub.user_email.toLowerCase().includes(searchLower) || 
                 sub.user_name.toLowerCase().includes(searchLower) ||
                 sub.stripe_subscription_id.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status) {
        filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === filters.status);
      }
      
      if (filters.plan_id) {
        filteredSubscriptions = filteredSubscriptions.filter(sub => sub.plan_id === parseInt(filters.plan_id));
      }
      
      // Paginazione simulata
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedSubscriptions = filteredSubscriptions.slice(start, end);
      
      setSubscriptions(paginatedSubscriptions);
      setTotalPages(Math.ceil(filteredSubscriptions.length / itemsPerPage));
      setTotalSubscriptions(filteredSubscriptions.length);
      setLoading(false);
    } catch (err) {
      setError('Errore durante il caricamento degli abbonamenti');
      console.error(err);
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
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

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Abbonamenti</h2>
          <p className="mt-1 text-sm text-gray-500">
            {totalSubscriptions} abbonamenti totali
          </p>
        </div>
        <SubscriptionFilters onFilterChange={handleFiltersChange} />
      </div>
      
      {loading ? (
        <div className="text-center p-10">
          <p>Caricamento in corso...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Piano
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data inizio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prossimo rinnovo
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {subscription.user_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.user_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subscription.plan_name}</div>
                      <div className="text-sm text-gray-500">
                        {subscription.price.toLocaleString('it-IT', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.period_display}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}
                      >
                        {getStatusDisplay(subscription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.start_date).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.next_billing_date
                        ? new Date(subscription.next_billing_date).toLocaleDateString('it-IT')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/subscriptions/${subscription.id}`}
                        className="text-primary hover:text-opacity-70"
                      >
                        Dettagli
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionList;