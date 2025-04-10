// src/services/stripeService.js
import { loadStripe } from '@stripe/stripe-js';

// Inizializza Stripe una sola volta
let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    // Usa la chiave pubblica di test
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};