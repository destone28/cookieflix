// src/services/userService.js
import api from './apiConfig';

// Ottieni la lista degli utenti con paginazione e filtri
export const getUsers = async (page = 1, perPage = 10, filters = {}) => {
  try {
    const params = { page, per_page: perPage, ...filters };
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Ottieni un singolo utente per ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Aggiorna un utente
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Blocca/sblocca un account utente
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const response = await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId} status:`, error);
    throw error;
  }
};

// Ottieni l'attività di un utente
export const getUserActivity = async (userId, page = 1, perPage = 10) => {
  try {
    const params = { page, per_page: perPage };
    const response = await api.get(`/admin/users/${userId}/activity`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId} activity:`, error);
    throw error;
  }
};