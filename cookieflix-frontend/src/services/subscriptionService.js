// src/services/subscriptionService.js
import api from './apiConfig';

// Ottieni tutti i piani di abbonamento
export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i piani di abbonamento');
  }
};

// Ottieni dettagli di un piano specifico
export const getSubscriptionPlan = async (slug) => {
  try {
    const response = await api.get(`/subscriptions/plans/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plan:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i dettagli del piano');
  }
};

// Crea una sessione di checkout per l'abbonamento
export const createCheckoutSession = async (planData) => {
  try {
    const response = await api.post('/subscriptions/checkout', planData);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error.response?.data || error.message);
    throw new Error('Impossibile creare la sessione di checkout');
  }
};

// Ottieni l'abbonamento attivo dell'utente
export const getActiveSubscription = async () => {
  try {
    const response = await api.get('/subscriptions/my');
    return response.data;
  } catch (error) {
    // In caso di errore 404, l'utente non ha un abbonamento attivo
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching active subscription:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare l\'abbonamento attivo');
  }
};

// Aggiorna le categorie preferite dell'utente
export const updateSubscriptionCategories = async (categoryIds) => {
  try {
    const response = await api.post('/subscriptions/update-categories', categoryIds);
    return response.data;
  } catch (error) {
    console.error('Error updating subscription categories:', error.response?.data || error.message);
    throw new Error('Impossibile aggiornare le categorie');
  }
};

// Verifica una sessione di checkout
export const verifyCheckoutSession = async (sessionId) => {
  try {
    const response = await api.get(`/subscriptions/verify-session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying checkout session:', error.response?.data || error.message);
    throw new Error('Impossibile verificare la sessione di checkout');
  }
};