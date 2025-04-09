import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [monthlyDesigns, setMonthlyDesigns] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);

  // Simuliamo un controllo di autenticazione
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        navigate('/login');
        return false;
      }
      return true;
    };

    const isAuth = checkAuth();
    if (isAuth) {
      // Simula il recupero dei dati dell'utente
      setTimeout(() => {
        setUserData({
          id: 1,
          name: 'Marco Rossi',
          email: 'marco.rossi@example.com',
          referralCode: 'MARCO2025',
          credit: 15.50,
          joinDate: '2025-01-15'
        });

        setSubscription({
          plan: 'Creator',
          status: 'Attivo',
          startDate: '2025-01-15',
          nextBillingDate: '2025-05-15',
          billingPeriod: 'Trimestrale',
          price: 64.50,
          categories: ['Serie TV e Film', 'Videogiochi']
        });

        setMonthlyDesigns([
          {
            id: 1,
            name: 'Spada Laser',
            image: 'https://placehold.co/200x200?text=Spada+Laser',
            category: 'Serie TV e Film'
          },
          {
            id: 2,
            name: 'Fungo Power-Up',
            image: 'https://placehold.co/200x200?text=Fungo',
            category: 'Videogiochi'
          },
          {
            id: 3,
            name: 'Controller Retro',
            image: 'https://placehold.co/200x200?text=Controller',
            category: 'Videogiochi'
          },
          {
            id: 4,
            name: 'Cappello dello Stregone',
            image: 'https://placehold.co/200x200?text=Cappello',
            category: 'Serie TV e Film'
          },
          {
            id: 5,
            name: 'Astronave Spaziale',
            image: 'https://placehold.co/200x200?text=Astronave',
            category: 'Serie TV e Film'
          },
          {
            id: 6,
            name: 'Personaggio Pixelato',
            image: 'https://placehold.co/200x200?text=Pixel+Guy',
            category: 'Videogiochi'
          },
          {
            id: 7,
            name: 'Alieno Amichevole',
            image: 'https://placehold.co/200x200?text=Alieno',
            category: 'Serie TV e Film'
          }
        ]);

        setRecentVotes([
          {
            id: 1,
            name: 'Robot Vintage',
            image: 'https://placehold.co/150x150?text=Robot',
            category: 'Videogiochi',
            votedAt: '2025-04-05'
          },
          {
            id: 2,
            name: 'Castello Fantasy',
            image: 'https://placehold.co/150x150?text=Castello',
            category: 'Videogiochi',
            votedAt: '2025-04-03'
          },
          {
            id: 3,
            name: 'Maschera Tribale',
            image: 'https://placehold.co/150x150?text=Maschera',
            category: 'Serie TV e Film',
            votedAt: '2025-04-01'
          }
        ]);

        setIsLoading(false);
      }, 1000);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-700">Caricamento dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-bg min-h-screen pb-12">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Ciao, {userData.name}!</h1>
          <p className="mt-2">Benvenuto nella tua dashboard personale</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonna Sinistra */}
          <div className="lg:col-span-2">
            {/* Sezione Cookie Cutters del Mese */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">I tuoi Cookie Cutters di Aprile</h2>
                <span className="bg-secondary text-white text-sm py-1 px-3 rounded-full">
                  {monthlyDesigns.length} items
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {monthlyDesigns.map((design) => (
                  <div key={design.id} className="group">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                      <img
                        src={design.image}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:opacity-75 transition"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <span className="text-xs text-white font-medium">{design.category}</span>
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{design.name}</h3>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/catalog" className="text-primary hover:underline font-medium">
                  Esplora il catalogo completo →
                </Link>
              </div>
            </div>

            {/* Sezione Design Votati Recentemente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">I tuoi Voti Recenti</h2>
              
              {recentVotes.length > 0 ? (
                <div className="space-y-4">
                  {recentVotes.map((vote) => (
                    <div key={vote.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                      <img
                        src={vote.image}
                        alt={vote.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium">{vote.name}</h3>
                        <p className="text-sm text-gray-500">{vote.category}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Votato il {new Date(vote.votedAt).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Non hai ancora votato per nessun design.</p>
                  <Link to="/catalog" className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition">
                    Vota Ora
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Colonna Destra - Sidebar */}
          <div className="space-y-8">
            {/* Abbonamento */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Il tuo Abbonamento</h2>
              <div className="bg-light-bg rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Piano:</span>
                  <span className="font-bold">{subscription.plan}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Stato:</span>
                  <span className="text-green-600 font-medium">{subscription.status}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Fatturazione:</span>
                  <span>{subscription.billingPeriod}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Prossimo addebito:</span>
                  <span>{new Date(subscription.nextBillingDate).toLocaleDateString('it-IT')}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Importo:</span>
                  <span>{subscription.price.toFixed(2)}€</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold mb-2">Categorie selezionate:</h3>
                  <div className="flex flex-wrap gap-2">
                    {subscription.categories.map((category, index) => (
                      <span key={index} className="bg-secondary bg-opacity-10 text-secondary text-xs py-1 px-2 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Link to="/subscription" className="block text-center w-full py-2 px-4 border border-primary text-primary rounded hover:bg-primary hover:text-white transition">
                  Gestisci Abbonamento
                </Link>
                <Link to="/dashboard/categories" className="block text-center w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                  Cambia Categorie
                </Link>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Info Account</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Membro dal</p>
                  <p>{new Date(userData.joinDate).toLocaleDateString('it-IT')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Codice Referral</p>
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm mr-2">
                      {userData.referralCode}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(userData.referralCode);
                        alert('Codice copiato negli appunti!');
                      }}
                      className="text-primary text-sm hover:underline"
                    >
                      Copia
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Credito disponibile</p>
                  <p className="text-lg font-bold text-green-600">{userData.credit.toFixed(2)}€</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/profile" className="block text-center w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                  Gestisci Profilo
                </Link>
              </div>
            </div>

            {/* Help Box */}
            <div className="bg-tertiary bg-opacity-20 rounded-lg p-6">
              <h3 className="font-bold mb-2">Hai bisogno di aiuto?</h3>
              <p className="text-sm mb-4">
                Il nostro team di supporto è a tua disposizione per qualsiasi domanda o problema.
              </p>
              <a href="mailto:support@cookieflix.com" className="text-primary hover:underline text-sm font-medium">
                Contatta il supporto →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;