// src/modules/users/UserActivity.jsx
import { useState, useEffect } from 'react';
import { getUserActivity } from '../../services/userService';
import Pagination from '../../components/common/Pagination';

const UserActivity = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activityType, setActivityType] = useState('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // In un'implementazione reale, useremmo:
        // const response = await getUserActivity(userId, currentPage, itemsPerPage);

        // Dati simulati per ora
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generiamo attività fittizie
        const types = ['login', 'subscription', 'payment', 'vote', 'profile_update'];
        const messages = {
          login: 'Accesso al sistema',
          subscription: 'Abbonamento modificato',
          payment: 'Pagamento effettuato',
          vote: 'Voto per un design',
          profile_update: 'Profilo aggiornato'
        };
        
        // Genera attività casuali
        const mockActivities = Array.from({ length: 20 }, (_, index) => {
          const type = types[Math.floor(Math.random() * types.length)];
          return {
            id: index + 1,
            type,
            message: messages[type],
            ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            details: type === 'subscription' 
              ? 'Piano: Creator, Periodo: Mensile' 
              : type === 'payment' 
                ? 'Importo: €23,90' 
                : type === 'vote' 
                  ? 'Design: Cookie Unicorno'
                  : ''
          };
        });
        
        // Filtra per tipo se necessario
        let filteredActivities = [...mockActivities];
        if (activityType !== 'all') {
          filteredActivities = filteredActivities.filter(activity => activity.type === activityType);
        }
        
        // Simula la paginazione
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedActivities = filteredActivities.slice(start, end);
        
        setActivities(paginatedActivities);
        setTotalPages(Math.ceil(filteredActivities.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        setError('Errore durante il caricamento delle attività');
        console.error(err);
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, currentPage, itemsPerPage, activityType]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'subscription':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'vote':
        return 'bg-yellow-100 text-yellow-800';
      case 'profile_update':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Attività Utente
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Cronologia delle attività recenti dell'utente.
          </p>
        </div>
        
        <div>
          <select
            value={activityType}
            onChange={(e) => {
              setActivityType(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="all">Tutte le attività</option>
            <option value="login">Accessi</option>
            <option value="subscription">Abbonamenti</option>
            <option value="payment">Pagamenti</option>
            <option value="vote">Voti</option>
            <option value="profile_update">Aggiornamenti profilo</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center p-10">
          <p>Caricamento attività in corso...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-6">{error}</div>
      ) : activities.length === 0 ? (
        <div className="text-center p-10">
          <p>Nessuna attività trovata per questo utente.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messaggio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dettagli
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityTypeColor(activity.type)}`}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.details || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleString('it-IT')}
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

export default UserActivity;