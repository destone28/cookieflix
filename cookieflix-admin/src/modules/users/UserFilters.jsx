// src/modules/users/UserFilters.jsx
import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const UserFilters = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const isInitialMount = useRef(true);

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
    
    onFilterChange(filters);
  }, [debouncedSearch, status, onFilterChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Cerca utenti..."
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
        <option value="all">Tutti gli utenti</option>
        <option value="active">Solo attivi</option>
        <option value="inactive">Solo inattivi</option>
      </select>
    </div>
  );
};

export default UserFilters;