// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveSubscription } from '../services/subscriptionService';
import { updateUserProfile, getCurrentUserProfile } from '../services/userService';

const Profile = () => {
  const { user, loading, logout, setUser } = useAuth();
  const defaultBirthdate = '1985-01-01';
  const navigate = useNavigate();
  
  // Stato per i dati del form
  const [formData, setFormData] = useState({
    address: '',
    street_number: '',
    city: '',
    zip_code: '',
    country: '',
    birthdate: '',
  });
  
  // Stati per gestire l'editing dei campi
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingBirthdate, setEditingBirthdate] = useState(false);
  
  const [subscription, setSubscription] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Stato per conferma logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Carica l'abbonamento dell'utente
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getActiveSubscription();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };
    
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Carica i dati dell'utente nel form
  useEffect(() => {
    if (user) {
      setFormData({
        address: user.address || '',
        street_number: user.street_number || '',
        city: user.city || '',
        zip_code: user.zip_code || '',
        country: user.country || '',
        birthdate: user.birthdate || defaultBirthdate,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Funzione per recuperare i dati aggiornati dell'utente
  const refreshUserData = async () => {
    try {
      const updatedUserData = await getCurrentUserProfile();
      // Aggiorna il contesto utente con i nuovi dati
      setUser(updatedUserData);
    } catch (error) {
      console.error('Errore nel recupero dei dati aggiornati:', error);
    }
  };

  const handleSubmit = async (field) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepara i dati da inviare
      let dataToUpdate = {};
      
      // Se stiamo aggiornando l'indirizzo, invia tutti i campi dell'indirizzo
      if (field === 'address') {
        // Verifica che tutti i campi obbligatori siano compilati
        if (!formData.address || !formData.street_number || !formData.city || !formData.zip_code || !formData.country) {
          throw new Error('Tutti i campi dell\'indirizzo sono obbligatori');
        }
        
        dataToUpdate = {
          address: formData.address,
          street_number: formData.street_number,
          city: formData.city,
          zip_code: formData.zip_code,
          country: formData.country
        };
      } else if (field === 'birthdate') {
        // Assicurati che la data di nascita sia nel formato corretto (YYYY-MM-DD)
        dataToUpdate = { 
          birthdate: formData.birthdate || defaultBirthdate
        };
      } else {
        // Altrimenti invia solo il campo specifico
        dataToUpdate = { [field]: formData[field] };
      }
      
      // Invia la richiesta di aggiornamento
      await updateUserProfile(dataToUpdate);

      // Recupera i dati aggiornati dell'utente
      await refreshUserData();
      
      // Disabilita la modalità di editing
      if (field === 'address') setEditingAddress(false);
      if (field === 'birthdate') setEditingBirthdate(false);
      
      // Mostra il messaggio di successo
      setMessage({ 
        type: 'success', 
        text: 'Informazioni aggiornate con successo!' 
      });
      
      // Nascondi il messaggio dopo 3 secondi
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Errore durante l\'aggiornamento.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Funzione per gestire il logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Formatta l'indirizzo completo
  const getFullAddress = () => {
    if (!user) return '';
    const addressParts = [
      user.address,
      user.street_number,
      user.city,
      user.zip_code,
      user.country
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'Nessun indirizzo specificato';
  };
  
  // Formatta la data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span>Home</span>
        <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-800">Il tuo profilo</span>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text">Il tuo profilo</h1>
        <Link 
          to="/dashboard"
          className="bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-all"
        >
          Dashboard
        </Link>
      </div>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {/* Informazioni personali */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Informazioni personali</h2>
        
        {/* Nome completo */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <p className="text-gray-600">Nome completo</p>
          </div>
          <p className="font-medium">{user?.full_name}</p>
        </div>
        
        {/* Indirizzo */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <p className="text-gray-600">Indirizzo di spedizione</p>
            <button
              onClick={() => setEditingAddress(!editingAddress)}
              className="text-secondary hover:text-primary text-sm"
            >
              {editingAddress ? 'Annulla' : 'Modifica'}
            </button>
          </div>
          
          {!editingAddress ? (
            <p className="font-medium">{getFullAddress()}</p>
          ) : (
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="address" className="block text-xs text-gray-500 mb-1">Via/Piazza *</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    placeholder="Via/Piazza"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="street_number" className="block text-xs text-gray-500 mb-1">Numero civico *</label>
                  <input
                    id="street_number"
                    type="text"
                    name="street_number"
                    placeholder="Numero civico"
                    value={formData.street_number || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="block text-xs text-gray-500 mb-1">Città *</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Città"
                    value={formData.city || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zip_code" className="block text-xs text-gray-500 mb-1">CAP *</label>
                  <input
                    id="zip_code"
                    type="text"
                    name="zip_code"
                    placeholder="CAP"
                    value={formData.zip_code || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="country" className="block text-xs text-gray-500 mb-1">Nazione *</label>
                <input
                  id="country"
                  type="text"
                  name="country"
                  placeholder="Nazione"
                  value={formData.country || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleSubmit('address')}
                  disabled={isSubmitting}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvataggio...' : 'Salva indirizzo'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Email */}
        <div className="mb-6">
          <p className="text-gray-600 mb-1">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        
        {/* Data di nascita */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <p className="text-gray-600">Data di nascita <span className="text-xs text-gray-400">(opzionale)</span></p>
            <button
              onClick={() => setEditingBirthdate(!editingBirthdate)}
              className="text-secondary hover:text-primary text-sm"
            >
              {editingBirthdate ? 'Annulla' : 'Modifica'}
            </button>
          </div>
          
          {!editingBirthdate ? (
            <div>
              <p className="font-medium">{formatDate(user?.birthdate) || 'Non specificata'}</p>
              <p className="text-xs text-gray-500 mt-1">
                Utilizziamo questa informazione per prepararti una piacevole sorpresa!
              </p>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate || ''}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => handleSubmit('birthdate')}
                disabled={isSubmitting}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Salva'}
              </button>
            </div>
          )}
        </div>
        
        {/* ID account */}
        <div className="mb-6">
          <p className="text-gray-600 mb-1">ID account</p>
          <p className="font-medium">{user?.id}</p>
        </div>
        
        {/* Codice referral */}
        <div className="mb-6">
          <p className="text-gray-600 mb-1">Codice referral</p>
          <div className="flex items-center">
            <p className="font-medium mr-2">{user?.referral_code}</p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(user?.referral_code);
                setMessage({ type: 'success', text: 'Codice copiato negli appunti!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
              }}
              className="text-secondary hover:text-primary text-sm"
            >
              Copia
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Condividi questo codice con i tuoi amici per guadagnare crediti!
          </p>
        </div>
      </div>
      
      {/* Informazioni abbonamento */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Il tuo abbonamento</h2>
        
        {subscription ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-1">Piano</p>
                <p className="font-medium">{subscription.plan?.name || 'Piano standard'}</p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Stato</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.is_active ? 'Attivo' : 'Inattivo'}
                </span>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Periodo di fatturazione</p>
                <p className="font-medium capitalize">
                  {subscription.billing_period === 'monthly' && 'Mensile'}
                  {subscription.billing_period === 'quarterly' && 'Trimestrale'}
                  {subscription.billing_period === 'semiannual' && 'Semestrale'}
                  {subscription.billing_period === 'annual' && 'Annuale'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Importo</p>
                <p className="font-medium">
                  {subscription.plan?.monthly_price && `${subscription.plan.monthly_price.toFixed(2)} €`}
                  {subscription.billing_period === 'quarterly' && subscription.plan?.quarterly_price && ` (${subscription.plan.quarterly_price.toFixed(2)} € per trimestre)`}
                  {subscription.billing_period === 'semiannual' && subscription.plan?.semiannual_price && ` (${subscription.plan.semiannual_price.toFixed(2)} € per semestre)`}
                  {subscription.billing_period === 'annual' && subscription.plan?.annual_price && ` (${subscription.plan.annual_price.toFixed(2)} € all'anno)`}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Data inizio</p>
                <p className="font-medium">{new Date(subscription.start_date).toLocaleDateString('it-IT')}</p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-1">Prossimo rinnovo</p>
                <p className="font-medium">{new Date(subscription.next_billing_date).toLocaleDateString('it-IT')}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Link 
                to="/subscription" 
                className="text-secondary hover:text-primary inline-flex items-center"
              >
                Gestisci abbonamento
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Non hai ancora un abbonamento attivo</p>
            <Link
              to="/plans" 
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors inline-block"
            >
              Scopri i nostri piani
            </Link>
          </div>
        )}
      </div>
      
      {/* Logout */}
      <div className="mt-8 text-center">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Esci dall'account
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-md inline-block">
            <p className="text-red-700 mb-3">Sei sicuro di voler uscire?</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Annulla
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Conferma logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;