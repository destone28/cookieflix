// src/modules/users/UserList.jsx
import { useState, useEffect } from 'react';
import { getUsers, toggleUserStatus } from '../../services/userService';
import { Link } from 'react-router-dom';
import UserFilters from './UserFilters';
import Pagination from '../../components/common/Pagination';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // In un'implementazione reale, utilizzeremmo le API
      // Per ora, simuliamo i dati
      
      // Simula un ritardo di rete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dati di esempio
      const mockUsers = Array.from({ length: 25 }, (_, index) => ({
        id: index + 1,
        email: `user${index + 1}@example.com`,
        full_name: `Utente ${index + 1}`,
        is_active: Math.random() > 0.2, // 80% sono attivi
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        is_admin: index === 0, // Solo il primo utente è admin
        subscriptions_count: Math.floor(Math.random() * 3)
      }));
      
      // Filtraggio simulato
      let filteredUsers = [...mockUsers];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user => user.email.toLowerCase().includes(searchLower) || 
                 user.full_name.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status === 'active') {
        filteredUsers = filteredUsers.filter(user => user.is_active);
      } else if (filters.status === 'inactive') {
        filteredUsers = filteredUsers.filter(user => !user.is_active);
      }
      
      // Paginazione simulata
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedUsers = filteredUsers.slice(start, end);
      
      setUsers(paginatedUsers);
      setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
      setTotalUsers(filteredUsers.length);
      setLoading(false);
      
      // Nella versione reale, utilizzeremmo:
      // const response = await getUsers(currentPage, itemsPerPage, filters);
      // setUsers(response.data);
      // setTotalPages(response.total_pages);
      // setTotalUsers(response.total);
    } catch (err) {
      setError('Errore durante il caricamento degli utenti');
      console.error(err);
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset alla prima pagina quando cambiano i filtri
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset alla prima pagina quando cambia il numero di elementi per pagina
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      // In un'implementazione reale, chiameremmo l'API
      // await toggleUserStatus(userId, !currentStatus);
      
      // Per ora, aggiorniamo lo stato locale
      setUsers(users.map(user => 
        user.id === userId ? {...user, is_active: !currentStatus} : user
      ));
    } catch (err) {
      setError(`Errore durante l'aggiornamento dello stato dell'utente`);
      console.error(err);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Utenti</h2>
          <p className="mt-1 text-sm text-gray-500">
            {totalUsers} utenti totali
          </p>
        </div>
        <UserFilters onFilterChange={handleFiltersChange} />
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
                    Stato
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrato il
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abbonamenti
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {user.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Attivo' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.subscriptions_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.is_admin ? 'Admin' : 'Utente'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/users/${user.id}`}
                        className="text-primary hover:text-opacity-70 mr-4"
                      >
                        Dettagli
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`${
                          user.is_active
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.is_active ? 'Disattiva' : 'Attiva'}
                      </button>
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

export default UserList;