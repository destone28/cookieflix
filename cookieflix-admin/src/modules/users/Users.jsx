// src/modules/users/Users.jsx
import UserList from './UserList';

const Users = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualizza e gestisci gli utenti della piattaforma
        </p>
      </div>
      
      <UserList />
    </div>
  );
};

export default Users;