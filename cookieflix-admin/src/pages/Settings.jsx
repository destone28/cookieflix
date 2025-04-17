import React, { useState } from 'react';
import { 
  Cog6ToothIcon, 
  EnvelopeIcon, 
  PuzzlePieceIcon, 
  ArchiveBoxIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

// Questo componente verrà creato in seguito
import GeneralSettings from '../components/settings/GeneralSettings';
// Questo componente verrà creato in seguito 
import EmailSettings from '../components/settings/EmailSettings';
// Questo componente verrà creato in seguito
import IntegrationSettings from '../components/settings/IntegrationSettings';
// Questo componente verrà creato in seguito
import BackupSettings from '../components/settings/BackupSettings';
// Questo componente verrà creato in seguito
import SystemLogs from '../components/settings/SystemLogs';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Generali', icon: Cog6ToothIcon },
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'integrations', name: 'Integrazioni', icon: PuzzlePieceIcon },
    { id: 'backup', name: 'Backup e Ripristino', icon: ArchiveBoxIcon },
    { id: 'logs', name: 'Log di Sistema', icon: DocumentTextIcon },
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'email':
        return <EmailSettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'backup':
        return <BackupSettings />;
      case 'logs':
        return <SystemLogs />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Impostazioni</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-6">
          {renderActiveTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;