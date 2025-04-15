// src/components/FacebookLoginButton.jsx
import { useEffect, useState } from 'react';

const FacebookLoginButton = ({ onLoginSuccess, onLoginError }) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isButtonRendered, setIsButtonRendered] = useState(false);

  useEffect(() => {
    // Funzione per inizializzare l'SDK solo se non è già stato inizializzato
    const initializeFacebookSDK = () => {
      return new Promise((resolve) => {
        // Se FB è già definito e inizializzato, risolviamo subito
        if (window.FB) {
          console.log('Facebook SDK già disponibile');
          setIsSDKLoaded(true);
          resolve();
          return;
        }

        // Altrimenti, configura fbAsyncInit e carica lo script
        window.fbAsyncInit = function() {
          window.FB.init({
            appId: '1045628904098752', // Il tuo App ID
            cookie: true,
            xfbml: false, // Importante: impostalo a false, lo faremo manualmente
            version: 'v16.0'
          });
          
          console.log('Facebook SDK inizializzato');
          setIsSDKLoaded(true);
          resolve();
        };

        // Carica lo script Facebook SDK
        const loadScript = () => {
          if (document.getElementById('facebook-jssdk')) {
            return;
          }
          
          const script = document.createElement('script');
          script.id = 'facebook-jssdk';
          script.src = 'https://connect.facebook.net/it_IT/sdk.js';
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
          console.log('Script Facebook SDK caricato');
        };

        loadScript();
      });
    };

    initializeFacebookSDK();
  }, []);

  // Definiamo la funzione di callback per il login
  useEffect(() => {
    window.processLogin = (response) => {
      console.log('Risposta login Facebook:', response);
      if (response.status === 'connected') {
        onLoginSuccess && onLoginSuccess(response.authResponse.accessToken);
      } else {
        onLoginError && onLoginError('Login Facebook annullato o fallito');
      }
    };
  }, [onLoginSuccess, onLoginError]);

  // Implementiamo una funzione manuale di login come backup
  const handleManualLogin = () => {
    if (!window.FB) {
      console.error('Facebook SDK non caricato');
      return;
    }

    window.FB.login(function(response) {
      window.processLogin(response);
    }, {scope: 'email,public_profile'});
  };

  return (
    <div className="w-full">
      {/* Contenitore per il pulsante Facebook standard */}
      <div id="fb-login-container">
        <div 
          className="fb-login-button" 
          data-width="100%" 
          data-size="large" 
          data-button-type="continue_with" 
          data-layout="default" 
          data-auto-logout-link="false" 
          data-use-continue-as="true" 
          data-scope="email,public_profile"
          data-onlogin="processLogin"
        ></div>
      </div>

      {/* Pulsante di backup se quello standard non si carica */}
      {!isButtonRendered && isSDKLoaded && (
        <button
          onClick={handleManualLogin}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1877F2] hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h9.5v-7.5h-2.5v-3h2.5V9c0-2.5 1.5-4 4-4s2.5.5 2.5.5v2.5h-1.5c-1 0-1 .5-1 1.5v2h2.5l-.5 3h-2v7.5h4.5a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2z"></path>
          </svg>
          Continua con Facebook
        </button>
      )}
    </div>
  );
};

export default FacebookLoginButton;