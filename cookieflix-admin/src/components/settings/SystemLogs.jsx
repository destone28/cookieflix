import React, { useState, useEffect, useRef } from 'react';
import { getSystemLogs, updateLogSettings, clearLogs } from '../../services/settingsService';
import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [logLevels, setLogLevels] = useState({
    INFO: true,
    WARNING: true,
    ERROR: true
  });
  const [logModules, setLogModules] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  
  // Ref per tenere traccia se il componente è montato
  const isMounted = useRef(true);
  
  // Opzioni di intervallo temporale
  const timeRangeOptions = [
    { value: 'all', label: 'Tutti i log' },
    { value: 'today', label: 'Oggi' },
    { value: 'yesterday', label: 'Ieri' },
    { value: 'week', label: 'Ultima settimana' },
    { value: 'month', label: 'Ultimo mese' }
  ];

  // Carica i log e le impostazioni
  useEffect(() => {
    // Cleanup function per gestire il componente smontato
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effetto per caricare i log quando cambiano i filtri o la pagina
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        
        // Prepara i parametri per la richiesta
        const params = {
          page: currentPage,
          limit: 10,
          level: selectedLevel || undefined,
          module: selectedModule || undefined,
          timeRange: timeRange !== 'all' ? timeRange : undefined
        };
        
        const data = await getSystemLogs(params);
        
        if (isMounted.current) {
          setLogs(data.logs);
          setTotalItems(data.totalItems);
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
          
          // Estrai moduli unici da tutti i log e inizializza i filtri
          if (data.logs.length > 0 && Object.keys(logModules).length === 0) {
            const modules = {};
            data.logs.forEach(log => {
              if (log.module) {
                modules[log.module] = true;
              }
            });
            setLogModules(modules);
          }
          
          setLoading(false);
        }
      } catch (err) {
        if (isMounted.current) {
          setError('Errore nel caricamento dei log di sistema');
          setLoading(false);
          console.error(err);
        }
      }
    };

    fetchLogs();
  }, [currentPage, selectedLevel, selectedModule, timeRange]);

  // Gestisce il cambio pagina
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gestisce il cambio dei filtri di livello log
  const handleLevelFilterChange = (level) => {
    setSelectedLevel(selectedLevel === level ? '' : level);
    setCurrentPage(1);
  };

  // Gestisce il cambio dei filtri di modulo
  const handleModuleFilterChange = (module) => {
    setSelectedModule(selectedModule === module ? '' : module);
    setCurrentPage(1);
  };

  // Gestisce il cambio dell'intervallo temporale
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    setCurrentPage(1);
  };

  // Aggiorna le impostazioni dei log
  const handleUpdateLogSettings = async (settings) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateLogSettings(settings);
      
      setSuccessMessage('Impostazioni log aggiornate con successo');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setLoading(false);
    } catch (err) {
      setError('Errore nell\'aggiornamento delle impostazioni log');
      setLoading(false);
      console.error(err);
    }
  };

  // Cancella tutti i log
  const handleClearLogs = async () => {
    try {
      setClearing(true);
      setError(null);
      
      await clearLogs();
      
      // Aggiorna lo stato per mostrare i log vuoti
      setLogs([]);
      setTotalItems(0);
      setTotalPages(1);
      setCurrentPage(1);
      
      setSuccessMessage('Log di sistema cancellati con successo');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setClearing(false);
      setShowClearConfirm(false);
    } catch (err) {
      setError('Errore nella cancellazione dei log di sistema');
      setClearing(false);
      setShowClearConfirm(false);
      console.error(err);
    }
  };

  // Formatta la data del log
  const formatLogDate = (dateString) => {
    const date = new Date(dateString);
    
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Restituisce l'icona appropriata per il livello del log
  const getLevelIcon = (level) => {
    switch (level) {
      case 'INFO':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'ERROR':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Restituisce la classe CSS appropriata per il livello del log
  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Log di Sistema</h2>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}
        
        <div className="space-y-6">
          {/* Filtri */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              {/* Filtri livello */}
              <div className="space-x-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Livello:</span>
                <button
                  onClick={() => handleLevelFilterChange('INFO')}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded ${
                    selectedLevel === 'INFO' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  INFO
                </button>
                <button
                  onClick={() => handleLevelFilterChange('WARNING')}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded ${
                    selectedLevel === 'WARNING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  WARNING
                </button>
                <button
                  onClick={() => handleLevelFilterChange('ERROR')}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded ${
                    selectedLevel === 'ERROR' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  ERROR
                </button>
              </div>
              
              {/* Filtri modulo */}
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Modulo:</span>
                <select
                  value={selectedModule}
                  onChange={(e) => handleModuleFilterChange(e.target.value)}
                  className="rounded-md border border-gray-300 shadow-sm px-3 py-1.5 text-xs focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Tutti</option>
                  {Object.keys(logModules).map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtri temporali */}
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Periodo:</span>
                <select
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  className="rounded-md border border-gray-300 shadow-sm px-3 py-1.5 text-xs focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Pulsante cancella log */}
              <div>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Cancella log
                </button>
              </div>
            </div>
          </div>
          
          {/* Tabella log */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-2 text-gray-500">Caricamento log...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nessun log trovato.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livello</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modulo</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messaggio</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {formatLogDate(log.timestamp)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeClass(log.level)}`}>
                                {getLevelIcon(log.level)}
                                <span className="ml-1">{log.level}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {log.module}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 break-all">
                            {log.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginazione */}
                <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostra <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> a <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> di <span className="font-medium">{totalItems}</span> risultati
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Precedente
                        </button>
                        
                        {/* Numeri pagina */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                pageNum === currentPage ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Successiva
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal di conferma cancellazione log */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <ExclamationTriangleIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Conferma cancellazione</h3>
            <p className="text-sm text-gray-500 mb-4">
              Stai per cancellare tutti i log di sistema. Questa operazione non può essere annullata. Sei sicuro di voler procedere?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={clearing}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {clearing ? 'Cancellazione...' : 'Cancella tutti i log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SystemLogs;