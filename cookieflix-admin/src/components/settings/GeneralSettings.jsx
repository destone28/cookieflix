import React, { useState, useEffect } from 'react';
import { getGeneralSettings, updateGeneralSettings } from '../../services/settingsService';
import { CheckIcon } from '@heroicons/react/24/outline';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    logo: '',
    currency: 'EUR',
    language: 'it',
    timezone: 'Europe/Rome',
    maintenanceMode: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  // Lista di valute disponibili
  const currencies = [
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'USD', name: 'Dollaro USA ($)' },
    { code: 'GBP', name: 'Sterlina (£)' },
    { code: 'CHF', name: 'Franco Svizzero (CHF)' }
  ];

  // Lista di lingue disponibili
  const languages = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'Inglese' },
    { code: 'fr', name: 'Francese' },
    { code: 'de', name: 'Tedesco' },
    { code: 'es', name: 'Spagnolo' }
  ];

  // Lista di fusi orari disponibili
  const timezones = [
    { code: 'Europe/Rome', name: 'Roma (UTC+1/UTC+2)' },
    { code: 'Europe/London', name: 'Londra (UTC+0/UTC+1)' },
    { code: 'Europe/Paris', name: 'Parigi (UTC+1/UTC+2)' },
    { code: 'America/New_York', name: 'New York (UTC-5/UTC-4)' },
    { code: 'Asia/Tokyo', name: 'Tokyo (UTC+9)' }
  ];

  // Carica i dati iniziali
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getGeneralSettings();
        setSettings(data);
        if (data.logo) {
          setLogoPreview(data.logo);
        }
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento delle impostazioni');
        setLoading(false);
        console.error(err);
      }
    };

    fetchSettings();
  }, []);

  // Gestisce il cambio dei campi del form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Gestisce l'upload del logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Salva le impostazioni
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Nella realtà, qui gestiremo l'upload del file del logo
      // Per ora, simuliamo semplicemente il salvataggio con il preview
      const updatedSettings = {
        ...settings,
        logo: logoFile ? logoPreview : settings.logo
      };
      
      await updateGeneralSettings(updatedSettings);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch (err) {
      setError('Errore nel salvataggio delle impostazioni');
      setSaving(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p className="mt-2 text-gray-500">Caricamento impostazioni...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Impostazioni Generali</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          Impostazioni salvate con successo
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome del sito */}
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome del sito
            </label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          {/* Lingua */}
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Lingua predefinita
            </label>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Descrizione del sito */}
          <div className="col-span-2">
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione del sito
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
          
          {/* Email di contatto */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email di contatto
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          {/* Telefono di contatto */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefono di contatto
            </label>
            <input
              type="text"
              id="contactPhone"
              name="contactPhone"
              value={settings.contactPhone}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Indirizzo */}
          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Indirizzo
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Logo */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-grow">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <span>Carica nuovo logo</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Formati supportati: PNG, JPG, SVG. Max 2MB.
                </p>
              </div>
            </div>
          </div>
          
          {/* Valuta */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Valuta
            </label>
            <select
              id="currency"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Fuso orario */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Fuso orario
            </label>
            <select
              id="timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {timezones.map((timezone) => (
                <option key={timezone.code} value={timezone.code}>
                  {timezone.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Modalità manutenzione */}
          <div className="col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                Attiva modalità manutenzione
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Quando attiva, il sito mostrerà una pagina di manutenzione a tutti gli utenti. Solo gli amministratori potranno accedere.
            </p>
          </div>
        </div>
        
        {/* Pulsanti azioni */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => window.location.reload()}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={saving}
          >
            {saving ? 'Salvataggio...' : 'Salva impostazioni'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;