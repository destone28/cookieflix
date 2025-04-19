// src/components/common/ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo stato in modo che il prossimo render mostri l'UI di fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Puoi anche loggare l'errore in un servizio di reporting
    console.error("Caught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      // Puoi renderizzare qualsiasi UI di fallback
      if (fallback) {
        return fallback(error, errorInfo);
      }
      
      return (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Si è verificato un errore</h2>
          <p className="mb-4">Si è verificato un errore imprevisto nell'applicazione.</p>
          
          {showDetails && (
            <div className="mt-4">
              <details className="cursor-pointer">
                <summary className="font-medium text-red-700">Dettagli tecnici</summary>
                <div className="mt-2 p-4 bg-red-100 rounded overflow-auto text-sm font-mono">
                  <p>{error && error.toString()}</p>
                  <pre className="mt-2 text-xs">
                    {errorInfo && errorInfo.componentStack}
                  </pre>
                </div>
              </details>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
                >
                  Ricarica la pagina
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Se non ci sono errori, renderizza i children normalmente
    return children;
  }
}

export default ErrorBoundary;