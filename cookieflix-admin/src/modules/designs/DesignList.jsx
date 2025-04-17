// src/modules/designs/DesignList.jsx
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
import DesignFilters from './DesignFilters';
import { getDesigns, updateDesign, deleteDesign } from '../../services/designService';

const DesignList = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category_id: '',
    sortBy: 'created_at',
    sortDir: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Effetto per caricare i design quando cambiano filtri o paginazione
  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true);
      try {
        const data = await getDesigns({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        });
        
        setDesigns(data.designs || []);
        setPagination({
          page: parseInt(data.page) || 1,
          pageSize: parseInt(data.pageSize) || 10,
          total: parseInt(data.total) || 0,
          totalPages: parseInt(data.totalPages) || 1
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching designs:', err);
        setError('Impossibile caricare i design. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
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
      page: parseInt(newPage) || 1
    }));
  }, []);

  const handleItemsPerPageChange = useCallback((newPageSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize: parseInt(newPageSize) || 10,
      page: 1 // Reset to first page when changing items per page
    }));
  }, []);

  const toggleDesignStatus = async (id, isActive) => {
    try {
      await updateDesign(id, { is_active: !isActive });
      // Update local state
      setDesigns(designs.map(design => 
        design.id === id ? { ...design, is_active: !design.is_active } : design
      ));
    } catch (err) {
      console.error(`Error toggling design status:`, err);
      alert('Impossibile aggiornare lo stato del design. Riprova più tardi.');
    }
  };

  const handleDeleteDesign = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo design? Questa azione non può essere annullata.')) {
      return;
    }
    
    try {
      await deleteDesign(id);
      // Update the UI
      setDesigns(designs.filter(design => design.id !== id));
      // Update total count
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.pageSize)
      }));
    } catch (err) {
      console.error(`Error deleting design:`, err);
      alert('Impossibile eliminare il design. Riprova più tardi.');
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
        <h3 className="text-lg leading-6 font-medium text-gray-900">Elenco Design</h3>
        <Link
          to="/designs/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span>Nuovo Design</span>
        </Link>
      </div>
      
      <DesignFilters onChange={handleFilterChange} />
      
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
                Design
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voti
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
            ) : designs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  Nessun design trovato
                </td>
              </tr>
            ) : (
              designs.map((design) => (
                <tr key={design.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {design.image_url ? (
                          <img className="h-10 w-10 rounded-md object-cover" src={design.image_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {design.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {design.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {design.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {design.votes_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        design.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {design.is_active ? 'Attivo' : 'Inattivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(design.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(design.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => toggleDesignStatus(design.id, design.is_active)}
                        className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white ${
                          design.is_active
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        title={design.is_active ? 'Disattiva' : 'Attiva'}
                      >
                        {design.is_active ? (
                          <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                      <Link
                        to={`/designs/${design.id}/edit`}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Modifica"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
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
      
      {!loading && designs.length > 0 && (
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

export default DesignList;