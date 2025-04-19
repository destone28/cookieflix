// src/services/userService.js
import { fetchData, submitData } from './apiConfig';

// Dati mock per sviluppo e test
const mockUsers = Array(25).fill(null).map((_, index) => ({
  id: index + 1,
  email: `user${index + 1}@example.com`,
  full_name: `Utente ${index + 1}`,
  is_active: Math.random() > 0.2, // 80% degli utenti attivi
  is_admin: index < 3, // I primi 3 sono admin
  created_at: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(), // Data casuale negli ultimi 30 giorni
  last_login: Math.random() > 0.3 ? new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() : null,
  subscription: Math.random() > 0.4 ? { 
    plan: ['starter', 'creator', 'master', 'collection'][Math.floor(Math.random() * 4)],
    status: ['active', 'expired', 'cancelled'][Math.floor(Math.random() * 3)],
    next_billing: new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
  } : null
}));

const mockUserActivities = userId => Array(15).fill(null).map((_, index) => ({
  id: index + 1,
  user_id: userId,
  action: ['login', 'logout', 'profile_update', 'subscription_change', 'vote'][Math.floor(Math.random() * 5)],
  details: `Dettaglio attività ${index + 1}`,
  ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
  created_at: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
}));

const mockUserStats = {
  total_users: mockUsers.length,
  active_users: mockUsers.filter(u => u.is_active).length,
  inactive_users: mockUsers.filter(u => !u.is_active).length,
  new_users_today: Math.floor(Math.random() * 10),
  new_users_week: Math.floor(Math.random() * 50),
  new_users_month: Math.floor(Math.random() * 200)
};

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
    
    // Filtra i dati mock in base ai parametri
    const mockFilteredUsers = mockUsers.filter(user => {
      if (filters.email && !user.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.name && !user.full_name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.status === 'active' && !user.is_active) return false;
      if (filters.status === 'inactive' && user.is_active) return false;
      return true;
    });
    
    // Crea dati paginati mock
    const mockData = {
      users: mockFilteredUsers.slice((page - 1) * perPage, page * perPage),
      total: mockFilteredUsers.length,
      page,
      total_pages: Math.ceil(mockFilteredUsers.length / perPage)
    };
    
    return await fetchData('/admin/users', params, {
      useMock: true,
      mockData
    });
  } catch (error) {
    console.error('Error fetching users:', error);
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
    const mockUser = mockUsers.find(user => user.id === parseInt(userId));
    
    return await fetchData(`/admin/users/${userId}`, {}, {
      useMock: true,
      mockData: mockUser || { 
        error: "User not found", 
        status: 404 
      }
    });
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
    // Trova l'utente nei dati mock e aggiornalo
    const mockUser = mockUsers.find(user => user.id === parseInt(userId));
    const updatedMockUser = mockUser ? { ...mockUser, ...userData } : null;
    
    return await submitData('put', `/admin/users/${userId}`, userData, {
      useMock: true,
      mockData: updatedMockUser || { 
        error: "User not found", 
        status: 404 
      }
    });
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
    // Trova l'utente nei dati mock e aggiorna lo stato
    const mockUser = mockUsers.find(user => user.id === parseInt(userId));
    const updatedMockUser = mockUser ? { ...mockUser, is_active: isActive } : null;
    
    return await submitData('put', `/admin/users/${userId}/status`, { is_active: isActive }, {
      useMock: true,
      mockData: updatedMockUser ? { 
        success: true, 
        user: updatedMockUser 
      } : { 
        error: "User not found", 
        status: 404 
      }
    });
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
    
    // Genera attività mock per l'utente
    const mockActivities = mockUserActivities(userId);
    const mockData = {
      activities: mockActivities.slice((page - 1) * perPage, page * perPage),
      total: mockActivities.length,
      page,
      total_pages: Math.ceil(mockActivities.length / perPage)
    };
    
    return await fetchData(`/admin/users/${userId}/activity`, params, {
      useMock: true,
      mockData
    });
  } catch (error) {
    console.error(`Error fetching user ${userId} activity:`, error);
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
    return await submitData('delete', `/admin/users/${userId}`, {}, {
      useMock: true,
      mockData: { 
        success: true, 
        message: `User ${userId} successfully deleted` 
      }
    });
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
    return await submitData('post', `/admin/users/${userId}/reset-password`, { password: newPassword }, {
      useMock: true,
      mockData: { 
        success: true, 
        message: "Password reset successfully" 
      }
    });
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
    return await fetchData('/admin/users/stats', {}, {
      useMock: true,
      mockData: mockUserStats
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
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