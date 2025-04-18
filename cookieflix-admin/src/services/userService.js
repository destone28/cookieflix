// src/services/userService.js
import api, { fetchData, submitData } from './apiConfig';

/**
 * Ottiene la lista degli utenti con paginazione e filtri
 * @param {number} page - Numero di pagina
 * @param {number} perPage - Numero di utenti per pagina
 * @param {object} filters - Oggetto con i filtri (email, name, status, etc.)
 * @returns {Promise<object>} - Dati degli utenti paginati
 */
export const getUsers = async (page = 1, perPage = 10, filters = {}) => {
  try {
    // Prepara i parametri per la richiesta
    const params = { 
      page, 
      per_page: perPage,
      ...filters 
    };
    
    return await fetchData('/admin/users', { params });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // In caso di errore 404 o 500, possiamo tornare dati di default per lo sviluppo
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using fallback mock data for users');
      return {
        users: [],
        total: 0,
        page: 1,
        total_pages: 1
      };
    }
    
    throw error;
  }
};

/**
 * Ottiene i dettagli di un singolo utente tramite ID
 * @param {number|string} userId - ID dell'utente
 * @returns {Promise<object>} - Dati completi dell'utente
 */
export const getUserById = async (userId) => {
  try {
    return await fetchData(`/admin/users/${userId}`);
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

/**
 * Aggiorna i dati di un utente
 * @param {number|string} userId - ID dell'utente
 * @param {object} userData - Dati utente da aggiornare
 * @returns {Promise<object>} - Dati utente aggiornati
 */
export const updateUser = async (userId, userData) => {
  try {
    return await submitData(`/admin/users/${userId}`, userData, 'put');
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * Attiva o disattiva un account utente
 * @param {number|string} userId - ID dell'utente
 * @param {boolean} isActive - Stato di attivazione dell'account
 * @returns {Promise<object>} - Risposta dal server
 */
export const toggleUserStatus = async (userId, isActive) => {
  try {
    return await submitData(`/admin/users/${userId}/status`, { is_active: isActive }, 'put');
  } catch (error) {
    console.error(`Error updating user ${userId} status:`, error);
    throw error;
  }
};

/**
 * Ottiene l'attività di un utente
 * @param {number|string} userId - ID dell'utente
 * @param {number} page - Numero di pagina
 * @param {number} perPage - Numero di attività per pagina
 * @returns {Promise<object>} - Lista di attività dell'utente
 */
export const getUserActivity = async (userId, page = 1, perPage = 10) => {
  try {
    const params = { page, per_page: perPage };
    return await fetchData(`/admin/users/${userId}/activity`, { params });
  } catch (error) {
    console.error(`Error fetching user ${userId} activity:`, error);
    
    // In caso di errore 404 (endpoint non ancora implementato), restituire dati vuoti
    if (process.env.NODE_ENV !== 'production' && error.response?.status === 404) {
      console.warn('User activity endpoint not available, returning empty data');
      return {
        activities: [],
        total: 0,
        page: 1,
        total_pages: 1
      };
    }
    
    throw error;
  }
};

/**
 * Elimina un utente (solo per ruoli admin)
 * @param {number|string} userId - ID dell'utente da eliminare
 * @returns {Promise<object>} - Risposta dal server
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

/**
 * Reimposta la password di un utente
 * @param {number|string} userId - ID dell'utente
 * @param {string} newPassword - Nuova password
 * @returns {Promise<object>} - Risposta dal server
 */
export const resetUserPassword = async (userId, newPassword) => {
  try {
    return await submitData(`/admin/users/${userId}/reset-password`, { password: newPassword }, 'post');
  } catch (error) {
    console.error(`Error resetting password for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Ottiene le statistiche generali sugli utenti
 * @returns {Promise<object>} - Statistiche utenti (totale, attivi, nuovi, etc.)
 */
export const getUsersStats = async () => {
  try {
    return await fetchData('/admin/users/stats');
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    
    // In caso di errore 404 (endpoint non ancora implementato), restituire dati di default
    if (process.env.NODE_ENV !== 'production' && error.response?.status === 404) {
      console.warn('User stats endpoint not available, returning mock data');
      return {
        total_users: 0,
        active_users: 0,
        inactive_users: 0,
        new_users_today: 0,
        new_users_week: 0,
        new_users_month: 0
      };
    }
    
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  getUserActivity,
  deleteUser,
  resetUserPassword,
  getUsersStats
};