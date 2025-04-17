// src/modules/categories/CategoryFilters.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CategoryFilters = ({ onChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'name',
    sortDir: 'asc',
    ...initialFilters
  });

  // Debounce search input to avoid too many requests
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange('search', searchInput);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchInput]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onChange?.(newFilters);
  }, [filters, onChange]);

  const handleSortChange = useCallback((sortValue) => {
    const [sortBy, sortDir] = sortValue.split(':');
    const newFilters = {
      ...filters,
      sortBy,
      sortDir
    };
    setFilters(newFilters);
    onChange?.(newFilters);
  }, [filters, onChange]);

  const handleReset = useCallback(() => {
    const defaultFilters = {
      search: '',
      status: 'all',
      sortBy: 'name',
      sortDir: 'asc'
    };
    setFilters(defaultFilters);
    setSearchInput('');
    onChange?.(defaultFilters);
  }, [onChange]);

  // Track if any filter is active
  const isFilterActive = 
    filters.search !== '' || 
    filters.status !== 'all' || 
    (filters.sortBy !== 'name' || filters.sortDir !== 'asc');

  return (
    <div className="bg-white p-4 shadow rounded-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div className="w-full md:w-96">
          <label htmlFor="search" className="sr-only">Cerca categorie</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Cerca per nome o descrizione"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FunnelIcon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <span>Stato: {filters.status === 'all' ? 'Tutti' : filters.status === 'active' ? 'Attive' : 'Inattive'}</span>
              <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>

            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleFilterChange('status', 'all')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Tutti
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleFilterChange('status', 'active')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Attive
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleFilterChange('status', 'inactive')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Inattive
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>

          {/* Sort Filter */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3z" />
              </svg>
              <span>Ordina per</span>
              <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
            </Menu.Button>

            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('name:asc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Nome (A-Z)
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('name:desc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Nome (Z-A)
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('designs_count:desc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Numero design (maggiore)
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('designs_count:asc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Numero design (minore)
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('created_at:desc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Data creazione (recente)
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleSortChange('created_at:asc')}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      Data creazione (meno recente)
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>

          {/* Reset Filters */}
          {isFilterActive && (
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleReset}
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;