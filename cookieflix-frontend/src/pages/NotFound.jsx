// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-light-bg">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Pagina non trovata</h2>
        <p className="text-gray-600 mb-8">
          Ci dispiace, la pagina che stai cercando non esiste.
        </p>
        <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg font-bold inline-block hover:bg-opacity-90 transition">
          Torna alla Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;