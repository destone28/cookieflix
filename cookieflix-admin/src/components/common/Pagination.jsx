// src/components/common/Pagination.jsx
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPage
}) => {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Genera un array di numeri di pagina da mostrare
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pagesToShow = [];
    
    // Aggiungi la prima pagina
    if (currentPage > 2) {
      pagesToShow.push(1);
    }
    
    // Aggiungi le pagine intorno alla pagina corrente
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    
    // Aggiusta i limiti per mostrare sempre 3 pagine (se possibile)
    if (startPage === 1) {
      endPage = Math.min(totalPages, 3);
    }
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - 2);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }
    
    // Aggiungi l'ultima pagina
    if (currentPage < totalPages - 1) {
      pagesToShow.push(totalPages);
    }
    
    return pagesToShow;
  };

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Mobile view */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Precedente
        </button>
        <span className="relative z-0 inline-flex shadow-sm rounded-md">
          <p className="text-sm text-gray-700 py-2">
            Pagina <span className="font-medium">{currentPage}</span> di{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Successiva
        </button>
      </div>
      
      {/* Desktop view */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Visualizzazione{' '}
            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
            {' - '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)}
            </span>
            {' di '}
            <span className="font-medium">{totalPages * itemsPerPage}</span> risultati
          </p>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value={5}>5 per pagina</option>
              <option value={10}>10 per pagina</option>
              <option value={25}>25 per pagina</option>
              <option value={50}>50 per pagina</option>
            </select>
          </div>
          
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Precedente</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {getPageNumbers().map((pageNumber, index, array) => {
              // Se c'è un gap tra i numeri di pagina, mostra un ellipsis
              const showEllipsis = index > 0 && pageNumber > array[index - 1] + 1;
              
              return (
                <span key={pageNumber}>
                  {showEllipsis && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-primary border-primary text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                </span>
              );
            })}
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Successiva</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;