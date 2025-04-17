// src/services/subscriptionService.js
import api from './apiConfig';

// Ottieni la lista degli abbonamenti con paginazione e filtri
export const getSubscriptions = async (page = 1, perPage = 10, filters = {}) => {
  try {
    const params = { page, per_page: perPage, ...filters };
    const response = await api.get('/admin/subscriptions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

// Ottieni un singolo abbonamento per ID
export const getSubscriptionById = async (subscriptionId) => {
  try {
    const response = await api.get(`/admin/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subscription ${subscriptionId}:`, error);
    throw error;
  }
};

// Aggiorna un abbonamento
export const updateSubscription = async (subscriptionId, subscriptionData) => {
  try {
    const response = await api.put(`/admin/subscriptions/${subscriptionId}`, subscriptionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating subscription ${subscriptionId}:`, error);
    throw error;
  }
};

// Cancella un abbonamento
export const cancelSubscription = async (subscriptionId, reason = '') => {
  try {
    const response = await api.post(`/admin/subscriptions/${subscriptionId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error(`Error canceling subscription ${subscriptionId}:`, error);
    throw error;
  }
};

// Ottieni i piani di abbonamento disponibili
export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/admin/subscription-plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

// Ottieni lo storico dei pagamenti di un abbonamento
export const getSubscriptionPayments = async (subscriptionId, page = 1, perPage = 10) => {
  try {
    const params = { page, per_page: perPage };
    const response = await api.get(`/admin/subscriptions/${subscriptionId}/payments`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for subscription ${subscriptionId}:`, error);
    throw error;
  }
};