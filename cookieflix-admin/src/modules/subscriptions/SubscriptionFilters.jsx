// src/modules/subscriptions/SubscriptionFilters.jsx
import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getSubscriptionPlans } from '../../services/subscriptionService';

const SubscriptionFilters = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [planId, setPlanId] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [plans, setPlans] = useState([]);
  const isInitialMount = useRef(true);

  // Carica i piani di abbonamento
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // In un'implementazione reale, useremmo:
        // const plansData = await getSubscriptionPlans();
        
        // Per ora, simuliamo i dati
        const mockPlans = [
          { id: 1, name: 'Starter' },
          { id: 2, name: 'Creator' },
          { id: 3, name: 'Master' },
          { id: 4, name: 'Collection' },
        ];
        setPlans(mockPlans);
      } catch (err) {
        console.error('Error fetching subscription plans:', err);
      }
    };
    
    fetchPlans();
  }, []);

  // Debounce della ricerca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Applica i filtri quando cambiano
  useEffect(() => {
    // Evita la prima chiamata all'mount del componente
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filters = {};
    
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    }
    
    if (status !== 'all') {
      filters.status = status;
    }
    
    if (planId !== 'all') {
      filters.plan_id = planId;
    }
    
    onFilterChange(filters);
  }, [debouncedSearch, status, planId, onFilterChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Cerca abbonamenti..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
      >
        <option value="all">Tutti gli stati</option>
        <option value="active">Attivi</option>
        <option value="pending">In attesa</option>
        <option value="cancelled">Cancellati</option>
        <option value="expired">Scaduti</option>
      </select>
      
      <select
        value={planId}
        onChange={(e) => setPlanId(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
      >
        <option value="all">Tutti i piani</option>
        {plans.map(plan => (
          <option key={plan.id} value={plan.id}>
            {plan.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubscriptionFilters;