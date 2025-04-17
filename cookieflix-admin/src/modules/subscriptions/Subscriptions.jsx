// src/modules/subscriptions/Subscriptions.jsx
import SubscriptionList from './SubscriptionList';

const Subscriptions = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Abbonamenti</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualizza e gestisci gli abbonamenti della piattaforma
        </p>
      </div>
      
      <SubscriptionList />
    </div>
  );
};

export default Subscriptions;