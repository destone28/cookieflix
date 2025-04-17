import api from './apiConfig';

// Dati mock per lo sviluppo
const mockGeneralSettings = {
  siteName: 'Cookieflix',
  siteDescription: 'Il miglior servizio di abbonamento per cookie cutters stampati in 3D',
  contactEmail: 'supporto@cookieflix.com',
  contactPhone: '+39 02 1234567',
  address: 'Via Roma 123, 20100 Milano',
  logo: '/assets/images/cookieflix-logo.png',
  currency: 'EUR',
  language: 'it',
  timezone: 'Europe/Rome',
  maintenanceMode: false
};

const mockEmailSettings = {
  smtpHost: 'smtp.cookieflix.com',
  smtpPort: 587,
  smtpUser: 'noreply@cookieflix.com',
  smtpPassword: '**********',
  smtpEncryption: 'TLS',
  senderName: 'Cookieflix',
  senderEmail: 'noreply@cookieflix.com',
  welcomeEmailTemplate: '<p>Benvenuto su {{siteName}}!</p>',
  orderConfirmationTemplate: '<p>Grazie per il tuo ordine #{{orderId}}.</p>',
  passwordResetTemplate: '<p>Clicca qui per reimpostare la tua password: {{resetLink}}</p>',
  notificationsEnabled: true
};

const mockIntegrationSettings = {
  stripe: {
    publicKey: 'pk_test_MOCK_KEY',
    secretKey: '**********',
    webhookSecret: '**********',
    enabled: true
  },
  facebook: {
    appId: '123456789012345',
    appSecret: '**********',
    enabled: true
  },
  google: {
    clientId: 'mock-client-id.apps.googleusercontent.com',
    clientSecret: '**********',
    enabled: false
  },
  aws: {
    accessKey: 'AKIAIOSFODNN7EXAMPLE',
    secretKey: '**********',
    region: 'eu-west-1',
    s3Bucket: 'cookieflix-uploads',
    enabled: true
  }
};

const mockBackupSettings = {
  automaticBackups: true,
  backupFrequency: 'daily', // daily, weekly, monthly
  backupTime: '02:00',
  retentionPeriod: 30, // days
  storageLocation: 's3',
  lastBackupDate: '2024-03-15T02:00:00Z',
  backupHistory: [
    { id: 1, date: '2024-03-15T02:00:00Z', size: '45.2MB', status: 'success' },
    { id: 2, date: '2024-03-14T02:00:00Z', size: '44.8MB', status: 'success' },
    { id: 3, date: '2024-03-13T02:00:00Z', size: '44.5MB', status: 'success' },
    { id: 4, date: '2024-03-12T02:00:00Z', size: '43.9MB', status: 'success' },
    { id: 5, date: '2024-03-11T02:00:00Z', size: '43.7MB', status: 'success' }
  ]
};

const mockSystemLogs = {
  logs: [
    { id: 1, timestamp: '2024-03-15T10:23:45Z', level: 'INFO', module: 'users', message: 'Utente #123 ha effettuato il login' },
    { id: 2, timestamp: '2024-03-15T10:15:32Z', level: 'WARNING', module: 'payments', message: 'Tentativo di pagamento fallito per abbonamento #456' },
    { id: 3, timestamp: '2024-03-15T09:58:17Z', level: 'ERROR', module: 'designs', message: 'Errore nel caricamento del design #789' },
    { id: 4, timestamp: '2024-03-15T09:45:03Z', level: 'INFO', module: 'subscriptions', message: 'Nuovo abbonamento #101 creato' },
    { id: 5, timestamp: '2024-03-15T09:30:11Z', level: 'INFO', module: 'categories', message: 'Categoria #202 aggiornata' },
    { id: 6, timestamp: '2024-03-15T09:12:45Z', level: 'ERROR', module: 'system', message: 'Errore nella connessione al database' },
    { id: 7, timestamp: '2024-03-15T08:55:29Z', level: 'WARNING', module: 'auth', message: 'Tentativo di accesso fallito per utente admin@cookieflix.com' },
    { id: 8, timestamp: '2024-03-15T08:45:10Z', level: 'INFO', module: 'system', message: 'Server avviato correttamente' }
  ],
  logLevels: {
    INFO: true,
    WARNING: true,
    ERROR: true
  },
  logModules: {
    users: true,
    payments: true,
    designs: true,
    subscriptions: true,
    categories: true,
    system: true,
    auth: true
  }
};

// Funzioni per ottenere le impostazioni
export const getGeneralSettings = async () => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.get('/admin/settings/general');
    // return response.data;
    
    // Per ora, restituisce dati mock
    return Promise.resolve(mockGeneralSettings);
  } catch (error) {
    console.error('Errore nel recupero delle impostazioni generali:', error);
    throw error;
  }
};

export const getEmailSettings = async () => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.get('/admin/settings/email');
    // return response.data;
    
    // Per ora, restituisce dati mock
    return Promise.resolve(mockEmailSettings);
  } catch (error) {
    console.error('Errore nel recupero delle impostazioni email:', error);
    throw error;
  }
};

export const getIntegrationSettings = async () => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.get('/admin/settings/integrations');
    // return response.data;
    
    // Per ora, restituisce dati mock
    return Promise.resolve(mockIntegrationSettings);
  } catch (error) {
    console.error('Errore nel recupero delle impostazioni integrazioni:', error);
    throw error;
  }
};

export const getBackupSettings = async () => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.get('/admin/settings/backup');
    // return response.data;
    
    // Per ora, restituisce dati mock
    return Promise.resolve(mockBackupSettings);
  } catch (error) {
    console.error('Errore nel recupero delle impostazioni backup:', error);
    throw error;
  }
};

export const getSystemLogs = async (params = {}) => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.get('/admin/logs', { params });
    // return response.data;
    
    // Per ora, restituisce dati mock
    // Simuliamo paginazione e filtri
    const { page = 1, limit = 10, level, module } = params;
    
    let filteredLogs = [...mockSystemLogs.logs];
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    return Promise.resolve({
      logs: paginatedLogs,
      totalItems: filteredLogs.length,
      totalPages: Math.ceil(filteredLogs.length / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Errore nel recupero dei log di sistema:', error);
    throw error;
  }
};

// Funzioni per aggiornare le impostazioni
export const updateGeneralSettings = async (settings) => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.put('/admin/settings/general', settings);
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci i dati aggiornati
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...mockGeneralSettings, ...settings });
      }, 500);
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle impostazioni generali:', error);
    throw error;
  }
};

export const updateEmailSettings = async (settings) => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.put('/admin/settings/email', settings);
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci i dati aggiornati
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...mockEmailSettings, ...settings });
      }, 500);
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle impostazioni email:', error);
    throw error;
  }
};

export const updateIntegrationSettings = async (settings) => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.put('/admin/settings/integrations', settings);
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci i dati aggiornati
    return new Promise(resolve => {
      setTimeout(() => {
        // Deep merge per gestire oggetti annidati
        const updatedSettings = { ...mockIntegrationSettings };
        Object.keys(settings).forEach(key => {
          if (typeof settings[key] === 'object' && settings[key] !== null) {
            updatedSettings[key] = { ...updatedSettings[key], ...settings[key] };
          } else {
            updatedSettings[key] = settings[key];
          }
        });
        resolve(updatedSettings);
      }, 500);
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle impostazioni integrazioni:', error);
    throw error;
  }
};

export const updateBackupSettings = async (settings) => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.put('/admin/settings/backup', settings);
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci i dati aggiornati
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...mockBackupSettings, ...settings });
      }, 500);
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle impostazioni backup:', error);
    throw error;
  }
};

export const createManualBackup = async () => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.post('/admin/backup/manual');
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci una risposta di successo
    return new Promise(resolve => {
      setTimeout(() => {
        const newBackup = {
          id: mockBackupSettings.backupHistory.length + 1,
          date: new Date().toISOString(),
          size: '45.6MB',
          status: 'success'
        };
        
        mockBackupSettings.backupHistory.unshift(newBackup);
        mockBackupSettings.lastBackupDate = newBackup.date;
        
        resolve({ 
          success: true, 
          message: 'Backup manuale creato con successo',
          backup: newBackup
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Errore nella creazione del backup manuale:', error);
    throw error;
  }
};

export const restoreBackup = async (backupId) => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.post(`/admin/backup/restore/${backupId}`);
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci una risposta di successo
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: `Ripristino dal backup #${backupId} completato con successo` 
        });
      }, 2000);
    });
  } catch (error) {
    console.error(`Errore nel ripristino del backup #${backupId}:`, error);
    throw error;
  }
};

export const updateLogSettings = async (settings) => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.put('/admin/logs/settings', settings);
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci i dati aggiornati
    return new Promise(resolve => {
      setTimeout(() => {
        if (settings.logLevels) {
          mockSystemLogs.logLevels = { ...mockSystemLogs.logLevels, ...settings.logLevels };
        }
        
        if (settings.logModules) {
          mockSystemLogs.logModules = { ...mockSystemLogs.logModules, ...settings.logModules };
        }
        
        resolve({ 
          logLevels: mockSystemLogs.logLevels,
          logModules: mockSystemLogs.logModules
        });
      }, 500);
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle impostazioni dei log:', error);
    throw error;
  }
};

export const clearLogs = async () => {
  try {
    // Quando l'API sarà pronta, decommenta questa riga
    // const response = await api.delete('/admin/logs');
    // return response.data;
    
    // Per ora, simula un ritardo e restituisci una risposta di successo
    return new Promise(resolve => {
      setTimeout(() => {
        mockSystemLogs.logs = [];
        resolve({ 
          success: true, 
          message: 'Log di sistema cancellati con successo' 
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Errore nella cancellazione dei log di sistema:', error);
    throw error;
  }
};

// Esporta tutte le funzioni come default
export default {
  getGeneralSettings,
  getEmailSettings,
  getIntegrationSettings,
  getBackupSettings,
  getSystemLogs,
  updateGeneralSettings,
  updateEmailSettings,
  updateIntegrationSettings,
  updateBackupSettings,
  createManualBackup,
  restoreBackup,
  updateLogSettings,
  clearLogs
};