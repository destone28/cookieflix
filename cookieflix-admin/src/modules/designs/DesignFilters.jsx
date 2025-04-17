// src/modules/designs/DesignFilters.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories } from '../../services/categoryService';

const DesignFilters = ({ onChange }) => {
  const [categories, setCategories] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: 'all',
    category_id: '',
    sortBy: 'created_at',
    sortDir: 'desc'
  });
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const initialRender = useRef(true);

  // Carica categorie
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await getCategories({ pageSize: 100, status: 'active' });
        setCategories(response.categories || []);
      } catch (err) {
        console.error("Errore nel caricamento delle categorie:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Invia i filtri al component parent quando cambiano
  useEffect(() => {
    // Salta il primo render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Debounce per la ricerca testuale
    const timer = setTimeout(() => {
      onChange(localFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilters, onChange]);

  // Gestione cambiamenti nei filtri
  const handleFilterChange = useCallback((name, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Reset dei filtri
  const handleReset = () => {
    setLocalFilters({
      search: '',
      status: 'all',
      category_id: '',
      sortBy: 'created_at',
      sortDir: 'desc'
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="text-lg font-medium mb-4">Filtri</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Ricerca */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Ricerca
          </label>
          <input
            type="text"
            id="search"
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Nome o descrizione..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Stato */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Stato
          </label>
          <select
            id="status"
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Tutti</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            id="category_id"
            value={localFilters.category_id}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={categoriesLoading}
          >
            <option value="">Tutte le categorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ordinamento */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Ordina per
            </label>
            <select
              id="sortBy"
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="name">Nome</option>
              <option value="category">Categoria</option>
              <option value="created_at">Data Creazione</option>
              <option value="votes_count">Numero Voti</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="sortDir" className="block text-sm font-medium text-gray-700 mb-1">
              Direzione
            </label>
            <select
              id="sortDir"
              value={localFilters.sortDir}
              onChange={(e) => handleFilterChange('sortDir', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pulsante reset */}
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
        >
          Reset filtri
        </button>
      </div>
    </div>
  );
};

export default DesignFilters;