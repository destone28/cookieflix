// src/components/UserDesignGallery.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserVotes } from '../services/productService';
import { getUserShipments } from '../services/shipmentService';

const UserDesignGallery = () => {
  const [votedDesigns, setVotedDesigns] = useState([]);
  const [receivedDesigns, setReceivedDesigns] = useState([]);
  const [activeTab, setActiveTab] = useState('voted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        
        // Carica i design votati
        const votedData = await getUserVotes();
        setVotedDesigns(votedData);

        // Carica le spedizioni per estrarre i design ricevuti
        const shipments = await getUserShipments();
        
        // Estrai i design unici ricevuti dalle spedizioni
        const designsFromShipments = shipments
          .filter(s => s.status === 'delivered') // Solo spedizioni consegnate
          .flatMap(s => s.shipment_items.map(item => item.design))
          .filter(Boolean) // Rimuovi null/undefined
          .reduce((unique, design) => {
            // Deduplicazione per evitare design ripetuti
            if (!unique.some(d => d.id === design.id)) {
              unique.push(design);
            }
            return unique;
          }, []);
        
        setReceivedDesigns(designsFromShipments);
      } catch (err) {
        console.error('Error fetching designs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        <p>Si è verificato un errore: {error}</p>
      </div>
    );
  }

  const activeDesigns = activeTab === 'voted' ? votedDesigns : receivedDesigns;
  const emptyMessage = activeTab === 'voted' 
    ? "Non hai ancora votato nessun design." 
    : "Non hai ancora ricevuto nessun cookie cutter.";
  const emptyAction = activeTab === 'voted'
    ? { text: "Esplora il catalogo", link: "/catalog" }
    : { text: "Scopri i piani", link: "/plans" };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('voted')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'voted'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Design Votati ({votedDesigns.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'received'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cookie Cutters Ricevuti ({receivedDesigns.length})
        </button>
      </div>

      {/* Gallery */}
      {activeDesigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">{emptyMessage}</p>
          <Link 
            to={emptyAction.link}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors inline-block"
          >
            {emptyAction.text}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {activeDesigns.map(design => (
            <div key={design.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={design.image_url || `https://placehold.co/400x400?text=${encodeURIComponent(design.name)}`} 
                alt={design.name} 
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium text-sm truncate">{design.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {activeTab === 'voted' && (design.votes_count || 0) + ' voti'}
                  </span>
                  <Link 
                    to={`/catalog?design=${design.id}`}
                    className="text-secondary hover:text-primary text-xs"
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
  );
};

export default UserDesignGallery;