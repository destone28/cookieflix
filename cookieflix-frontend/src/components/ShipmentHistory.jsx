// src/components/ShipmentHistory.jsx
import { useState, useEffect } from 'react';
import { getUserShipments } from '../services/shipmentService';

const ShipmentHistory = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const data = await getUserShipments();
        setShipments(data);
      } catch (err) {
        console.error('Error fetching shipments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Formatta la data in stile italiano
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  };

  // Ottieni un colore in base allo stato della spedizione
  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Traduci lo stato in italiano
  const translateStatus = (status) => {
    switch (status) {
      case 'processed':
        return 'In lavorazione';
      case 'shipped':
        return 'Spedito';
      case 'delivered':
        return 'Consegnato';
      default:
        return status;
    }
  };

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
        <p className="mt-2">Riprova più tardi o contatta l'assistenza.</p>
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">Non hai ancora ricevuto spedizioni.</p>
        <p className="text-sm mt-2 text-gray-500">
          Le tue spedizioni verranno visualizzate qui quando saranno pronte.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Spedizione
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stato
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tracking
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contenuto
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <tr key={shipment.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  #{shipment.id}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(shipment.created_at)}
                </div>
                {shipment.delivered_date && (
                  <div className="text-xs text-gray-500">
                    Consegnato: {formatDate(shipment.delivered_date)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                  {translateStatus(shipment.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {shipment.tracking_number ? (
                  <span>
                    <a
                      href={`https://track.cookieflix.com/${shipment.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:text-primary text-sm"
                    >
                      {shipment.tracking_number}
                    </a>
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Non disponibile</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {shipment.shipment_items.length} cookie cutters
                </div>
                <div className="text-xs text-gray-500">
                  {shipment.shipment_items.map((item, idx) => (
                    <span key={item.id}>
                      {idx > 0 && ', '}
                      {item.design?.name || `Design #${item.design_id}`}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentHistory;