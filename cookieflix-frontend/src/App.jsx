// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

// Importiamo tutte le pagine
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import CategorySelection from './pages/CategorySelection';
import NotFound from './pages/NotFound';

// Componente per le rotte protette
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<Subscription />} />
          <Route path="/about-us" element={<Home />} /> {/* Sostituzione temporanea */}
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          
          {/* Rotte protette */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/catalog" element={
            <ProtectedRoute>
              <Catalog />
            </ProtectedRoute>
          } />
          <Route path="/subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute>
              <CategorySelection />
            </ProtectedRoute>
          } />
          
          {/* Rotta 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  // Mostra dettagli errore solo in ambiente di sviluppo
  const showErrorDetails = import.meta.env.DEV;
  
  return (
    <ErrorBoundary showDetails={showErrorDetails}>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;