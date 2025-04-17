// src/modules/subscriptions/SubscriptionPayments.jsx
import { useState, useEffect } from 'react';
import { getSubscriptionPayments } from '../../services/subscriptionService';
import Pagination from '../../components/common/Pagination';

const SubscriptionPayments = ({ subscriptionId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // In un'implementazione reale, useremmo:
        // const response = await getSubscriptionPayments(subscriptionId, currentPage, itemsPerPage);
        
        // Per ora, simuliamo i dati
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dati di esempio
        const mockPayments = Array.from({ length: 8 }, (_, index) => {
          const date = new Date();
          date.setMonth(date.getMonth() - index);
          
          return {
            id: `payment_${index + 1}`,
            amount: Math.random() * 30 + 15, // Importo casuale tra 15 e 45
            currency: 'EUR',
            status: Math.random() > 0.9 ? 'failed' : 'succeeded',
            created_at: date.toISOString(),
            payment_method: 'card',
            card_brand: 'visa',
            card_last4: '4242',
            receipt_url: '#'
          };
        });
        
        // Paginazione simulata
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedPayments = mockPayments.slice(start, end);
        
        setPayments(paginatedPayments);
        setTotalPages(Math.ceil(mockPayments.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        setError('Errore durante il caricamento dei pagamenti');
        console.error(err);
        setLoading(false);
      }
    };

    fetchPayments();
  }, [subscriptionId, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'succeeded':
        return 'Completato';
      case 'failed':
        return 'Fallito';
      case 'pending':
        return 'In attesa';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Storico Pagamenti
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Elenco dei pagamenti relativi a questo abbonamento.
        </p>
      </div>
      
      {loading ? (
        <div className="text-center p-10">
          <p>Caricamento pagamenti in corso...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-6">{error}</div>
      ) : payments.length === 0 ? (
        <div className="text-center p-10">
          <p>Nessun pagamento trovato per questo abbonamento.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Pagamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metodo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ricevuta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.amount.toLocaleString('it-IT', {
                        style: 'currency',
                        currency: payment.currency
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.card_brand.toUpperCase()} •••• {payment.card_last4}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}
                      >
                        {getStatusDisplay(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.status === 'succeeded' ? (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-opacity-70"
                        >
                          Visualizza
                        </a>
                      ) : (
                        '-'
                      )}
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

export default SubscriptionPayments;