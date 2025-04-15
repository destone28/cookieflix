// src/utils/facebookSDK.js
export const initFacebookSDK = () => {
    return new Promise((resolve) => {
      // Wait for Facebook SDK to initialize before starting the React app
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '1045628904098752', // Il tuo Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v16.0'
        });
        
        console.log('Facebook SDK inizializzato con successo');
        resolve();
      };
  
      // Load Facebook SDK script
      (function(d, s, id) {
        console.log('Caricamento SDK Facebook...');
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          console.log('SDK Facebook già caricato');
          return resolve();
        }
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/it_IT/sdk.js";
        js.onload = () => console.log('SDK Facebook caricato');
        js.onerror = (e) => console.error('Errore caricamento SDK Facebook', e);
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    });
  };