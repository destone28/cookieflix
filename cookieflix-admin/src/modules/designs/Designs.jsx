// src/modules/designs/Designs.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDesigns, getDesignStats } from '../../services/designService';
import DesignList from './DesignList';
import DesignFilters from './DesignFilters';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1  // Assicuriamoci che totalPages abbia sempre un valore sensato
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category_id: '',
    sortBy: 'created_at',
    sortDir: 'desc'
  });

  // Carica statistiche
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDesignStats();
        setStats(data);
      } catch (err) {
        console.error("Errore nel caricamento delle statistiche:", err);
      }
    };

    fetchStats();
  }, []);

  // Funzione per caricare i design
  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize
      };
      
      const response = await getDesigns(params);
      
      setDesigns(response.designs || []);
      setPagination({
        page: parseInt(response.page) || 1,
        pageSize: parseInt(response.pageSize) || 10,
        total: parseInt(response.total) || 0,
        totalPages: parseInt(response.totalPages) || 1
      });
      setError(null);
    } catch (err) {
      console.error("Errore nel caricamento dei design:", err);
      setError("Si è verificato un errore nel caricamento dei design. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Carica design con filtri e paginazione
  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Gestione cambio pagina
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({
      ...prev,
      page: parseInt(newPage) || 1
    }));
  }, []);

  // Gestione cambio filtri
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // Reset della pagina quando cambiano i filtri
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  // Refresh dei dati
  const handleRefresh = useCallback(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestione Design</h1>
        <Link 
          to="/designs/create" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Nuovo Design
        </Link>
      </div>

      {/* Statistiche */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Design Totali</h3>
            <p className="text-2xl font-semibold">{stats.totalDesigns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Design Attivi</h3>
            <p className="text-2xl font-semibold">{stats.activeDesigns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Voti Totali</h3>
            <p className="text-2xl font-semibold">{stats.totalVotes}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Media Voti per Design</h3>
            <p className="text-2xl font-semibold">
              {stats.totalDesigns > 0 ? (stats.totalVotes / stats.totalDesigns).toFixed(1) : "0"}
            </p>
          </div>
        </div>
      )}

      {/* Top Design */}
      {stats && stats.mostVotedDesigns && stats.mostVotedDesigns.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Design Più Votati</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.mostVotedDesigns.map(design => (
              <div key={design.id} className="bg-white p-4 rounded-lg shadow">
                <div className="font-medium">{design.name}</div>
                <div className="text-sm text-gray-500">{design.category_name}</div>
                <div className="text-sm mt-1">
                  <span className="font-semibold">{design.votes_count}</span> voti
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista design */}
      {error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <DesignList 
          designs={designs} 
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default Designs;