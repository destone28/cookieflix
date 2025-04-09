const Loader = ({ size = 'medium', center = false }) => {
    // Determina le dimensioni in base al parametro
    const getSizeClasses = () => {
      switch (size) {
        case 'small':
          return 'h-6 w-6 border-2';
        case 'large':
          return 'h-16 w-16 border-[3px]';
        case 'medium':
        default:
          return 'h-12 w-12 border-t-2 border-b-2';
      }
    };
  
    // Contenitore principale
    const loaderClasses = `
      animate-spin rounded-full ${getSizeClasses()} border-primary
    `;
  
    // Se il loader deve essere centrato
    if (center) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className={loaderClasses}></div>
        </div>
      );
    }
  
    return <div className={loaderClasses}></div>;
  };
  
  export default Loader;