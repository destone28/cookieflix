// src/modules/users/UserDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser, toggleUserStatus } from '../../services/userService';
import UserActivity from './UserActivity';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    is_admin: false,
    is_active: true,
    // altri campi che potrebbero essere presenti
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Per ora, simuliamo il recupero dei dati utente
        // Nella versione finale, useremmo: const userData = await getUserById(id);
        
        // Dati di esempio
        const userData = {
          id: parseInt(id),
          email: `user${id}@example.com`,
          full_name: `Utente ${id}`,
          is_active: true,
          is_admin: id === '1', // Solo il primo utente è admin
          created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          last_login: new Date(Date.now() - Math.random() * 1000000).toISOString(),
          subscriptions_count: Math.floor(Math.random() * 3),
          address: 'Via Roma 123',
          city: 'Roma',
          zip_code: '00100',
          country: 'Italia',
          credit_balance: Math.floor(Math.random() * 100),
          referral_code: 'ABC123',
          referred_by: null
        };
        
        setUser(userData);
        setFormData({
          full_name: userData.full_name,
          email: userData.email,
          is_admin: userData.is_admin,
          is_active: userData.is_active,
          address: userData.address,
          city: userData.city,
          zip_code: userData.zip_code,
          country: userData.country
        });
        setLoading(false);
      } catch (err) {
        setError('Errore durante il caricamento dei dati utente');
        console.error(err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In un'implementazione reale utilizzeremmo:
      // await updateUser(id, formData);
      
      // Per ora, aggiorniamo solo lo stato locale
      setUser(prev => ({
        ...prev,
        ...formData
      }));
      setIsEditing(false);
    } catch (err) {
      setError('Errore durante l\'aggiornamento dei dati utente');
      console.error(err);
    }
  };

  const handleToggleStatus = async () => {
    try {
      // In un'implementazione reale utilizzeremmo:
      // await toggleUserStatus(id, !user.is_active);
      
      // Per ora, aggiorniamo solo lo stato locale
      setUser(prev => ({
        ...prev,
        is_active: !prev.is_active
      }));
      setFormData(prev => ({
        ...prev,
        is_active: !prev.is_active
      }));
    } catch (err) {
      setError('Errore durante l\'aggiornamento dello stato dell\'utente');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Caricamento in corso...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Utente non trovato</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dettaglio Utente</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualizza e modifica i dettagli dell'utente
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Torna alla lista
          </button>
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              user.is_active 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            {user.is_active ? 'Disattiva Account' : 'Attiva Account'}
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Informazioni Utente
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Dettagli personali e informazioni dell'account.
            </p>
          </div>
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Modifica
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annulla
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="border-t border-gray-200">
            <dl>
              {/* Nome completo */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nome completo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-primary focus:border-primary sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  />
                </dd>
              </div>
              
              {/* Email */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Indirizzo email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-primary focus:border-primary sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  />
                </dd>
              </div>
              
              {/* Indirizzo */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Indirizzo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-primary focus:border-primary sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  />
                </dd>
              </div>
              
              {/* Città */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Città</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-primary focus:border-primary sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  />
                </dd>
              </div>
              
              {/* CAP */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">CAP</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-primary focus:border-primary sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  />
                </dd>
              </div>
              
              {/* Paese */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Paese</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-primary focus:border-primary sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                  />
                </dd>
              </div>
              
              {/* Admin */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Amministratore</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    type="checkbox"
                    name="is_admin"
                    checked={formData.is_admin}
                    onChange={handleInputChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />{' '}
                  <span className="ml-2">
                    Concedi privilegi di amministratore
                  </span>
                </dd>
              </div>
              
              {/* Pulsanti */}
              <div className="bg-white px-4 py-5 sm:px-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Salva
                </button>
              </div>
            </dl>
          </form>
        ) : (
          <dl className="border-t border-gray-200">
            {/* Nome completo */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nome completo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.full_name}
              </dd>
            </div>
            
            {/* Email */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Indirizzo email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>
            
            {/* Stato */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Stato</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_active ? 'Attivo' : 'Inattivo'}
                </span>
              </dd>
            </div>
            
            {/* Ruolo */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ruolo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.is_admin ? 'Amministratore' : 'Utente'}
              </dd>
            </div>
            
            {/* Data registrazione */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Data registrazione</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(user.created_at).toLocaleString('it-IT')}
              </dd>
            </div>
            
            {/* Ultimo accesso */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ultimo accesso</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.last_login ? new Date(user.last_login).toLocaleString('it-IT') : 'Mai'}
              </dd>
            </div>
            
            {/* Indirizzo */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Indirizzo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.address || '-'}, {user.city || '-'}, {user.zip_code || '-'}, {user.country || '-'}
              </dd>
            </div>
            
            {/* Credito */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Saldo credito</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.credit_balance.toLocaleString('it-IT', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </dd>
            </div>
            
            {/* Codice referral */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Codice referral</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.referral_code}
              </dd>
            </div>
            
            {/* Referente */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Referente</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.referred_by || 'Nessuno'}
              </dd>
            </div>
          </dl>
        )}
      </div>
      
      {/* Sezione Attività Utente */}
      <div className="mt-8">
        <UserActivity userId={id} />
      </div>
    </div>
  );
};

export default UserDetail;