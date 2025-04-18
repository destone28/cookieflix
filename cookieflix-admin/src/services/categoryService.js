// src/services/categoryService.js
import api, { fetchData, submitData } from './apiConfig';

// Dati simulati per test e sviluppo - mantenuti come fallback
const mockCategories = [
  {
    id: 1,
    name: "Serie TV e Film",
    slug: "serie-tv-film",
    description: "Design ispirati ai tuoi film e serie TV preferiti",
    image_url: "/images/categories/tv-film.jpg",
    is_active: true,
    designs_count: 24,
    created_at: "2023-05-15T10:30:00Z",
    updated_at: "2024-02-20T14:25:00Z"
  },
  {
    id: 2,
    name: "Videogiochi",
    slug: "videogiochi",
    description: "Personaggi e simboli dai videogiochi più amati",
    image_url: "/images/categories/videogiochi.jpg",
    is_active: true,
    designs_count: 18,
    created_at: "2023-05-16T11:20:00Z",
    updated_at: "2024-03-10T09:15:00Z"
  },
  {
    id: 3,
    name: "Feste Stagionali",
    slug: "feste-stagionali",
    description: "Design per ogni festività e stagione",
    image_url: "/images/categories/feste.jpg",
    is_active: true,
    designs_count: 30,
    created_at: "2023-05-17T09:45:00Z",
    updated_at: "2024-04-01T16:30:00Z"
  },
  {
    id: 4,
    name: "Animali e Creature",
    slug: "animali-creature",
    description: "Animali reali e creature fantastiche",
    image_url: "/images/categories/animali.jpg",
    is_active: false,
    designs_count: 15,
    created_at: "2023-06-01T14:20:00Z",
    updated_at: "2024-01-15T11:10:00Z"
  },
  {
    id: 5,
    name: "Architettura e Monumenti",
    slug: "architettura-monumenti",
    description: "Riproduzioni di edifici e monumenti famosi",
    image_url: "/images/categories/architettura.jpg",
    is_active: true,
    designs_count: 12,
    created_at: "2023-06-05T16:30:00Z",
    updated_at: "2024-02-28T13:45:00Z"
  }
];

// Mock stats data
const mockCategoryStats = {
  totalCategories: 8,
  activeCategories: 6,
  mostPopularCategories: [
    { id: 3, name: "Feste Stagionali", designs_count: 30, votes_count: 145 },
    { id: 1, name: "Serie TV e Film", designs_count: 24, votes_count: 112 },
    { id: 2, name: "Videogiochi", designs_count: 18, votes_count: 96 }
  ],
  monthlyTrends: [
    { month: "Gennaio", designsCreated: 5, totalVotes: 32 },
    { month: "Febbraio", designsCreated: 8, totalVotes: 47 },
    { month: "Marzo", designsCreated: 6, totalVotes: 39 },
    { month: "Aprile", designsCreated: 10, totalVotes: 65 }
  ]
};

/**
 * Simulazione di filtri e paginazione per dati mock
 * @private
 */
const _filterMockCategories = (params = {}) => {
  let filteredCategories = [...mockCategories];
  
  // Filtro per stato (attivo/inattivo)
  if (params.status === 'active') {
    filteredCategories = filteredCategories.filter(cat => cat.is_active);
  } else if (params.status === 'inactive') {
    filteredCategories = filteredCategories.filter(cat => !cat.is_active);
  }
  
  // Filtro per nome
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredCategories = filteredCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchLower) || 
      cat.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Ordinamento
  if (params.sortBy) {
    filteredCategories.sort((a, b) => {
      if (params.sortBy === 'name') {
        return params.sortDir === 'desc' 
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      if (params.sortBy === 'designs_count') {
        return params.sortDir === 'desc'
          ? b.designs_count - a.designs_count
          : a.designs_count - b.designs_count;
      }
      if (params.sortBy === 'created_at') {
        return params.sortDir === 'desc'
          ? new Date(b.created_at) - new Date(a.created_at)
          : new Date(a.created_at) - new Date(b.created_at);
      }
      return 0;
    });
  }
  
  // Simulazione paginazione
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + pageSize);
  
  return {
    categories: paginatedCategories,
    total: filteredCategories.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(filteredCategories.length / pageSize)
  };
};

/**
 * Ottiene la lista delle categorie con paginazione e filtri
 * @param {object} params - Parametri di filtro e paginazione (page, pageSize, status, search, sortBy, sortDir)
 * @returns {Promise<object>} - Dati delle categorie filtrate e paginate
 */
export const getCategories = async (params = {}) => {
  try {
    // Tenta di chiamare l'API reale
    return await fetchData('/admin/categories', { params });
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, usa i dati mock
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for categories');
      return _filterMockCategories(params);
    }
    
    throw error;
  }
};

/**
 * Ottiene i dettagli di una singola categoria tramite ID
 * @param {number|string} id - ID della categoria
 * @returns {Promise<object>} - Dati completi della categoria
 */
export const getCategoryById = async (id) => {
  try {
    return await fetchData(`/admin/categories/${id}`);
  } catch (error) {
    console.error(`Error fetching category ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, usa i dati mock
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for category details');
      const category = mockCategories.find(cat => cat.id === parseInt(id));
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    }
    
    throw error;
  }
};

/**
 * Crea una nuova categoria
 * @param {object} categoryData - Dati della categoria da creare
 * @returns {Promise<object>} - Dati della nuova categoria creata
 */
export const createCategory = async (categoryData) => {
  try {
    return await submitData('/admin/categories', categoryData, 'post');
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula la creazione
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for category creation');
      const newCategory = {
        id: mockCategories.length + 1,
        ...categoryData,
        designs_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockCategories.push(newCategory);
      return newCategory;
    }
    
    throw error;
  }
};

/**
 * Aggiorna i dati di una categoria esistente
 * @param {number|string} id - ID della categoria
 * @param {object} categoryData - Nuovi dati della categoria
 * @returns {Promise<object>} - Dati della categoria aggiornata
 */
export const updateCategory = async (id, categoryData) => {
  try {
    return await submitData(`/admin/categories/${id}`, categoryData, 'put');
  } catch (error) {
    console.error(`Error updating category ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'aggiornamento
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for category update');
      const categoryIndex = mockCategories.findIndex(cat => cat.id === parseInt(id));
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      const updatedCategory = {
        ...mockCategories[categoryIndex],
        ...categoryData,
        updated_at: new Date().toISOString()
      };
      
      mockCategories[categoryIndex] = updatedCategory;
      return updatedCategory;
    }
    
    throw error;
  }
};

/**
 * Elimina una categoria
 * @param {number|string} id - ID della categoria da eliminare
 * @returns {Promise<boolean>} - true se l'eliminazione è avvenuta con successo
 */
export const deleteCategory = async (id) => {
  try {
    await api.delete(`/admin/categories/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting category ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'eliminazione
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for category deletion');
      const categoryIndex = mockCategories.findIndex(cat => cat.id === parseInt(id));
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      mockCategories.splice(categoryIndex, 1);
      return true;
    }
    
    throw error;
  }
};

/**
 * Carica un'immagine per una categoria
 * @param {number|string} id - ID della categoria
 * @param {File} imageFile - File dell'immagine da caricare
 * @returns {Promise<object>} - URL dell'immagine caricata
 */
export const uploadCategoryImage = async (id, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/admin/categories/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading image for category ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'upload
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for category image upload');
      const categoryIndex = mockCategories.findIndex(cat => cat.id === parseInt(id));
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      // Simula un URL di immagine
      const fakeImageUrl = `/images/categories/upload-${Date.now()}.jpg`;
      
      mockCategories[categoryIndex] = {
        ...mockCategories[categoryIndex],
        image_url: fakeImageUrl,
        updated_at: new Date().toISOString()
      };
      
      return { image_url: fakeImageUrl };
    }
    
    throw error;
  }
};

/**
 * Ottiene le statistiche delle categorie
 * @returns {Promise<object>} - Statistiche sulle categorie
 */
export const getCategoryStats = async () => {
  try {
    return await fetchData('/admin/categories/stats');
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, usa i dati mock
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for category statistics');
      return mockCategoryStats;
    }
    
    throw error;
  }
};

/**
 * Attiva o disattiva una categoria
 * @param {number|string} id - ID della categoria
 * @param {boolean} isActive - Nuovo stato della categoria
 * @returns {Promise<object>} - Dati della categoria aggiornata
 */
export const toggleCategoryStatus = async (id, isActive) => {
  try {
    return await submitData(`/admin/categories/${id}/toggle-status`, { is_active: isActive }, 'put');
  } catch (error) {
    console.error(`Error toggling status for category ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula il toggle
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for category status toggle');
      const categoryIndex = mockCategories.findIndex(cat => cat.id === parseInt(id));
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      
      mockCategories[categoryIndex] = {
        ...mockCategories[categoryIndex],
        is_active: isActive,
        updated_at: new Date().toISOString()
      };
      
      return mockCategories[categoryIndex];
    }
    
    throw error;
  }
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getCategoryStats,
  toggleCategoryStatus
};