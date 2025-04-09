import api from './apiConfig';

// Ottieni tutte le categorie
export const getCategories = async () => {
  try {
    const response = await api.get('/products/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare le categorie');
  }
};

// Ottieni dettagli di una categoria specifica
export const getCategory = async (slug) => {
  try {
    const response = await api.get(`/products/categories/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i dettagli della categoria');
  }
};

// Ottieni tutti i design, opzionalmente filtrati per categoria
export const getDesigns = async (categoryId = null) => {
  try {
    const url = '/products/designs';
    const params = categoryId ? { category_id: categoryId } : {};
    
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching designs:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i design');
  }
};

// Vota per un design
export const voteForDesign = async (designId) => {
  try {
    const response = await api.post('/products/vote', { design_id: designId });
    return response.data;
  } catch (error) {
    console.error('Error voting for design:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || 'Errore durante il voto');
    }
    throw new Error('Impossibile votare per questo design');
  }
};

// Ottieni i design votati dall'utente
export const getUserVotes = async (categoryId = null) => {
  try {
    const url = '/products/my-votes';
    const params = categoryId ? { category_id: categoryId } : {};
    
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user votes:', error.response?.data || error.message);
    throw new Error('Impossibile recuperare i voti');
  }
};