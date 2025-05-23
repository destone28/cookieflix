// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Importa i loghi
import logoFull from '../assets/images/logo-full.webp';
import logoCompact from '../assets/images/logo-compact.webp';

const Navbar = () => {
  // Utilizziamo useAuth() per determinare se l'utente è autenticato
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook per ottenere la posizione corrente
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Funzione per verificare se un link è attivo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Funzione per generare le classi CSS di un link della navbar in base al suo stato attivo
  const getLinkClasses = (path) => {
    return isActive(path)
      ? "border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  };

  // Funzione per generare le classi CSS di un link del menu mobile in base al suo stato attivo
  const getMobileLinkClasses = (path) => {
    return isActive(path)
      ? "block pl-3 pr-4 py-2 border-l-4 border-primary bg-indigo-50 text-primary font-medium"
      : "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800";
  };

  // Funzione per gestire il logout
  const handleLogout = () => {
    logout();
    navigate('/');
    // Chiudi il menu mobile se aperto
    setMobileMenuOpen(false);
  };

  // Funzione per gestire i click sui link del menu mobile
  const handleMobileMenuClick = () => {
    setMobileMenuOpen(false);
  };

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
                className="hidden md:block navbar-logo"
              />
              <img
                src={logoCompact}
                alt="Cookieflix"
                className="md:hidden navbar-logo"
              />
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={getLinkClasses('/')}
              >
                Home
              </Link>
              <Link
                to="/plans"
                className={getLinkClasses('/plans')}
              >
                Piani
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={getLinkClasses('/dashboard')}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/catalog"
                    className={getLinkClasses('/catalog')}
                  >
                    Catalogo
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <Link
                  to="/profile"
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-all"
                >
                  Profilo
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`px-3 py-2 text-sm font-medium ${isActive('/login') ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Accedi
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-all"
                >
                  Registrati
                </Link>
              </div>
            )}
          </div>
          
          {/* Menu mobile hamburger button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded="false"
            >
              <span className="sr-only">Apri menu principale</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={getMobileLinkClasses('/')}
            onClick={handleMobileMenuClick}
          >
            Home
          </Link>
          <Link
            to="/plans"
            className={getMobileLinkClasses('/plans')}
            onClick={handleMobileMenuClick}
          >
            Piani
          </Link>
          <Link
            to="/about-us"
            className={getMobileLinkClasses('/about-us')}
            onClick={handleMobileMenuClick}
          >
            Chi siamo
          </Link>
          
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={getMobileLinkClasses('/dashboard')}
                onClick={handleMobileMenuClick}
              >
                Dashboard
              </Link>
              <Link
                to="/catalog"
                className={getMobileLinkClasses('/catalog')}
                onClick={handleMobileMenuClick}
              >
                Catalogo
              </Link>
              <Link
                to="/profile"
                className={getMobileLinkClasses('/profile')}
                onClick={handleMobileMenuClick}
              >
                Profilo
              </Link>
            </>
          )}
          
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className={getMobileLinkClasses('/login')}
                onClick={handleMobileMenuClick}
              >
                Accedi
              </Link>
              <Link
                to="/register"
                className={getMobileLinkClasses('/register')}
                onClick={handleMobileMenuClick}
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;