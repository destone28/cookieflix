// src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo stato per il prossimo render
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puoi anche logare l'errore
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Puoi renderizzare qualsiasi UI di fallback
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Qualcosa è andato storto</h2>
            
            <p className="text-gray-600 mb-6">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina o torna alla home.
            </p>
            
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Ricarica
              </button>
              <a
                href="/"
                className="text-primary hover:underline"
              >
                Torna alla home
              </a>
            </div>
            
            {this.props.showDetails && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md text-left overflow-auto max-h-40">
                <p className="text-sm text-gray-700">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Stack:</strong> {this.state.errorInfo?.componentStack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;