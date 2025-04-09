import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/productService';
import { updateSubscriptionCategories, getActiveSubscription } from '../services/subscriptionService';

const CategorySelection = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carica le categorie e l'abbonamento in parallelo
        const [categoriesData, subscriptionData] = await Promise.all([
          getCategories(),
          getActiveSubscription()
        ]);
        
        setCategories(categoriesData);
        setSubscription(subscriptionData);
        
        // Se l'utente ha già categorie selezionate, le imposta
        if (subscriptionData && subscriptionData.user && subscriptionData.user.preferred_categories) {
          setSelectedCategories(
            subscriptionData.user.preferred_categories.map(cat => cat.id)
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Impossibile caricare i dati. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCategoryClick = (categoryId) => {
    setSelectedCategories(prev => {
      // Se la categoria è già selezionata, la rimuove
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      
      // Se l'utente ha raggiunto il limite, mostra un errore
      if (prev.length >= (subscription?.plan.categories_count || 0)) {
        setError(`Il tuo piano ti permette di selezionare al massimo ${subscription.plan.categories_count} categorie`);
        return prev;
      }
      
      // Altrimenti aggiunge la categoria
      setError('');
      return [...prev, categoryId];
    });
  };
  
  const handleSubmit = async () => {
    // Verifica se l'utente ha selezionato almeno una categoria
    if (selectedCategories.length === 0) {
      setError('Seleziona almeno una categoria');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await updateSubscriptionCategories(selectedCategories);
      navigate('/dashboard', { state: { message: 'Categorie aggiornate con successo!' } });
    } catch (error) {
      console.error('Error updating categories:', error);
      setError('Impossibile aggiornare le categorie. Riprova più tardi.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-text mb-4">Seleziona le tue categorie preferite</h1>
      
      {subscription && (
        <p className="text-gray-600 mb-8">
          Il tuo piano <span className="font-medium">{subscription.plan.name}</span> ti permette di selezionare fino a {' '}
          <span className="font-medium">{subscription.plan.categories_count} categorie</span>.
          Hai selezionato <span className="font-medium">{selectedCategories.length}/{subscription.plan.categories_count}</span>.
        </p>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {categories.map(category => (
          <div 
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              border rounded-lg overflow-hidden cursor-pointer transition-all
              ${selectedCategories.includes(category.id) 
                ? 'border-primary shadow-md transform scale-105' 
                : 'border-gray-200 hover:shadow-md'}
            `}
          >
            <div className="relative h-40 bg-gray-200">
              {category.image_url && (
                <img 
                  src={category.image_url} 
                  alt={category.name} 
                  className="w-full h-full object-cover"
                />
              )}
              
              {selectedCategories.includes(category.id) && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={submitting || selectedCategories.length === 0}
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Salvataggio in corso...' : 'Salva categorie'}
        </button>
      </div>
    </div>
  );
};

export default CategorySelection;