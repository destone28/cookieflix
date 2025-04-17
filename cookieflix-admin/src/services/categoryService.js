// src/services/categoryService.js
import api from './apiConfig';

// Dati simulati per test e sviluppo
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

// Funzioni API reali
export const getCategories = async (params = {}) => {
  try {
    // Quando connettiamo alle API reali:
    // const response = await api.get('/categories', { params });
    // return response.data;
    
    // Per ora, simuliamo i filtri e la paginazione
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
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredCategories.length / pageSize)
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategoryById = async (id) => {
  try {
    // Quando connettiamo alle API reali:
    // const response = await api.get(`/categories/${id}`);
    // return response.data;
    
    const category = mockCategories.find(cat => cat.id === parseInt(id));
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  } catch (error) {
    console.error(`Error fetching category ID ${id}:`, error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    // Quando connettiamo alle API reali:
    // const response = await api.post('/categories', categoryData);
    // return response.data;
    
    // Simuliamo la creazione di una categoria
    const newCategory = {
      id: mockCategories.length + 1,
      ...categoryData,
      designs_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockCategories.push(newCategory);
    return newCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    // Quando connettiamo alle API reali:
    // const response = await api.put(`/categories/${id}`, categoryData);
    // return response.data;
    
    // Simuliamo l'aggiornamento di una categoria
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
  } catch (error) {
    console.error(`Error updating category ID ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    // Quando connettiamo alle API reali:
    // await api.delete(`/categories/${id}`);
    // return true;
    
    // Simuliamo l'eliminazione di una categoria
    const categoryIndex = mockCategories.findIndex(cat => cat.id === parseInt(id));
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    mockCategories.splice(categoryIndex, 1);
    return true;
  } catch (error) {
    console.error(`Error deleting category ID ${id}:`, error);
    throw error;
  }
};

export const uploadCategoryImage = async (id, imageFile) => {
  try {
    // Quando connettiamo alle API reali:
    // const formData = new FormData();
    // formData.append('image', imageFile);
    // const response = await api.post(`/categories/${id}/image`, formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // });
    // return response.data;
    
    // Per ora, simuliamo l'upload
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
  } catch (error) {
    console.error(`Error uploading image for category ID ${id}:`, error);
    throw error;
  }
};

export const getCategoryStats = async () => {
  try {
    // Quando connettiamo alle API reali:
    // const response = await api.get('/categories/stats');
    // return response.data;
    
    // Per ora, restituiamo statistiche simulate
    return mockCategoryStats;
  } catch (error) {
    console.error('Error fetching category statistics:', error);
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
  getCategoryStats
};