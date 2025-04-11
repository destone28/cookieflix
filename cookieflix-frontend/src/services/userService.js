import api from './apiConfig';

// Aggiorna il profilo dell'utente
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/me', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    throw new Error('Impossibile aggiornare il profilo');
  }
};

// Ottieni il codice referral dell'utente
export const getReferralCode = async () => {
  try {
    const response = await api.get('/users/referral-code');
    return response.data.referral_code;
  } catch (error) {
    console.error('Error fetching referral code:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare il codice referral');
  }
};

// Ottieni il profilo dell'utente corrente
export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare il profilo utente');
  }
};

// Cambia la password dell'utente
export const changeUserPassword = async (passwordData) => {
  try {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail || 'Impossibile aggiornare la password'
    );
  }
};

// Richiedi la cancellazione dell'account
export const requestAccountDeletion = async (reason) => {
  try {
    const response = await api.post('/users/request-deletion', { reason });
    return response.data;
  } catch (error) {
    console.error('Error requesting account deletion:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail || 'Impossibile richiedere la cancellazione dell\'account'
    );
  }
};

// Ottieni le categorie preferite dell'utente
export const getUserPreferredCategories = async () => {
  try {
    const response = await api.get('/users/preferred-categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching preferred categories:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare le categorie preferite');
  }
};