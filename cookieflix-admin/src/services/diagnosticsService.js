// src/services/diagnosticsService.js
import api from './apiConfig';

/**
 * Testa la connessione a un endpoint specifico
 * @param {string} endpoint - L'endpoint da testare
 * @returns {Promise<Object>} - Risultato del test
 */
export const testEndpoint = async (endpoint) => {
  try {
    const startTime = performance.now();
    const response = await api.get(endpoint);
    const endTime = performance.now();
    
    return {
      success: true,
      data: response.data,
      responseTime: Math.round(endTime - startTime),
      statusCode: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
      statusCode: error.response?.status || 500
    };
  }
};

/**
 * Ottiene lo stato di tutti gli endpoint principali
 * @returns {Promise<Object>} - Stato degli endpoint
 */
export const getApiStatus = async () => {
  const endpoints = [
    { name: 'Health', endpoint: '/health' },
    { name: 'Admin', endpoint: '/admin/health' },
    { name: 'Users', endpoint: '/admin/users/stats' },
    { name: 'Subscriptions', endpoint: '/admin/subscriptions/stats' },
    { name: 'Categories', endpoint: '/admin/categories' },
    { name: 'Designs', endpoint: '/admin/designs' }
  ];
  
  const results = {};
  
  for (const { name, endpoint } of endpoints) {
    results[name.toLowerCase()] = await testEndpoint(endpoint);
  }
  
  return results;
};

export default {
  testEndpoint,
  getApiStatus
};