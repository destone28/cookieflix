// src/services/designService.js
import api, { fetchData, submitData } from './apiConfig';

// Dati simulati per test e sviluppo - mantenuti come fallback
const mockDesigns = [
  {
    id: 1,
    name: "Spada Laser",
    description: "Ispirata alla famosa saga spaziale, perfetto per i fan della trilogia originale.",
    category_id: 1,
    category_name: "Serie TV e Film",
    image_url: "/images/designs/spada-laser-main.jpg",
    additional_images: [
      "/images/designs/spada-laser-alt1.jpg",
      "/images/designs/spada-laser-alt2.jpg"
    ],
    model_url: "/models/spada-laser.stl",
    is_active: true,
    votes_count: 32,
    created_at: "2023-07-15T10:30:00Z",
    updated_at: "2024-03-20T14:25:00Z"
  },
  {
    id: 2,
    name: "Cappello dello Stregone",
    description: "Dal mondo magico del giovane mago, con dettagli accurati e facile da usare.",
    category_id: 1,
    category_name: "Serie TV e Film",
    image_url: "/images/designs/cappello-stregone-main.jpg",
    additional_images: [
      "/images/designs/cappello-stregone-alt1.jpg",
      "/images/designs/cappello-stregone-alt2.jpg"
    ],
    model_url: "/models/cappello-stregone.stl",
    is_active: true,
    votes_count: 28,
    created_at: "2023-08-05T11:45:00Z",
    updated_at: "2024-02-18T09:30:00Z"
  },
  {
    id: 3,
    name: "Fungo Power-Up",
    description: "Il classico fungo che ti fa crescere, perfetto per i cookie a tema videogiochi retro.",
    category_id: 2,
    category_name: "Videogiochi",
    image_url: "/images/designs/fungo-main.jpg",
    additional_images: [
      "/images/designs/fungo-alt1.jpg",
      "/images/designs/fungo-alt2.jpg"
    ],
    model_url: "/models/fungo.stl",
    is_active: true,
    votes_count: 45,
    created_at: "2023-06-20T09:15:00Z",
    updated_at: "2024-01-10T16:20:00Z"
  },
  {
    id: 4,
    name: "Controller Retro",
    description: "Controller della console anni '90, nostalgico e con ottimi dettagli.",
    category_id: 2,
    category_name: "Videogiochi",
    image_url: "/images/designs/controller-main.jpg",
    additional_images: [
      "/images/designs/controller-alt1.jpg",
      "/images/designs/controller-alt2.jpg"
    ],
    model_url: "/models/controller.stl",
    is_active: false,
    votes_count: 15,
    created_at: "2023-09-12T14:50:00Z",
    updated_at: "2024-02-25T11:35:00Z"
  },
  {
    id: 5,
    name: "Albero di Natale Dettagliato",
    description: "Albero con decorazioni in rilievo, perfetto per i biscotti natalizi.",
    category_id: 3,
    category_name: "Feste Stagionali",
    image_url: "/images/designs/albero-natale-main.jpg",
    additional_images: [
      "/images/designs/albero-natale-alt1.jpg",
      "/images/designs/albero-natale-alt2.jpg"
    ],
    model_url: "/models/albero-natale.stl",
    is_active: true,
    votes_count: 52,
    created_at: "2023-10-30T10:00:00Z",
    updated_at: "2024-04-05T09:40:00Z"
  },
  {
    id: 6,
    name: "Gatto Elegante",
    description: "Silhouette di un gatto elegante, con dettagli delle orecchie e dei baffi ben definiti.",
    category_id: 4,
    category_name: "Animali e Creature",
    image_url: "/images/designs/gatto-main.jpg",
    additional_images: [
      "/images/designs/gatto-alt1.jpg",
      "/images/designs/gatto-alt2.jpg"
    ],
    model_url: "/models/gatto.stl",
    is_active: true,
    votes_count: 37,
    created_at: "2023-11-15T15:20:00Z",
    updated_at: "2024-03-12T12:15:00Z"
  },
  {
    id: 7,
    name: "Torre Eiffel",
    description: "Riproduzione dettagliata della famosa torre parigina, ottima per biscotti a tema viaggio.",
    category_id: 5,
    category_name: "Architettura e Monumenti",
    image_url: "/images/designs/torre-eiffel-main.jpg",
    additional_images: [
      "/images/designs/torre-eiffel-alt1.jpg",
      "/images/designs/torre-eiffel-alt2.jpg"
    ],
    model_url: "/models/torre-eiffel.stl",
    is_active: true,
    votes_count: 23,
    created_at: "2023-12-05T09:35:00Z",
    updated_at: "2024-02-28T14:40:00Z"
  }
];

// Mock stats data
const mockDesignStats = {
  totalDesigns: 18,
  activeDesigns: 15,
  totalVotes: 426,
  mostVotedDesigns: [
    { id: 5, name: "Albero di Natale Dettagliato", category_name: "Feste Stagionali", votes_count: 52 },
    { id: 3, name: "Fungo Power-Up", category_name: "Videogiochi", votes_count: 45 },
    { id: 6, name: "Gatto Elegante", category_name: "Animali e Creature", votes_count: 37 }
  ],
  designsPerCategory: [
    { category_name: "Serie TV e Film", designs_count: 5 },
    { category_name: "Videogiochi", designs_count: 4 },
    { category_name: "Feste Stagionali", designs_count: 6 },
    { category_name: "Animali e Creature", designs_count: 2 },
    { category_name: "Architettura e Monumenti", designs_count: 1 }
  ],
  monthlyVotes: [
    { month: "Gennaio", votes: 42 },
    { month: "Febbraio", votes: 58 },
    { month: "Marzo", votes: 65 },
    { month: "Aprile", votes: 70 }
  ]
};

/**
 * Simulazione di filtri e paginazione per dati mock
 * @private
 */
const _filterMockDesigns = (params = {}) => {
  let filteredDesigns = [...mockDesigns];
  
  // Filtro per stato (attivo/inattivo)
  if (params.status === 'active') {
    filteredDesigns = filteredDesigns.filter(design => design.is_active);
  } else if (params.status === 'inactive') {
    filteredDesigns = filteredDesigns.filter(design => !design.is_active);
  }
  
  // Filtro per categoria
  if (params.category_id) {
    filteredDesigns = filteredDesigns.filter(design => 
      design.category_id === parseInt(params.category_id)
    );
  }
  
  // Filtro per nome o descrizione
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredDesigns = filteredDesigns.filter(design => 
      design.name.toLowerCase().includes(searchLower) || 
      design.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Ordinamento
  if (params.sortBy) {
    filteredDesigns.sort((a, b) => {
      if (params.sortBy === 'name') {
        return params.sortDir === 'desc' 
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      if (params.sortBy === 'votes_count') {
        return params.sortDir === 'desc'
          ? b.votes_count - a.votes_count
          : a.votes_count - b.votes_count;
      }
      if (params.sortBy === 'created_at') {
        return params.sortDir === 'desc'
          ? new Date(b.created_at) - new Date(a.created_at)
          : new Date(a.created_at) - new Date(b.created_at);
      }
      if (params.sortBy === 'category') {
        return params.sortDir === 'desc'
          ? b.category_name.localeCompare(a.category_name)
          : a.category_name.localeCompare(b.category_name);
      }
      return 0;
    });
  }
  
  // Simulazione paginazione
  const page = parseInt(params.page) || 1;
  const pageSize = parseInt(params.pageSize) || 10;
  const startIndex = (page - 1) * pageSize;
  const paginatedDesigns = filteredDesigns.slice(startIndex, startIndex + pageSize);
  
  return {
    designs: paginatedDesigns,
    total: filteredDesigns.length,
    page: page,
    pageSize: pageSize,
    totalPages: Math.ceil(filteredDesigns.length / pageSize)
  };
};

/**
 * Ottiene la lista dei design con paginazione e filtri
 * @param {object} params - Parametri di filtro e paginazione (page, pageSize, status, category_id, search, sortBy, sortDir)
 * @returns {Promise<object>} - Dati dei design filtrati e paginati
 */
export const getDesigns = async (params = {}) => {
  try {
    // Tenta di chiamare l'API reale
    return await fetchData('/admin/designs', { params });
  } catch (error) {
    console.error('Error fetching designs:', error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, usa i dati mock
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for designs');
      return _filterMockDesigns(params);
    }
    
    throw error;
  }
};

/**
 * Ottiene i dettagli di un singolo design tramite ID
 * @param {number|string} id - ID del design
 * @returns {Promise<object>} - Dati completi del design
 */
export const getDesignById = async (id) => {
  try {
    return await fetchData(`/admin/designs/${id}`);
  } catch (error) {
    console.error(`Error fetching design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, usa i dati mock
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design details');
      const design = mockDesigns.find(design => design.id === parseInt(id));
      if (!design) {
        throw new Error('Design not found');
      }
      return design;
    }
    
    throw error;
  }
};

/**
 * Crea un nuovo design
 * @param {object} designData - Dati del design da creare
 * @returns {Promise<object>} - Dati del nuovo design creato
 */
export const createDesign = async (designData) => {
  try {
    return await submitData('/admin/designs', designData, 'post');
  } catch (error) {
    console.error('Error creating design:', error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula la creazione
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design creation');
      
      const newDesign = {
        id: mockDesigns.length + 1,
        ...designData,
        additional_images: designData.additional_images || [],
        votes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Aggiungiamo il nome della categoria
      const categoryNames = {
        1: "Serie TV e Film",
        2: "Videogiochi",
        3: "Feste Stagionali",
        4: "Animali e Creature",
        5: "Architettura e Monumenti"
      };
      
      newDesign.category_name = categoryNames[newDesign.category_id] || "Categoria Sconosciuta";
      
      mockDesigns.push(newDesign);
      return newDesign;
    }
    
    throw error;
  }
};

/**
 * Aggiorna i dati di un design esistente
 * @param {number|string} id - ID del design
 * @param {object} designData - Nuovi dati del design
 * @returns {Promise<object>} - Dati del design aggiornato
 */
export const updateDesign = async (id, designData) => {
  try {
    return await submitData(`/admin/designs/${id}`, designData, 'put');
  } catch (error) {
    console.error(`Error updating design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'aggiornamento
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design update');
      
      const designIndex = mockDesigns.findIndex(design => design.id === parseInt(id));
      if (designIndex === -1) {
        throw new Error('Design not found');
      }
      
      const updatedDesign = {
        ...mockDesigns[designIndex],
        ...designData,
        updated_at: new Date().toISOString()
      };
      
      // Aggiorniamo il nome della categoria se la categoria è cambiata
      if (designData.category_id && designData.category_id !== mockDesigns[designIndex].category_id) {
        const categoryNames = {
          1: "Serie TV e Film",
          2: "Videogiochi",
          3: "Feste Stagionali",
          4: "Animali e Creature",
          5: "Architettura e Monumenti"
        };
        
        updatedDesign.category_name = categoryNames[designData.category_id] || "Categoria Sconosciuta";
      }
      
      mockDesigns[designIndex] = updatedDesign;
      return updatedDesign;
    }
    
    throw error;
  }
};

/**
 * Elimina un design
 * @param {number|string} id - ID del design da eliminare
 * @returns {Promise<boolean>} - true se l'eliminazione è avvenuta con successo
 */
export const deleteDesign = async (id) => {
  try {
    await api.delete(`/admin/designs/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'eliminazione
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design deletion');
      
      const designIndex = mockDesigns.findIndex(design => design.id === parseInt(id));
      if (designIndex === -1) {
        throw new Error('Design not found');
      }
      
      mockDesigns.splice(designIndex, 1);
      return true;
    }
    
    throw error;
  }
};

/**
 * Carica l'immagine principale di un design
 * @param {number|string} id - ID del design
 * @param {File} imageFile - File dell'immagine da caricare
 * @returns {Promise<object>} - URL dell'immagine caricata
 */
export const uploadDesignMainImage = async (id, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/admin/designs/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading main image for design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'upload
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design image upload');
      
      const designIndex = mockDesigns.findIndex(design => design.id === parseInt(id));
      if (designIndex === -1) {
        throw new Error('Design not found');
      }
      
      // Simula un URL di immagine
      const fakeImageUrl = `/images/designs/upload-main-${Date.now()}.jpg`;
      
      mockDesigns[designIndex] = {
        ...mockDesigns[designIndex],
        image_url: fakeImageUrl,
        updated_at: new Date().toISOString()
      };
      
      return { image_url: fakeImageUrl };
    }
    
    throw error;
  }
};

/**
 * Carica un'immagine aggiuntiva per un design
 * @param {number|string} id - ID del design
 * @param {File} imageFile - File dell'immagine da caricare
 * @param {number} index - Indice dell'immagine (opzionale, per sostituire un'immagine esistente)
 * @returns {Promise<object>} - URL dell'immagine caricata e indice
 */
export const uploadDesignAdditionalImage = async (id, imageFile, index) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (index !== undefined) {
      formData.append('index', index);
    }
    
    const response = await api.post(`/admin/designs/${id}/additional-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading additional image for design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'upload
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for additional image upload');
      
      const designIndex = mockDesigns.findIndex(design => design.id === parseInt(id));
      if (designIndex === -1) {
        throw new Error('Design not found');
      }
      
      // Simula un URL di immagine
      const fakeImageUrl = `/images/designs/upload-additional-${index}-${Date.now()}.jpg`;
      
      const additionalImages = [...(mockDesigns[designIndex].additional_images || [])];
      
      // Se l'indice è valido, aggiorniamo l'immagine esistente
      if (index >= 0 && index < additionalImages.length) {
        additionalImages[index] = fakeImageUrl;
      } else {
        // Altrimenti, aggiungiamo una nuova immagine
        additionalImages.push(fakeImageUrl);
      }
      
      mockDesigns[designIndex] = {
        ...mockDesigns[designIndex],
        additional_images: additionalImages,
        updated_at: new Date().toISOString()
      };
      
      return { 
        image_url: fakeImageUrl, 
        index: index < additionalImages.length - 1 ? index : additionalImages.length - 1 
      };
    }
    
    throw error;
  }
};

/**
 * Carica il modello 3D di un design
 * @param {number|string} id - ID del design
 * @param {File} modelFile - File del modello 3D da caricare (STL)
 * @returns {Promise<object>} - URL del modello caricato
 */
export const uploadDesignModel = async (id, modelFile) => {
  try {
    const formData = new FormData();
    formData.append('model', modelFile);
    
    const response = await api.post(`/admin/designs/${id}/model`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading model for design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula l'upload
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for model upload');
      
      const designIndex = mockDesigns.findIndex(design => design.id === parseInt(id));
      if (designIndex === -1) {
        throw new Error('Design not found');
      }
      
      // Simula un URL del modello
      const fakeModelUrl = `/models/upload-${Date.now()}.stl`;
      
      mockDesigns[designIndex] = {
        ...mockDesigns[designIndex],
        model_url: fakeModelUrl,
        updated_at: new Date().toISOString()
      };
      
      return { model_url: fakeModelUrl };
    }
    
    throw error;
  }
};

/**
 * Ottiene le statistiche dei design
 * @returns {Promise<object>} - Statistiche sui design
 */
export const getDesignStats = async () => {
  try {
    return await fetchData('/admin/designs/stats');
  } catch (error) {
    console.error('Error fetching design statistics:', error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, usa i dati mock
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design statistics');
      return mockDesignStats;
    }
    
    throw error;
  }
};

/**
 * Ottiene i voti di un design
 * @param {number|string} id - ID del design
 * @param {object} params - Parametri di paginazione (page, pageSize)
 * @returns {Promise<object>} - Voti del design paginati
 */
export const getDesignVotes = async (id, params = {}) => {
  try {
    return await fetchData(`/admin/designs/${id}/votes`, { params });
  } catch (error) {
    console.error(`Error fetching votes for design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, usa i dati mock
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design votes');
      
      // Simuliamo i voti per un design
      const mockVotes = [];
      const votesCount = mockDesigns.find(d => d.id === parseInt(id))?.votes_count || 0;
      
      for (let i = 0; i < votesCount; i++) {
        mockVotes.push({
          id: i + 1,
          user_id: 1000 + i,
          user_name: `Utente ${1000 + i}`,
          design_id: parseInt(id),
          created_at: new Date(Date.now() - i * 86400000).toISOString() // Ogni voto è un giorno prima
        });
      }
      
      // Simulazione paginazione
      const page = parseInt(params.page) || 1;
      const pageSize = parseInt(params.pageSize) || 10;
      const startIndex = (page - 1) * pageSize;
      const paginatedVotes = mockVotes.slice(startIndex, startIndex + pageSize);
      
      return {
        votes: paginatedVotes,
        total: mockVotes.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(mockVotes.length / pageSize)
      };
    }
    
    throw error;
  }
};

/**
 * Attiva o disattiva un design
 * @param {number|string} id - ID del design
 * @param {boolean} isActive - Nuovo stato del design
 * @returns {Promise<object>} - Dati del design aggiornato
 */
export const toggleDesignStatus = async (id, isActive) => {
  try {
    return await submitData(`/admin/designs/${id}/toggle-status`, { is_active: isActive }, 'put');
  } catch (error) {
    console.error(`Error toggling status for design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula il toggle
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for design status toggle');
      
      const designIndex = mockDesigns.findIndex(design => design.id === parseInt(id));
      if (designIndex === -1) {
        throw new Error('Design not found');
      }
      
      mockDesigns[designIndex] = {
        ...mockDesigns[designIndex],
        is_active: isActive,
        updated_at: new Date().toISOString()
      };
      
      return mockDesigns[designIndex];
    }
    
    throw error;
  }
};

/**
 * Rimuove un'immagine aggiuntiva di un design
 * @param {number|string} id - ID del design
 * @param {number} index - Indice dell'immagine da rimuovere
 * @returns {Promise<object>} - Dati del design aggiornato
 */
export const removeAdditionalImage = async (id, index) => {
  try {
    return await api.delete(`/admin/designs/${id}/additional-image/${index}`);
  } catch (error) {
    console.error(`Error removing additional image at index ${index} for design ID ${id}:`, error);
    
    // Se siamo in sviluppo e l'API non esiste o ha errori, simula la rimozione
    if (process.env.NODE_ENV !== 'production' && 
        (error.response?.status === 404 || error.response?.status >= 500)) {
      console.warn('Using mock data for removing additional image');
      
      const designIndex = mockDesigns.findIndex(design => design.id === parseInt(id));
      if (designIndex === -1) {
        throw new Error('Design not found');
      }
      
      const additionalImages = [...(mockDesigns[designIndex].additional_images || [])];
      
      if (index >= 0 && index < additionalImages.length) {
        additionalImages.splice(index, 1);
        
        mockDesigns[designIndex] = {
          ...mockDesigns[designIndex],
          additional_images: additionalImages,
          updated_at: new Date().toISOString()
        };
        
        return { success: true };
      } else {
        throw new Error('Image index out of range');
      }
    }
    
    throw error;
  }
};

export default {
  getDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  deleteDesign,
  uploadDesignMainImage,
  uploadDesignAdditionalImage,
  uploadDesignModel,
  getDesignStats,
  getDesignVotes,
  toggleDesignStatus,
  removeAdditionalImage
};