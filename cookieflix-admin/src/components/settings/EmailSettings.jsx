import React, { useState, useEffect } from 'react';
import { getEmailSettings, updateEmailSettings } from '../../services/settingsService';
import { CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpEncryption: 'TLS',
    senderName: '',
    senderEmail: '',
    welcomeEmailTemplate: '',
    orderConfirmationTemplate: '',
    passwordResetTemplate: '',
    notificationsEnabled: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('welcome');

  // Opzioni di crittografia SMTP
  const encryptionOptions = [
    { value: 'None', label: 'Nessuna' },
    { value: 'SSL', label: 'SSL' },
    { value: 'TLS', label: 'TLS' },
    { value: 'STARTTLS', label: 'STARTTLS' }
  ];

  // Template disponibili
  const templates = [
    { id: 'welcome', name: 'Email di Benvenuto' },
    { id: 'orderConfirmation', name: 'Conferma Ordine' },
    { id: 'passwordReset', name: 'Reset Password' }
  ];

  // Variabili disponibili per i template
  const templateVariables = {
    welcome: ['{{siteName}}', '{{userName}}', '{{loginLink}}'],
    orderConfirmation: ['{{siteName}}', '{{userName}}', '{{orderId}}', '{{orderDetails}}', '{{orderDate}}', '{{totalAmount}}'],
    passwordReset: ['{{siteName}}', '{{userName}}', '{{resetLink}}', '{{expiryTime}}']
  };

  // Carica i dati iniziali
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getEmailSettings();
        setSettings(data);
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento delle impostazioni email');
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

  // Gestisce il cambio dei template email
  const handleTemplateChange = (e) => {
    const { value } = e.target;
    setSettings({
      ...settings,
      [activeTemplate + 'EmailTemplate']: value
    });
  };

  // Inserisce una variabile nel template corrente
  const insertVariable = (variable) => {
    const fieldName = activeTemplate + 'EmailTemplate';
    const textArea = document.getElementById('emailTemplate');
    const cursorPos = textArea.selectionStart;
    
    const textBefore = settings[fieldName].substring(0, cursorPos);
    const textAfter = settings[fieldName].substring(cursorPos);
    
    setSettings({
      ...settings,
      [fieldName]: textBefore + variable + textAfter
    });
    
    // Posiziona il cursore dopo la variabile inserita
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(cursorPos + variable.length, cursorPos + variable.length);
    }, 0);
  };

  // Invia email di test
  const sendTestEmail = async () => {
    // Simula l'invio di un'email di test
    alert('Funzionalità di invio email di test ancora da implementare. Verrà inviata una email di test a ' + settings.senderEmail);
  };

  // Salva le impostazioni
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      await updateEmailSettings(settings);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch (err) {
      setError('Errore nel salvataggio delle impostazioni email');
      setSaving(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p className="mt-2 text-gray-500">Caricamento impostazioni email...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Impostazioni Email</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          Impostazioni email salvate con successo
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Configurazione SMTP */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurazione server SMTP</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Host SMTP */}
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                  Host SMTP
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  name="smtpHost"
                  value={settings.smtpHost}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="smtp.example.com"
                  required
                />
              </div>
              
              {/* Porta SMTP */}
              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                  Porta SMTP
                </label>
                <input
                  type="number"
                  id="smtpPort"
                  name="smtpPort"
                  value={settings.smtpPort}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              {/* Crittografia */}
              <div>
                <label htmlFor="smtpEncryption" className="block text-sm font-medium text-gray-700 mb-1">
                  Crittografia
                </label>
                <select
                  id="smtpEncryption"
                  name="smtpEncryption"
                  value={settings.smtpEncryption}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {encryptionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Utente SMTP */}
              <div>
                <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 mb-1">
                  Utente SMTP
                </label>
                <input
                  type="text"
                  id="smtpUser"
                  name="smtpUser"
                  value={settings.smtpUser}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="username@example.com"
                  required
                />
              </div>
              
              {/* Password SMTP */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password SMTP
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="smtpPassword"
                    name="smtpPassword"
                    value={settings.smtpPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informazioni mittente */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informazioni mittente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome mittente */}
              <div>
                <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome mittente
                </label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={settings.senderName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Cookieflix"
                  required
                />
              </div>
              
              {/* Email mittente */}
              <div>
                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email mittente
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={settings.senderEmail}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="noreply@cookieflix.com"
                  required
                />
              </div>
              
              {/* Invia email di test */}
              <div className="col-span-1 md:col-span-2">
                <button
                  type="button"
                  onClick={sendTestEmail}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Invia email di test
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  Verifica che le impostazioni SMTP funzionino correttamente inviando un'email di test.
                </p>
              </div>
            </div>
          </div>
          
          {/* Template email */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Template email</h3>
            
            {/* Selezione template */}
            <div className="mb-4">
              <div className="flex border-b border-gray-200">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setActiveTemplate(template.id)}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTemplate === template.id
                        ? 'text-primary-600 border-b-2 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Editor template */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700">
                  Contenuto
                </label>
                <div className="text-xs text-gray-500">
                  Variabili disponibili:
                  <div className="mt-1 flex flex-wrap gap-1">
                    {templateVariables[activeTemplate].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea
                id="emailTemplate"
                name="emailTemplate"
                value={settings[activeTemplate + 'EmailTemplate']}
                onChange={handleTemplateChange}
                rows="10"
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Puoi usare HTML e le variabili disponibili per personalizzare il template.
              </p>
            </div>
          </div>
          
          {/* Notifiche */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notifiche</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationsEnabled"
                name="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-700">
                Abilita notifiche email automatiche
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Quando abilitate, il sistema invierà automaticamente email agli utenti per eventi come registrazione, ordini, abbonamenti, ecc.
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

export default EmailSettings;