// src/pages/Catalog.jsx (aggiornato)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCategories, getDesigns, voteForDesign, getUserVotes } from '../services/productService';

const Catalog = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [userVotedDesigns, setUserVotedDesigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [designsPerPage] = useState(12);
  
  // Design dettaglio e voto
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [voteError, setVoteError] = useState('');

  // Carica categorie, design e voti dell'utente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Carica dati in parallelo
        const [categoriesData, designsData, votesData] = await Promise.all([
          getCategories(),
          getDesigns(),
          isAuthenticated ? getUserVotes().catch(() => []) : Promise.resolve([])
        ]);
        
        // Formatta categorie con conteggio
        const formattedCategories = categoriesData.map(category => {
          const count = designsData.filter(design => 
            design.category_id === category.id
          ).length;
          
          return {
            ...category,
            count
          };
        });
        
        // Identifica design già votati dall'utente
        const votedDesignIds = votesData.map(design => design.id);
        
        // Formatta i design con indicatore di voto
        const formattedDesigns = designsData.map(design => {
          return {
            ...design,
            hasVoted: votedDesignIds.includes(design.id)
          };
        });
        
        setCategories(formattedCategories);
        setDesigns(formattedDesigns);
        setUserVotedDesigns(votedDesignIds);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        toast.showError('Errore nel caricamento del catalogo');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, toast]);

  // Filtra e ordina i design quando cambiano i filtri
  useEffect(() => {
    if (designs.length === 0) return;
    
    let filtered = [...designs];
    
    // Filtra per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(design => {
        const categorySlug = categories.find(c => c.id === design.category_id)?.slug;
        return categorySlug === selectedCategory;
      });
    }
    
    // Ordina
    switch (sortOrder) {
      case 'popular':
        filtered.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredDesigns(filtered);
    setCurrentPage(1); // Reset alla prima pagina quando cambiano i filtri
  }, [designs, selectedCategory, sortOrder, categories]);

  // Aggiorna i parametri URL quando cambia la categoria
  useEffect(() => {
    if (selectedCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', selectedCategory);
    }
    setSearchParams(searchParams);
  }, [selectedCategory, searchParams, setSearchParams]);

  // Calcola paginazione
  const indexOfLastDesign = currentPage * designsPerPage;
  const indexOfFirstDesign = indexOfLastDesign - designsPerPage;
  const currentDesigns = filteredDesigns.slice(indexOfFirstDesign, indexOfLastDesign);
  const totalPages = Math.ceil(filteredDesigns.length / designsPerPage);

  // Cambia pagina
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Gestisce il cambio categoria
  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
  };

  // Gestisce il cambio ordinamento
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Gestisce il cambio visualizzazione
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
  };

  // Apre il modal con i dettagli del design
  const openDesignModal = (design) => {
    setSelectedDesign(design);
    setIsModalOpen(true);
    setVoteSuccess(false);
    setVoteError('');
  };

  // Chiude il modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDesign(null);
  };

  // Gestisce il voto
  const handleVote = async () => {
    if (!isAuthenticated) {
      setVoteError('Devi accedere per votare i design');
      return;
    }
    
    if (!selectedDesign) return;
    
    // Verifica se l'utente ha già votato questo design
    if (selectedDesign.hasVoted) {
      setVoteError('Hai già votato per questo design');
      return;
    }
    
    setIsVoting(true);
    setVoteError('');
    
    try {
      // Chiamata API per votare
      await voteForDesign(selectedDesign.id);
      
      // Aggiorna i dati locali
      const updatedDesigns = designs.map(design => {
        if (design.id === selectedDesign.id) {
          return {
            ...design,
            votes_count: (design.votes_count || 0) + 1,
            hasVoted: true
          };
        }
        return design;
      });
      
      setDesigns(updatedDesigns);
      setSelectedDesign({
        ...selectedDesign,
        votes_count: (selectedDesign.votes_count || 0) + 1,
        hasVoted: true
      });
      
      setVoteSuccess(true);
      toast.showSuccess('Voto registrato con successo!');
    } catch (error) {
      console.error('Vote error:', error);
      setVoteError(error.message || 'Errore durante il voto');
    } finally {
      setIsVoting(false);
    }
  };

  // Formatta data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  // Ottieni il nome della categoria
  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  // Mostra loading
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-700">Caricamento catalogo...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-bg min-h-screen pb-12">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Esplora il Catalogo</h1>
          <p className="mt-2">
            Sfoglia e vota i tuoi design preferiti per i prossimi cookie cutters
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar con filtri */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Categorie</h2>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left py-2 px-3 rounded-md transition ${
                      selectedCategory === 'all' 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Tutte le categorie
                    <span className="ml-2 text-sm">{designs.length}</span>
                  </button>
                </li>
                {categories.map(category => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full text-left py-2 px-3 rounded-md transition ${
                        selectedCategory === category.slug 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                      <span className="ml-2 text-sm">{category.count}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Ordina per</h2>
                <select
                  value={sortOrder}
                  onChange={handleSortChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="popular">Più popolari</option>
                  <option value="newest">Più recenti</option>
                  <option value="oldest">Meno recenti</option>
                  <option value="alphabetical">Alfabetico</option>
                </select>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Visualizzazione</h2>
                <button
                  onClick={toggleViewMode}
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  {viewMode === 'grid' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Vista Lista
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Vista Griglia
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Contenuto principale */}
          <div className="md:w-3/4">
            {/* Risultati e statistiche */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filteredDesigns.length} risultati
                {selectedCategory !== 'all' && (
                  <span> in {categories.find(c => c.slug === selectedCategory)?.name || ''}</span>
                )}
              </h2>
              <div className="text-sm text-gray-500">
                Pagina {currentPage} di {totalPages}
              </div>
            </div>

            {/* Design in modalità griglia o lista */}
            {filteredDesigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-lg mb-4">Nessun design trovato in questa categoria.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentDesigns.map((design) => (
                  <div 
                    key={design.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => openDesignModal(design)}
                  >
                    <div className="relative">
                      <img 
                        src={design.image_url || `https://placehold.co/400x400?text=${encodeURIComponent(design.name)}`}
                        alt={design.name} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <span className="text-xs text-white font-medium">{getCategoryName(design.category_id)}</span>
                      </div>
                      {design.hasVoted && (
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs py-1 px-2 rounded-full">
                          Votato
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-1">{design.name}</h3>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{design.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {formatDate(design.created_at)}
                        </span>
                        <div className="flex items-center text-sm font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {design.votes_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentDesigns.map((design) => (
                  <div 
                    key={design.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => openDesignModal(design)}
                  >
                    <div className="flex">
                      <img 
                        src={design.image_url || `https://placehold.co/300x300?text=${encodeURIComponent(design.name)}`} 
                        alt={design.name} 
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
                      />
                      <div className="p-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold">{design.name}</h3>
                            <span className="text-xs text-gray-500">{getCategoryName(design.category_id)}</span>
                          </div>
                          <div className="flex items-center">
                            {design.hasVoted && (
                              <span className="bg-primary text-white text-xs py-1 px-2 rounded-full mr-2">
                                Votato
                              </span>
                            )}
                            <div className="flex items-center text-sm font-medium">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              {design.votes_count || 0}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                          {design.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-600">
                          {formatDate(design.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginazione */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Precedente
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Mostra al massimo 5 pagine con la pagina corrente al centro
                    const maxPages = 5;
                    const pageWindow = Math.floor(maxPages / 2);
                    let startPage = Math.max(1, currentPage - pageWindow);
                    let endPage = Math.min(startPage + maxPages - 1, totalPages);
                    
                    if (endPage - startPage + 1 < maxPages) {
                      startPage = Math.max(1, endPage - maxPages + 1);
                    }
                    
                    const pageNumber = startPage + i;
                    if (pageNumber > endPage) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                          pageNumber === currentPage
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Successiva
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal design dettagli */}
      {isModalOpen && selectedDesign && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900" id="modal-title">
                        {selectedDesign.name}
                      </h3>
                      <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/2">
                        <img 
                          src={selectedDesign.image_url || `https://placehold.co/600x600?text=${encodeURIComponent(selectedDesign.name)}`} 
                          alt={selectedDesign.name} 
                          className="w-full rounded-lg h-64 object-contain bg-gray-100"
                        />
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="bg-secondary bg-opacity-10 text-secondary text-xs py-1 px-2 rounded-full">
                              {getCategoryName(selectedDesign.category_id)}
                            </span>
                            <span className="text-sm text-gray-500 ml-3">
                              {formatDate(selectedDesign.created_at)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {selectedDesign.votes_count || 0} voti
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-1/2">
                        <h4 className="text-lg font-bold mb-2">Descrizione</h4>
                        <p className="text-gray-700 mb-6">
                          {selectedDesign.description}
                        </p>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-lg font-bold mb-4">Vota per questo design</h4>
                          
                          {voteSuccess ? (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-green-700">Voto registrato con successo!</p>
                                </div>
                              </div>
                            </div>
                          ) : voteError ? (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-red-700">{voteError}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-600 mb-4 text-sm">
                              Solo gli utenti abbonati possono votare. Ogni utente può votare fino a 3 design per categoria al mese.
                            </p>
                          )}
                          
                          {!isAuthenticated ? (
                            <div className="text-center">
                              <p className="mb-2 text-sm text-gray-600">Devi accedere per votare</p>
                              <div className="flex space-x-2">
                                <a href="/login" className="flex-1 bg-primary text-white py-2 px-4 rounded font-medium hover:bg-opacity-90 text-center">
                                  Accedi
                                </a>
                                <a href="/register" className="flex-1 border border-primary text-primary py-2 px-4 rounded font-medium hover:bg-primary hover:text-white text-center">
                                  Registrati
                                </a>
                              </div>
                            </div>
                          ) : selectedDesign.hasVoted ? (
                            <button
                              disabled
                              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 opacity-50 cursor-not-allowed"
                            >
                              Hai già votato questo design
                            </button>
                          ) : (
                            <button
                              onClick={handleVote}
                              disabled={isVoting || voteSuccess}
                              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isVoting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Votazione in corso...
                                </>
                              ) : voteSuccess ? (
                                'Voto registrato!'
                              ) : (
                                'Vota questo design'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;