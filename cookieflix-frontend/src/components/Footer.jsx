// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-dark-bg text-light-text py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrizione */}
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-primary">Cookieflix</Link>
            <p className="mt-2 text-sm">
              Il tuo servizio di abbonamento per cookie cutters stampati in 3D.
            </p>
          </div>
          
          {/* Links utili */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links Utili</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-sm hover:text-primary">
                  Catalogo
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="text-sm hover:text-primary">
                  Abbonamenti
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <Link to="/profile" className="text-sm hover:text-primary">
                    Profilo
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-sm hover:text-primary">
                      Accedi
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-sm hover:text-primary">
                      Registrati
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* Informazioni legali */}
          <div>
            <h3 className="text-lg font-bold mb-4">Informazioni Legali</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-primary">
                  Termini di Servizio
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contatti */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contatti</h3>
            <ul className="space-y-2">
              <li className="text-sm">
                <span className="block">Email:</span>
                <a href="mailto:emilio.destratis@gmail.com" className="hover:text-primary">
                  INSERISCI EMAIL
                </a>
              </li>
              <li className="text-sm">
                <span className="block">Telefono:</span>
                <a href="tel:+393515828105" className="hover:text-primary">
                  +39 351 582 8105
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Cookieflix è un progetto di <a href="https://www.3dsprinted.com">3DSprinted di Destratis Emilio</a>. P.IVA 03262770732</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;