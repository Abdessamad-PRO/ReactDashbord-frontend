import api from '../axios';
import axios from 'axios';

/**
 * Service d'authentification pour interagir avec l'API Laravel
 */
const AuthService = {
  /**
   * Connecte un utilisateur avec ses identifiants
   * @param {Object} credentials - Les identifiants de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur et le token
   */
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    const { token, user } = response.data;   //// ici 

  // stocker les données de l'utilisateur et le token
  AuthService.storeAuthData(token, user);   ///ici 
    return response.data;
  }, 

  /** 
   * Déconnecte l'utilisateur actuel
   * @returns {Promise} - Promesse de déconnexion
   */
  logout: async () => {
    return await api.post('/logout');
  },

  /**
   * Récupère les informations de l'utilisateur connecté
   * @returns {Promise} - Promesse contenant les données de l'utilisateur
   */
  getCurrentUser: async () => {  
    const response = await api.get('/user');
    return response.data;
  },
  
  /**
   * Enregistre un nouvel utilisateur
   * @param {Object} userData - Les données du nouvel utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur créé
   */
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  /**
   * Envoie une demande d'inscription à l'administrateur pour validation
   * @param {Object} userData - Les données du nouvel utilisateur (prenom, name, email, rôle, téléphone)
   * @returns {Promise} - Promesse contenant le statut de la demande
   */
  requestRegistration: async (userData) => {
    const response = await api.post('/request-registration', userData);
    return response.data;
  },

  /**
   * Demande l'envoi d'un code de vérification pour réinitialiser le mot de passe
   * @param {Object} data - Données pour la réinitialisation (email)
   * @returns {Promise} - Promesse de l'envoi du code
   */
  forgotPassword: async (data) => {
    // Utiliser axios directement avec une URL absolue
    const response = await axios.post('http://localhost:8000/api/forgot-password', data, {
      headers: {
        'Content-Type': 'application/json', 
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Vérifie le code de vérification envoyé par email
   * @param {Object} data - Données pour la vérification (email, code)
   * @returns {Promise} - Promesse de vérification du code
   */
  verifyResetCode: async (data) => {
    // Utiliser axios directement avec une URL absolue
    const response = await axios.post('http://localhost:8000/api/verify-reset-code', data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Réinitialise le mot de passe avec le code de vérification
   * @param {Object} data - Données pour la réinitialisation (email, code, password, password_confirmation)
   * @returns {Promise} - Promesse de réinitialisation
   */
  resetPassword: async (data) => {
    // Utiliser axios directement avec une URL absolue
    const response = await axios.post('http://localhost:8000/api/reset-password', data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });
    return response.data;
  },

  /** 
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean} - True si l'utilisateur est authentifié
   */ 
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Récupère le token d'authentification
   * @returns {string|null} - Le token d'authentification ou null
   */
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Récupère les données de l'utilisateur stockées localement
   * @returns {Object|null} - Les données de l'utilisateur ou null
   */
  getStoredUserData: () => {  
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }, 

  /**
   * Stocke les données d'authentification (token et utilisateur)
   * @param {string} token - Le token d'authentification
   * @param {Object} userData - Les données de l'utilisateur
   */
  storeAuthData: (token, userData) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
  },

  /**
   * Efface les données d'authentification
   */
  clearAuthData: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }, 

  /**
   * Pour l'administrateur: Récupère la liste des demandes d'inscription en attente
   * @returns {Promise} - Promesse contenant la liste des demandes
   */
  getPendingRegistrations: async () => {
    const response = await api.get('/admin/pending-registrations');
    return response.data;
  },

  /**
   * Pour l'administrateur: Approuve une demande d'inscription
   * @param {number} requestId - ID de la demande d'inscription
   * @returns {Promise} - Promesse contenant le statut de l'approbation
   */
  approveRegistration: async (requestId) => {
    const response = await api.post(`/admin/approve-registration/${requestId}`);
    return response.data;
  },

  /**
   * Pour l'administrateur: Rejette une demande d'inscription
   * @param {number} requestId - ID de la demande d'inscription
   * @param {string} reason - Raison du rejet (optionnel)
   * @returns {Promise} - Promesse contenant le statut du rejet
   */
  rejectRegistration: async (requestId, reason = '') => {
    const response = await api.post(`/admin/reject-registration/${requestId}`, { reason });
    return response.data;
  },

  /**
   * Pour l'utilisateur: Définit un nouveau mot de passe après la première connexion
   * @param {Object} data - Données pour la définition du mot de passe (token, password, password_confirmation)
   * @returns {Promise} - Promesse contenant le statut de la définition du mot de passe
   */
  setInitialPassword: async (data) => {
    const response = await api.post('/set-initial-password', data);
    return response.data;
  },

  /**
   * Met à jour le profil de l'utilisateur connecté
   * @param {Object} userData - Les données du profil à mettre à jour
   * @param {File} profileImage - Image de profil (optionnel)
   * @returns {Promise} - Promesse contenant les données utilisateur mises à jour
   */
  updateUserProfile: async (userData, profileImage = null) => {
    try {
      const formData = new FormData();
      
      // Mapper les champs frontend vers backend avant envoi
      const backendMapping = {
        firstName: 'prenom',
        lastName: 'name',
        phone: 'telephone',
        address: 'adresse',
        department: 'departement', 
        // email et bio restent identiques
        email: 'email',
        bio: 'bio'
      };
      
      // Ajouter les données mappées au FormData
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          const backendKey = backendMapping[key] || key;
          formData.append(backendKey, userData[key]);
          console.log(`Ajout au FormData: ${backendKey} = ${userData[key]}`);
        }
      }); 
      console.log('profileImage:', profileImage);
      // Ajouter l'image de profil si elle existe
      if (profileImage) { 
        formData.append('photo_de_profile', profileImage); 
        console.log('Image de profil ajoutée au FormData'); 
      } 
      
      const token = localStorage.getItem('auth_token');
      if (!token) { 
        throw new Error('Token d\'authentification non trouvé. Veuillez vous reconnecter.');
      }
      
      // Afficher les premiers caractères du token pour débogage
      console.log('Début du token:', token.substring(0, 10) + '...');
      
      // Essayer directement avec la méthode POST sur l'endpoint standard
      console.log('Envoi de la requête PUT à /profile');
      // const response = await api.post('/profile?_method=PUT', formData, {
      const response = await api.put('/profile', formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }   
      }); 
      
      console.log('Réponse du backend:', response.data);
      console.log('Statut HTTP:', response.status);
      
      if (response.data.user) {
        const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
        
        // Mapper correctement les données du backend vers le frontend
        const updatedUser = { 
          ...currentUser,
          firstName: response.data.user.prenom,
          lastName: response.data.user.name,
          email: response.data.user.email,
          phone: response.data.user.telephone,
          address: response.data.user.adresse,
          department: response.data.user.departement,
          bio: response.data.user.bio,
          // Gérer l'avatar
          // avatarUrl: response.data.user.photo_de_profile ,
          avatarUrl: response.data.user.photo_de_profile ?
            response.data.user.photo_de_profile :
            currentUser.avatarUrl
          
        }; 
         
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        return { 
          success: true,
          message: response.data.message || 'Profil mis à jour avec succès',
          user: updatedUser
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      // Gestion d'erreurs plus détaillée
      if (error.response?.status === 422) {
        // Erreurs de validation
        const validationErrors = error.response.data.errors;
        console.error('Erreurs de validation:', validationErrors);
        throw new Error('Données invalides: ' + Object.values(validationErrors).flat().join(', '));
      } else if (error.response?.status === 401) {
        console.error('Erreur d\'authentification 401. Détails:', error.response.data);
        // Ne pas supprimer les tokens tout de suite pour permettre le débogage
        throw new Error('Problème d\'authentification. Vérifiez les logs pour plus de détails.');
      }
      
      throw error;
    }
  } ,

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`admin/delete-requests/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l’utilisateur:', error);
      throw error.response?.data || { message: 'Erreur serveur' };
    }
  }, 

}
export default AuthService;
