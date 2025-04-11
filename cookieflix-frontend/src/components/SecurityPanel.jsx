// src/components/SecurityPanel.jsx
import { useState } from 'react';
import { changeUserPassword } from '../services/userService';

const SecurityPanel = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!passwordData.current_password) {
      setError('Inserisci la password attuale');
      return false;
    }
    if (!passwordData.new_password) {
      setError('Inserisci la nuova password');
      return false;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Le password non coincidono');
      return false;
    }
    if (passwordData.new_password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri');
      return false;
    }
    
    // Verifica che la password contenga maiuscole, minuscole, numeri e caratteri speciali
    const hasUpperCase = /[A-Z]/.test(passwordData.new_password);
    const hasLowerCase = /[a-z]/.test(passwordData.new_password);
    const hasNumbers = /\d/.test(passwordData.new_password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new_password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
      setError('La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await changeUserPassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      setSuccess('Password aggiornata con successo!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setIsChangingPassword(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 border-b pb-2">Sicurezza</h2>
      
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {!isChangingPassword ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-gray-500">Aggiorna la tua password per mantenere il tuo account sicuro</p>
            </div>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-secondary text-white px-3 py-1.5 rounded-md text-sm hover:bg-opacity-90 transition-colors"
            >
              Cambia password
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div>
              <p className="font-medium">Autenticazione a due fattori</p>
              <p className="text-sm text-gray-500">Aggiungi un ulteriore livello di sicurezza al tuo account</p>
            </div>
            <button className="text-gray-400 px-3 py-1.5 rounded-md text-sm border border-gray-300 cursor-not-allowed">
              Presto disponibile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
              Password attuale
            </label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
              Nuova password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola, un numero e un carattere speciale.
            </p>
          </div>
          
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
              Conferma password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(false);
                setError(null);
                setPasswordData({
                  current_password: '',
                  new_password: '',
                  confirm_password: ''
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Aggiornamento...' : 'Aggiorna password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SecurityPanel;