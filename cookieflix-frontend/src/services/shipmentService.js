// src/services/shipmentService.js
import api from './apiConfig';

// Ottieni tutte le spedizioni dell'utente
export const getUserShipments = async () => {
  try {
    const response = await api.get('/shipments/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching user shipments:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare lo storico spedizioni');
  }
};

// Ottieni dettagli di una spedizione specifica
export const getShipment = async (shipmentId) => {
  try {
    const response = await api.get(`/shipments/${shipmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shipment details:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i dettagli della spedizione');
  }
};