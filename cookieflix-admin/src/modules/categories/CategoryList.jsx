// src/modules/categories/CategoryList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import Pagination from '../../components/common/Pagination';
import CategoryFilters from './CategoryFilters';
import { getCategories, updateCategory, deleteCategory } from '../../services/categoryService';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'name',
    sortDir: 'asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Effetto per caricare le categorie quando cambiano filtri o paginazione
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        });
        
        setCategories(data.categories || []);
        setPagination({
          page: data.page || 1,
          pageSize: data.pageSize || 10,
          total: data.total || 0,
          totalPages: data.totalPages || 1
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Impossibile caricare le categorie. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [filters, pagination.page, pagination.pageSize]);

  // Handler per il cambio filtri
  const handleFilterChange = useCallback((newFilters) => {
    console.log('Nuovi filtri applicati:', newFilters);
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  }, []);

  const handleItemsPerPageChange = useCallback((newPageSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 1 // Reset to first page when changing items per page
    }));
  }, []);

  const toggleCategoryStatus = async (id, isActive) => {
    try {
      await updateCategory(id, { is_active: !isActive });
      // Update local state
      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, is_active: !cat.is_active } : cat
      ));
    } catch (err) {
      console.error(`Error toggling category status:`, err);
      alert('Impossibile aggiornare lo stato della categoria. Riprova più tardi.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa categoria? Questa azione non può essere annullata.')) {
      return;
    }
    
    try {
      await deleteCategory(id);
      // Update the UI
      setCategories(categories.filter(cat => cat.id !== id));
      // Update total count
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.pageSize)
      }));
    } catch (err) {
      console.error(`Error deleting category:`, err);
      alert('Impossibile eliminare la categoria. Riprova più tardi.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Elenco Categorie</h3>
        <Link
          to="/categories/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span>Nuova Categoria</span>
        </Link>
      </div>
      
      <CategoryFilters onChange={handleFilterChange} />
      
      {error && (
        <div className="p-4 text-red-700 bg-red-100 border-l-4 border-red-500" role="alert">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Design
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stato
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Creazione
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ultima Modifica
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2">Caricamento...</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  Nessuna categoria trovata
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {category.image_url ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={category.image_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.designs_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.is_active ? 'Attiva' : 'Inattiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(category.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(category.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                        className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white ${
                          category.is_active
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        title={category.is_active ? 'Disattiva' : 'Attiva'}
                      >
                        {category.is_active ? (
                          <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                      <Link
                        to={`/categories/${category.id}/edit`}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Modifica"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Elimina"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && categories.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total || 0} 
            pageSize={pagination.pageSize || 10}
            itemsPerPage={pagination.pageSize || 10}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryList;