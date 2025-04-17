// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Categories from './modules/categories/Categories';
import CategoryCreate from './modules/categories/CategoryCreate';
import CategoryEdit from './modules/categories/CategoryEdit';
import Dashboard from './modules/dashboard/Dashboard';
import Designs from './modules/designs/Designs';
import DesignCreate from './modules/designs/DesignCreate';
import DesignEdit from './modules/designs/DesignEdit';
import Login from './modules/auth/Login';
import Users from './modules/users/Users';
import UserDetail from './modules/users/UserDetail';
import Settings from './pages/Settings';
import Subscriptions from './modules/subscriptions/Subscriptions';
import SubscriptionDetail from './modules/subscriptions/SubscriptionDetail';

// HOC per proteggere le route
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Caricamento...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/create" element={<CategoryCreate />} />
            <Route path="categories/:id/edit" element={<CategoryEdit />} />
            <Route path="designs" element={<Designs />} />
            <Route path="designs/create" element={<DesignCreate />} />
            <Route path="designs/:id/edit" element={<DesignEdit />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;