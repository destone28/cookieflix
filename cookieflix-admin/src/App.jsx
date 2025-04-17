// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './modules/dashboard/Dashboard';
import Login from './modules/auth/Login';
import Users from './modules/users/Users';
import UserDetail from './modules/users/UserDetail';

// Placeholder components per gli altri moduli
const Subscriptions = () => <div>Gestione Abbonamenti</div>;
const Categories = () => <div>Gestione Categorie</div>;
const Designs = () => <div>Gestione Design</div>;
const Settings = () => <div>Impostazioni</div>;

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
            <Route path="categories" element={<Categories />} />
            <Route path="designs" element={<Designs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;