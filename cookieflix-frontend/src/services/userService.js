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