// src/services/subscriptionService.js
import api, { fetchData, submitData } from './apiConfig';

/**
 * Ottiene la lista degli abbonamenti con paginazione e filtri
 * @param {number} page - Numero di pagina
 * @param {number} perPage - Numero di abbonamenti per pagina
 * @param {object} filters - Oggetto con i filtri (status, plan_id, user_id, etc.)
 * @returns {Promise<object>} - Dati degli abbonamenti paginati
 */
export const getSubscriptions = async (page = 1, perPage = 10, filters = {}) => {
  try {
    const params = { page, per_page: perPage, ...filters };
    return await fetchData('/admin/subscriptions', { params });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    
    // In caso di errore 404 o 500, possiamo tornare dati di default per lo sviluppo
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using fallback mock data for subscriptions');
      return {
        subscriptions: [],
        total: 0,
        page: 1,
        total_pages: 1
      };
    }
    
    throw error;
  }
};

/**
 * Ottiene i dettagli di un singolo abbonamento tramite ID
 * @param {number|string} subscriptionId - ID dell'abbonamento
 * @returns {Promise<object>} - Dati completi dell'abbonamento
 */
export const getSubscriptionById = async (subscriptionId) => {
  try {
    return await fetchData(`/admin/subscriptions/${subscriptionId}`);
  } catch (error) {
    console.error(`Error fetching subscription ${subscriptionId}:`, error);
    throw error;
  }
};

/**
 * Aggiorna i dati di un abbonamento
 * @param {number|string} subscriptionId - ID dell'abbonamento
 * @param {object} subscriptionData - Dati abbonamento da aggiornare
 * @returns {Promise<object>} - Dati abbonamento aggiornati
 */
export const updateSubscription = async (subscriptionId, subscriptionData) => {
  try {
    return await submitData(`/admin/subscriptions/${subscriptionId}`, subscriptionData, 'put');
  } catch (error) {
    console.error(`Error updating subscription ${subscriptionId}:`, error);
    throw error;
  }
};

/**
 * Cancella un abbonamento
 * @param {number|string} subscriptionId - ID dell'abbonamento
 * @param {string} reason - Motivo della cancellazione (opzionale)
 * @returns {Promise<object>} - Risposta dal server
 */
export const cancelSubscription = async (subscriptionId, reason = '') => {
  try {
    return await submitData(`/admin/subscriptions/${subscriptionId}/cancel`, { reason }, 'post');
  } catch (error) {
    console.error(`Error canceling subscription ${subscriptionId}:`, error);
    throw error;
  }
};

/**
 * Ottiene i piani di abbonamento disponibili
 * @returns {Promise<Array>} - Lista dei piani di abbonamento
 */
export const getSubscriptionPlans = async () => {
  try {
    return await fetchData('/admin/subscription-plans');
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Ottiene lo storico dei pagamenti di un abbonamento
 * @param {number|string} subscriptionId - ID dell'abbonamento
 * @param {number} page - Numero di pagina
 * @param {number} perPage - Numero di pagamenti per pagina
 * @returns {Promise<object>} - Lista di pagamenti dell'abbonamento
 */
export const getSubscriptionPayments = async (subscriptionId, page = 1, perPage = 10) => {
  try {
    const params = { page, per_page: perPage };
    return await fetchData(`/admin/subscriptions/${subscriptionId}/payments`, { params });
  } catch (error) {
    console.error(`Error fetching payments for subscription ${subscriptionId}:`, error);
    
    // In caso di errore 404 (endpoint non ancora implementato), restituire dati vuoti
    if (process.env.NODE_ENV !== 'production' && error.response?.status === 404) {
      console.warn('Subscription payments endpoint not available, returning empty data');
      return {
        payments: [],
        total: 0,
        page: 1,
        total_pages: 1
      };
    }
    
    throw error;
  }
};

/**
 * Crea un nuovo abbonamento per un utente
 * @param {object} subscriptionData - Dati del nuovo abbonamento
 * @returns {Promise<object>} - Dati del nuovo abbonamento creato
 */
export const createSubscription = async (subscriptionData) => {
  try {
    return await submitData('/admin/subscriptions', subscriptionData, 'post');
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Rinnova manualmente un abbonamento
 * @param {number|string} subscriptionId - ID dell'abbonamento
 * @param {object} renewalData - Dati per il rinnovo (periodo, ecc.)
 * @returns {Promise<object>} - Dati dell'abbonamento rinnovato
 */
export const renewSubscription = async (subscriptionId, renewalData) => {
  try {
    return await submitData(`/admin/subscriptions/${subscriptionId}/renew`, renewalData, 'post');
  } catch (error) {
    console.error(`Error renewing subscription ${subscriptionId}:`, error);
    throw error;
  }
};

/**
 * Aggiorna un piano di abbonamento
 * @param {number|string} planId - ID del piano
 * @param {object} planData - Dati del piano da aggiornare
 * @returns {Promise<object>} - Dati del piano aggiornato
 */
export const updateSubscriptionPlan = async (planId, planData) => {
  try {
    return await submitData(`/admin/subscription-plans/${planId}`, planData, 'put');
  } catch (error) {
    console.error(`Error updating subscription plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Crea un nuovo piano di abbonamento
 * @param {object} planData - Dati del nuovo piano
 * @returns {Promise<object>} - Dati del nuovo piano creato
 */
export const createSubscriptionPlan = async (planData) => {
  try {
    return await submitData('/admin/subscription-plans', planData, 'post');
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
};

/**
 * Ottiene le statistiche generali sugli abbonamenti
 * @returns {Promise<object>} - Statistiche abbonamenti (totale, attivi, ricavi, etc.)
 */
export const getSubscriptionsStats = async () => {
  try {
    return await fetchData('/admin/subscriptions/stats');
  } catch (error) {
    console.error('Error fetching subscription statistics:', error);
    
    // In caso di errore 404 (endpoint non ancora implementato), restituire dati di default
    if (process.env.NODE_ENV !== 'production' && error.response?.status === 404) {
      console.warn('Subscription stats endpoint not available, returning mock data');
      return {
        total_subscriptions: 0,
        active_subscriptions: 0,
        total_revenue: 0,
        monthly_revenue: 0,
        most_popular_plan: null,
        subscription_growth: []
      };
    }
    
    throw error;
  }
};

export default {
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  getSubscriptionPlans,
  getSubscriptionPayments,
  createSubscription,
  renewSubscription,
  updateSubscriptionPlan,
  createSubscriptionPlan,
  getSubscriptionsStats
};