// src/components/AccountDeletion.jsx
import { useState } from 'react';
import { requestAccountDeletion } from '../services/userService';

const AccountDeletion = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!reason.trim()) {
      setError('Per favore, fornisci un motivo per la cancellazione');
      return;
    }
    
    try {
      setLoading(true);
      await requestAccountDeletion(reason);
      setSuccess(true);
      setShowConfirmation(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Richiesta inviata</h2>
        <div className="bg-green-50 p-4 rounded-md text-green-700 mb-4">
          <p>
            La tua richiesta di cancellazione dell'account è stata inviata con successo. 
            Verrai contattato via email per confermare la procedura.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Se cambi idea, contatta l'assistenza clienti. La richiesta non è ancora stata elaborata.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Chiusura account</h2>
      
      {!showConfirmation ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Stai pensando di chiudere il tuo account Cookieflix? Prima di procedere, considera che:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Perderai l'accesso a tutti i tuoi cookie cutters</li>
            <li>I tuoi dati personali verranno eliminati dai nostri sistemi</li>
            <li>Eventuali abbonamenti attivi verranno annullati</li>
            <li>Non potrai più accedere alla tua cronologia ordini</li>
          </ul>
          
          <button
            onClick={() => setShowConfirmation(true)}
            className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Richiedi cancellazione account
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <p className="text-gray-600">
            Siamo dispiaciuti di vederti andare via. Per favore, facci sapere perché stai cancellando il tuo account:
          </p>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo della cancellazione
            </label>
            <textarea
              id="reason"
              name="reason"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Aiutaci a migliorare il servizio..."
              required
            ></textarea>
          </div>
          
          <div className="pt-2 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowConfirmation(false);
                setError(null);
                setReason('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Invio in corso...' : 'Conferma richiesta'}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 pt-2">
            Nota: Questa azione avvia una richiesta di cancellazione. Il team di supporto ti contatterà via email per confermare la procedura.
          </p>
        </form>
      )}
    </div>
  );
};

export default AccountDeletion;