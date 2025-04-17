import React, { useState, useEffect } from 'react';
import { getBackupSettings, updateBackupSettings, createManualBackup, restoreBackup } from '../../services/settingsService';
import { CheckIcon, ArrowPathIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const BackupSettings = () => {
  const [settings, setSettings] = useState({
    automaticBackups: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionPeriod: 30,
    storageLocation: 's3',
    lastBackupDate: null,
    backupHistory: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState(null);

  // Opzioni di frequenza
  const frequencyOptions = [
    { value: 'hourly', label: 'Ogni ora' },
    { value: 'daily', label: 'Giornaliera' },
    { value: 'weekly', label: 'Settimanale' },
    { value: 'monthly', label: 'Mensile' }
  ];

  // Opzioni di storage
  const storageOptions = [
    { value: 'local', label: 'Storage locale' },
    { value: 's3', label: 'Amazon S3' },
    { value: 'dropbox', label: 'Dropbox' },
    { value: 'google_drive', label: 'Google Drive' }
  ];

  // Carica i dati iniziali
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getBackupSettings();
        setSettings(data);
        setLoading(false);
      } catch (err) {
        setError('Errore nel caricamento delle impostazioni di backup');
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

  // Formatta la data
  const formatDate = (dateString) => {
    if (!dateString) return 'Mai eseguito';
    
    const date = new Date(dateString);
    
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Crea un backup manuale
  const handleManualBackup = async () => {
    try {
      setBackingUp(true);
      setError(null);
      
      const result = await createManualBackup();
      
      // Aggiorna l'elenco dei backup con il nuovo backup
      setSettings({
        ...settings,
        lastBackupDate: result.backup.date,
        backupHistory: [result.backup, ...settings.backupHistory]
      });
      
      setSuccessMessage('Backup manuale creato con successo');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setBackingUp(false);
    } catch (err) {
      setError('Errore nella creazione del backup manuale');
      setBackingUp(false);
      console.error(err);
    }
  };

  // Mostra conferma ripristino
  const showRestoreConfirmation = (backup) => {
    setBackupToRestore(backup);
    setShowRestoreConfirm(true);
  };

  // Ripristina da backup
  const handleRestore = async () => {
    if (!backupToRestore) return;
    
    try {
      setRestoring(true);
      setError(null);
      
      const result = await restoreBackup(backupToRestore.id);
      
      setSuccessMessage(result.message);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setRestoring(false);
      setShowRestoreConfirm(false);
    } catch (err) {
      setError(`Errore nel ripristino dal backup #${backupToRestore.id}`);
      setRestoring(false);
      setShowRestoreConfirm(false);
      console.error(err);
    }
  };

  // Simula download backup
  const handleDownloadBackup = (backup) => {
    alert(`Funzionalità di download del backup #${backup.id} ancora da implementare.`);
  };

  // Salva le impostazioni
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      await updateBackupSettings(settings);
      
      setSuccessMessage('Impostazioni di backup salvate con successo');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch (err) {
      setError('Errore nel salvataggio delle impostazioni di backup');
      setSaving(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p className="mt-2 text-gray-500">Caricamento impostazioni backup...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Backup e Ripristino</h2>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}
        
        <div className="space-y-8">
          {/* Backup manuale */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Manuale</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ultimo backup:</p>
                <p className="font-medium">{formatDate(settings.lastBackupDate)}</p>
              </div>
              <button
                type="button"
                onClick={handleManualBackup}
                disabled={backingUp}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {backingUp ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    Backup in corso...
                  </>
                ) : (
                  'Crea backup ora'
                )}
              </button>
            </div>
          </div>
          
          {/* Impostazioni backup automatico */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Impostazioni Backup Automatico</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="automaticBackups"
                    name="automaticBackups"
                    checked={settings.automaticBackups}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="automaticBackups" className="ml-2 block text-sm text-gray-700">
                    Abilita backup automatici
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                      Frequenza
                    </label>
                    <select
                      id="backupFrequency"
                      name="backupFrequency"
                      value={settings.backupFrequency}
                      onChange={handleChange}
                      disabled={!settings.automaticBackups}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-100"
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Orario
                    </label>
                    <input
                      type="time"
                      id="backupTime"
                      name="backupTime"
                      value={settings.backupTime}
                      onChange={handleChange}
                      disabled={!settings.automaticBackups}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                      Periodo di conservazione (giorni)
                    </label>
                    <input
                      type="number"
                      id="retentionPeriod"
                      name="retentionPeriod"
                      value={settings.retentionPeriod}
                      onChange={handleChange}
                      min="1"
                      max="365"
                      disabled={!settings.automaticBackups}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      Destinazione
                    </label>
                    <select
                      id="storageLocation"
                      name="storageLocation"
                      value={settings.storageLocation}
                      onChange={handleChange}
                      disabled={!settings.automaticBackups}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-100"
                    >
                      {storageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={saving}
                >
                  {saving ? 'Salvataggio...' : 'Salva impostazioni'}
                </button>
              </div>
            </div>
          </form>
          
          {/* Cronologia backup */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cronologia Backup</h3>
            
            {settings.backupHistory.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun backup disponibile.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensione</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {settings.backupHistory.map((backup) => (
                      <tr key={backup.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{backup.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(backup.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            backup.status === 'success' ? 'bg-green-100 text-green-800' : 
                            backup.status === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {backup.status === 'success' ? 'Completato' : 
                             backup.status === 'failed' ? 'Fallito' : 
                             'In corso'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDownloadBackup(backup)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            title="Scarica backup"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => showRestoreConfirmation(backup)}
                            className="text-yellow-600 hover:text-yellow-900"
                            disabled={backup.status !== 'success'}
                            title="Ripristina da questo backup"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal di conferma ripristino */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center text-yellow-500 mb-4">
              <ExclamationTriangleIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Conferma ripristino</h3>
            <p className="text-sm text-gray-500 mb-4">
              Stai per ripristinare il database dal backup #{backupToRestore?.id} creato il {formatDate(backupToRestore?.date)}. Questa operazione sovrascriverà tutti i dati attuali. Sei sicuro di voler procedere?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {restoring ? 'Ripristino in corso...' : 'Ripristina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackupSettings;