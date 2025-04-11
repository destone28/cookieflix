// src/components/PreferredCategories.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserPreferredCategories } from '../services/userService';
import { getCategories } from '../services/productService';

const PreferredCategories = () => {
  const [userCategories, setUserCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const [userCategoriesData, allCategoriesData] = await Promise.all([
          getUserPreferredCategories().catch(() => []),
          getCategories().catch(() => [])
        ]);
        setUserCategories(userCategoriesData);
        setAllCategories(allCategoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        <p>Si è verificato un errore: {error}</p>
      </div>
    );
  }

  if (userCategories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 mb-4">Non hai ancora selezionato categorie preferite.</p>
        <Link 
          to="/categories"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors inline-block"
        >
          Seleziona categorie
        </Link>
      </div>
    );
  }

  // Calcola le categorie non selezionate
  const unselectedCategories = allCategories.filter(
    cat => !userCategories.some(userCat => userCat.id === cat.id)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {userCategories.map(category => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-32 bg-gray-200 relative">
              {category.image_url ? (
                <img 
                  src={category.image_url} 
                  alt={category.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary bg-opacity-20">
                  <span className="text-secondary font-medium">{category.name}</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                  Preferita
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {category.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {userCategories.length} categorie selezionate
          {unselectedCategories.length > 0 && ` (${unselectedCategories.length} disponibili)`}
        </div>
        <Link 
          to="/categories"
          className="text-secondary hover:text-primary text-sm font-medium"
        >
          Modifica selezione
        </Link>
      </div>
    </div>
  );
};

export default PreferredCategories;