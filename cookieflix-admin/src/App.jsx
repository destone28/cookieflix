// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './modules/auth/AdminLogin'; // Nuovo componente per login admin
import ApiDiagnostics from './components/settings/ApiDiagnostics';
import Categories from './modules/categories/Categories';
import CategoryCreate from './modules/categories/CategoryCreate';
import CategoryEdit from './modules/categories/CategoryEdit';
import Dashboard from './modules/dashboard/Dashboard';
import Designs from './modules/designs/Designs';
import DesignCreate from './modules/designs/DesignCreate';
import DesignEdit from './modules/designs/DesignEdit';
import Layout from './components/layout/Layout';
import Login from './modules/auth/Login';
import NotFound from './components/common/NotFound'; // Componente per pagine non trovate
import Settings from './pages/Settings';
import Subscriptions from './modules/subscriptions/Subscriptions';
import SubscriptionDetail from './modules/subscriptions/SubscriptionDetail';
import Users from './modules/users/Users';
import UserDetail from './modules/users/UserDetail';


// HOC per proteggere le route admin
const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-600">Verifica accesso...</p>
        </div>
      </div>
    );
  }
  
  // Verifica che l'utente sia loggato e sia admin
  if (!currentUser || !currentUser.is_admin) {
    return <Navigate to="/admin-login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Rotte admin protette */}
          <Route path="/" element={
            <ProtectedAdminRoute>
              <Layout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/create" element={<CategoryCreate />} />
            <Route path="categories/:id/edit" element={<CategoryEdit />} />
            <Route path="designs" element={<Designs />} />
            <Route path="designs/create" element={<DesignCreate />} />
            <Route path="designs/:id/edit" element={<DesignEdit />} />
            <Route path="diagnostics" element={<ApiDiagnostics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
          </Route>
          
          {/* Pagina 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;