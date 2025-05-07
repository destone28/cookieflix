// src/components/common/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-800 mb-6">Pagina non trovata</h2>
        <p className="text-gray-600 mb-8">La pagina che stai cercando non esiste o è stata spostata.</p>
        <Link 
          to="/"
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Torna alla Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;