import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
console.log('API Base URL configurée:', API_BASE_URL);

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', 
  },
  withCredentials: true, // Important pour les cookies CSRF
});

// Ajouter un intercepteur pour logger les requêtes 
api.interceptors.request.use(
  (config) => {
    console.log('Requête envoyée à:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fonction pour obtenir le cookie CSRF
const getCSRFToken = () => {
  const name = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const csrfCookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
  
  if (csrfCookie) {
    return decodeURIComponent(csrfCookie.split('=')[1]);
  }
  return null;
};

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  async (config) => {
    // Ajouter le token d'authentification s'il existe
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    
    // Ajouter le token CSRF pour les requêtes non GET
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      // Si nous n'avons pas encore de cookie CSRF, nous devons d'abord le récupérer
      if (!getCSRFToken()) {
        try {
          // Appel à l'endpoint sanctum/csrf-cookie pour obtenir un nouveau token CSRF
          await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
        } catch (error) {
          console.error('Erreur lors de la récupération du cookie CSRF:', error);
        }
      }
      
      // Maintenant nous devrions avoir un cookie CSRF, l'ajouter à l'en-tête
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Optionnel: rediriger vers la page de connexion
      // window.location.reload();
    } else if (error.response?.status === 419) {
      // Erreur CSRF token expiré, essayer de récupérer un nouveau token
      console.error('CSRF token expiré ou invalide');
    }
    return Promise.reject(error);
  }
);

export default api;