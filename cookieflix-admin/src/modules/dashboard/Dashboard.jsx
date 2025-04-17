// src/modules/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalDesigns: 0
  });

  useEffect(() => {
    // Qui implementeremo la chiamata alle API per ottenere i dati reali
    setStats({
      totalUsers: 1250,
      activeSubscriptions: 843,
      monthlyRevenue: 12459.99,
      totalDesigns: 156
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Panoramica generale di Cookieflix
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Utenti totali */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Utenti totali
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalUsers}
            </dd>
          </div>
        </div>

        {/* Abbonamenti attivi */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Abbonamenti attivi
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.activeSubscriptions}
            </dd>
          </div>
        </div>

        {/* Ricavi mensili */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Ricavi mensili
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.monthlyRevenue.toLocaleString('it-IT', {
                style: 'currency',
                currency: 'EUR'
              })}
            </dd>
          </div>
        </div>

        {/* Design totali */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Design totali
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalDesigns}
            </dd>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">
          Attività recenti
        </h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <p className="p-4 text-gray-500 text-center">
            I dati sulle attività recenti verranno caricati qui
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;