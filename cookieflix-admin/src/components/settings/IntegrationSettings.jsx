import React, { useState, useEffect } from 'react';
import { getIntegrationSettings, updateIntegrationSettings } from '../../services/settingsService';
import { CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const IntegrationSettings = () => {
  const [settings, setSettings] = useState({
    stripe: {
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
      enabled: false
    },
    facebook: {
      appId: '',
      appSecret: '',
      enabled: false
    },
    google: {
      clientId: '',
      clientSecret: '',
      enabled: false
    },
    aws: {
      accessKey: '',
      secretKey: '',
      region: '',
      s3Bucket: '',
      enabled: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    stripe: false,
    facebook: false,
    google: false,
    aws: false
  });

  // AWS regions
  const awsRegions = [
    { code: 'us-east-1', name: 'US East (N. Virginia)' },
    { code: 'us-east-2', name: 'US East (Ohio)' },
    { code: 'us-west-1', name: 'US West (N. California)' },
    { code: 'us-west-2', name: 'US West (Oregon)' },
    { code: 'eu-west-1', name: 'EU (Ireland)' },
    { code: 'eu-central-1', name: 'EU (Frankfurt)' },
    { code: 'eu-west-2', name: 'EU (London)' },
    { code: 'eu-south-1', name: 'EU (Milan)' },
    { code: 'eu-west-3', name: 'EU (Paris)' },
    { code: 'eu-north-1', name: 'EU (Stockholm)' },
    { code: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)' },
    { code: 'ap-northeast-2', name: 'Asia Pacific (Seoul)' },
    { code: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' },
    { code: 'ap-southeast-2', name: 'Asia Pacific (Sydney)' },
    { code: 'ap-south-1', name: 'Asia Pacific (Mumbai)' },
    { code: 'sa-east-1', name: 'South America (São Paulo)' }
  ];

  // Carica i dati iniziali
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getIntegrationSettings();
        setSettings(data);
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento delle impostazioni di integrazione');
        setLoading(false);
        console.error(err);
      }
    };

    fetchSettings();
  }, []);

  // Gestisce il cambio dei campi del form
  const handleChange = (integration, field, value) => {
    setSettings({
      ...settings,
      [integration]: {
        ...settings[integration],
        [field]: value
      }
    });
  };

  // Toggle visibilità chiavi segrete
  const toggleSecretVisibility = (integration) => {
    setShowSecrets({
      ...showSecrets,
      [integration]: !showSecrets[integration]
    });
  };

  // Salva le impostazioni
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedSettings = await updateIntegrationSettings(settings);
      setSettings(updatedSettings);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch (err) {
      setError('Errore nel salvataggio delle impostazioni di integrazione');
      setSaving(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p className="mt-2 text-gray-500">Caricamento impostazioni integrazioni...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Impostazioni Integrazioni</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          Impostazioni integrazioni salvate con successo
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Stripe Integration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Stripe</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Abilitato</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.stripe.enabled}
                    onChange={(e) => handleChange('stripe', 'enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Integrazione con Stripe per gestire pagamenti e abbonamenti.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stripePublicKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Chiave pubblica (Publishable Key)
                </label>
                <input
                  type="text"
                  id="stripePublicKey"
                  value={settings.stripe.publicKey}
                  onChange={(e) => handleChange('stripe', 'publicKey', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="pk_..."
                />
              </div>
              <div>
                <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Chiave segreta (Secret Key)
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.stripe ? "text" : "password"}
                    id="stripeSecretKey"
                    value={settings.stripe.secretKey}
                    onChange={(e) => handleChange('stripe', 'secretKey', e.target.value)}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="sk_..."
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleSecretVisibility('stripe')}
                  >
                    {showSecrets.stripe ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.stripe ? "text" : "password"}
                    id="stripeWebhookSecret"
                    value={settings.stripe.webhookSecret}
                    onChange={(e) => handleChange('stripe', 'webhookSecret', e.target.value)}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="whsec_..."
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleSecretVisibility('stripe')}
                  >
                    {showSecrets.stripe ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Puoi trovare queste chiavi nella dashboard Stripe.
                </p>
              </div>
            </div>
          </div>

          {/* Facebook Integration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Facebook</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Abilitato</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.facebook.enabled}
                    onChange={(e) => handleChange('facebook', 'enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Integrazione con Facebook per il login social.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="facebookAppId" className="block text-sm font-medium text-gray-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  id="facebookAppId"
                  value={settings.facebook.appId}
                  onChange={(e) => handleChange('facebook', 'appId', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="facebookAppSecret" className="block text-sm font-medium text-gray-700 mb-1">
                  App Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.facebook ? "text" : "password"}
                    id="facebookAppSecret"
                    value={settings.facebook.appSecret}
                    onChange={(e) => handleChange('facebook', 'appSecret', e.target.value)}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleSecretVisibility('facebook')}
                  >
                    {showSecrets.facebook ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Configura questi valori nel portale sviluppatori di Facebook.
            </p>
          </div>

          {/* Google Integration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Google</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Abilitato</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.google.enabled}
                    onChange={(e) => handleChange('google', 'enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Integrazione con Google per il login social.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="googleClientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  id="googleClientId"
                  value={settings.google.clientId}
                  onChange={(e) => handleChange('google', 'clientId', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="googleClientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.google ? "text" : "password"}
                    id="googleClientSecret"
                    value={settings.google.clientSecret}
                    onChange={(e) => handleChange('google', 'clientSecret', e.target.value)}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleSecretVisibility('google')}
                  >
                    {showSecrets.google ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Configura questi valori nella console Google Cloud.
            </p>
          </div>

          {/* AWS Integration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">AWS</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Abilitato</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.aws.enabled}
                    onChange={(e) => handleChange('aws', 'enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Integrazione con Amazon Web Services per lo storage di file e backup.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="awsAccessKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Access Key
                </label>
                <input
                  type="text"
                  id="awsAccessKey"
                  value={settings.aws.accessKey}
                  onChange={(e) => handleChange('aws', 'accessKey', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="AKIA..."
                />
              </div>
              <div>
                <label htmlFor="awsSecretKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.aws ? "text" : "password"}
                    id="awsSecretKey"
                    value={settings.aws.secretKey}
                    onChange={(e) => handleChange('aws', 'secretKey', e.target.value)}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleSecretVisibility('aws')}
                  >
                    {showSecrets.aws ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="awsRegion" className="block text-sm font-medium text-gray-700 mb-1">
                  Regione
                </label>
                <select
                  id="awsRegion"
                  value={settings.aws.region}
                  onChange={(e) => handleChange('aws', 'region', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Seleziona una regione</option>
                  {awsRegions.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="awsS3Bucket" className="block text-sm font-medium text-gray-700 mb-1">
                  S3 Bucket
                </label>
                <input
                  type="text"
                  id="awsS3Bucket"
                  value={settings.aws.s3Bucket}
                  onChange={(e) => handleChange('aws', 's3Bucket', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Si consiglia di creare un utente IAM dedicato con permessi limitati per questa integrazione.
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

export default IntegrationSettings;