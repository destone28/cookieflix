// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getActiveSubscription } from '../services/subscriptionService';
import { getDesigns, getUserVotes } from '../services/productService';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [subscription, setSubscription] = useState(null);
  const [monthlyDesigns, setMonthlyDesigns] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mostra il messaggio di successo se passato tramite navigazione
  useEffect(() => {
    if (location.state?.message) {
      toast.showSuccess(location.state.message);
      // Pulisci lo stato dopo aver mostrato il messaggio
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Carica i dati necessari per la dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carica abbonamento, design del mese e voti utente in parallelo
        const [subscriptionData, designsData, votesData] = await Promise.all([
          getActiveSubscription().catch(() => null),
          getDesigns().catch(() => []),
          getUserVotes().catch(() => [])
        ]);
        
        setSubscription(subscriptionData);
        
        // Ottieni i design del mese in base al piano dell'utente
        if (subscriptionData && designsData.length) {
          const designLimit = subscriptionData.plan.items_per_month || 4;
          // Ordina per numero di voti (i più popolari)
          const sortedDesigns = [...designsData]
            .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
            .slice(0, designLimit);
          setMonthlyDesigns(sortedDesigns);
        } else {
          setMonthlyDesigns([]);
        }
        
        setUserVotes(votesData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.showError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-text mb-8">Dashboard</h1>
      
      {/* Sezione di benvenuto */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-2">Benvenuto, {user?.full_name || 'Utente'}</h2>
        
        {/* Stato abbonamento - semplificato */}
        <div className="flex items-center mt-4">
          <span className={`h-3 w-3 rounded-full ${subscription ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
          <span className="text-gray-700">
            {subscription ? 'Abbonamento attivo' : 'Nessun abbonamento attivo'}
          </span>
          
          {!subscription && (
            <Link 
              to="/plans"
              className="ml-4 text-primary hover:underline"
            >
              Abbonati ora
            </Link>
          )}
        </div>
        
        {/* Riepilogo profilo */}
        <div className="mt-6 flex justify-end">
          <Link
            to="/profile"
            className="text-secondary hover:text-primary inline-flex items-center"
          >
            Gestisci il tuo profilo
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
      
      {/* Design mensili */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Cookie Cutters del mese</h2>
          
          {subscription && (
            <Link to="/catalog" className="text-primary hover:underline">
              Esplora catalogo
            </Link>
          )}
        </div>
        
        {!subscription ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-lg mb-4">
              Abbonati per ricevere i cookie cutters mensili!
            </p>
            <Link
              to="/plans"
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors inline-block"
            >
              Scopri i piani
            </Link>
          </div>
        ) : monthlyDesigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-lg">Nessun design disponibile per questo mese.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {monthlyDesigns.map(design => (
              <div key={design.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={design.image_url || `https://placehold.co/400x400?text=${encodeURIComponent(design.name)}`} 
                  alt={design.name} 
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{design.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{design.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {design.votes_count || 0} voti
                    </span>
                    
                    <Link 
                      to={`/catalog?design=${design.id}`}
                      className="text-secondary hover:text-primary text-sm"
                    >
                      Dettagli
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Voti recenti */}
      {subscription && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">I tuoi voti recenti</h2>
          
          {userVotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-lg mb-4">
                Non hai ancora votato nessun design.
              </p>
              <Link
                to="/catalog"
                className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors inline-block"
              >
                Esplora il catalogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userVotes.slice(0, 3).map(design => (
                <div key={design.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={design.image_url || `https://placehold.co/400x400?text=${encodeURIComponent(design.name)}`} 
                    alt={design.name} 
                    className="w-full h-40 object-cover"
                  />
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{design.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{design.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center text-sm text-primary">
                        <svg 
                          className="h-4 w-4 mr-1" 
                          fill="currentColor" 
                          viewBox="0 0 20 20" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                        Votato
                      </span>
                      
                      <span className="text-sm text-gray-500">
                        {design.votes_count || 0} voti totali
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Link rapidi */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Link rapidi</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            to="/profile" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Il tuo profilo</h3>
            <p className="text-gray-600 text-sm">
              Gestisci i tuoi dati personali
            </p>
          </Link>
          
          <Link 
            to="/subscription" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Abbonamento</h3>
            <p className="text-gray-600 text-sm">
              Gestisci il tuo piano
            </p>
          </Link>
          
          <Link 
            to="/catalog" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Catalogo</h3>
            <p className="text-gray-600 text-sm">
              Esplora e vota i design
            </p>
          </Link>
          
          {subscription && (
            <Link 
              to="/categories"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">Categorie</h3>
              <p className="text-gray-600 text-sm">
                Scegli le tue categorie preferite
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;