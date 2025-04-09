import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';

const Profile = () => {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await updateUserProfile(formData);
      setMessage({ 
        type: 'success', 
        text: 'Profilo aggiornato con successo!' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Errore durante l\'aggiornamento del profilo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <h1 className="text-3xl font-bold text-dark-text mb-8">Il tuo profilo</h1>
      
      {/* Informazioni account */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Informazioni account</h2>
        <div className="mb-4">
          <p className="text-gray-600">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">ID account</p>
          <p className="font-medium">{user?.id}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">Codice referral</p>
          <div className="flex items-center">
            <p className="font-medium mr-2">{user?.referral_code}</p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(user?.referral_code);
                setMessage({ type: 'success', text: 'Codice copiato negli appunti!' });
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
        
        <div className="mb-4">
          <p className="text-gray-600">Credito disponibile</p>
          <p className="font-medium">{user?.credit_balance.toFixed(2)} €</p>
        </div>
      </div>
      
      {/* Form aggiornamento profilo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Modifica profilo</h2>
        
        {message.text && (
          <div className={`p-4 mb-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="full_name" className="block text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Aggiornamento in corso...' : 'Aggiorna profilo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;