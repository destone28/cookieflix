// src/components/Navbar.jsx - versione temporanea
import { Link } from 'react-router-dom';
import { useState } from 'react';
// Importa i loghi
import logoFull from '../assets/images/logo-full.webp';
import logoCompact from '../assets/images/logo-compact.webp';

const Navbar = () => {
  // Per ora, impostiamo manualmente isAuthenticated a false
  // invece di usare useAuth() che sta causando il problema
  const isAuthenticated = false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-2 md:py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {/* Logo con dimensioni ottimizzate */}
              <img
                src={logoFull}
                alt="Cookieflix"
                width="260" 
                height="56"
                className="navbar-logo"
              />
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/piani"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Piani
              </Link>
              <Link
                to="/chi-siamo"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Chi siamo
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
                  onClick={() => {}} // Per ora, nessuna funzione di logout
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Accedi
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90"
                >
                  Registrati
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;