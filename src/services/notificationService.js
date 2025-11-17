import axios from '../axios'; 

class NotificationService { 
  
  /**
   * Récupérer toutes les notifications de l'utilisateur connecté
   * @returns {Promise} Liste des notifications
   */ 
  async getAllNotifications() { 
    try { 
      const response = await axios.get('/notifications');
      return {
        success: true,
        data: response.data,
        message: 'Notifications récupérées avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return {
        success: false,
        data: [],
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Récupérer les notifications non lues de l'utilisateur connecté
   * @returns {Promise} Liste des notifications non lues
   */
  async getUnreadNotifications() { 
    try {
      const response = await axios.get('/notifications/unread');
      return {
        success: true,
        data: response.data,
        message: 'Notifications non lues récupérées avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      return {
        success: false,
        data: [],
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Compter les notifications non lues
   * @returns {Promise} Nombre de notifications non lues
   */
  async getUnreadCount() { 
    try {
      const response = await axios.get('/notifications/count');
      return {
        success: true,
        count: response.data.count,
        message: 'Nombre de notifications non lues récupéré'
      };
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      return {
        success: false,
        count: 0,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Marquer une notification comme lue
   * @param {number} notificationId - ID de la notification
   * @returns {Promise} Résultat de l'opération
   */
  async markAsRead(notificationId) {
    try {
      const response = await axios.put(`/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.notification,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      return {
        success: false,
        data: null,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   * @returns {Promise} Résultat de l'opération
   */
  async markAllAsRead() {
    try {
      const response = await axios.put('/notifications/read-all');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Supprimer une notification
   * @param {number} notificationId - ID de la notification
   * @returns {Promise} Résultat de l'opération
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Supprimer toutes les notifications
   * @returns {Promise} Résultat de l'opération
   */
  async deleteAllNotifications() {
    try {
      const response = await axios.delete('/notifications');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Récupérer les notifications avec filtrage et tri
   * @param {string} filter - 'all', 'read', 'unread'
   * @param {string} sortBy - 'date', 'type'
   * @returns {Promise} Notifications filtrées et triées
   */
  async getFilteredNotifications(filter = 'all', sortBy = 'date') {
    try {
      let result;
      
      // Récupérer les notifications selon le filtre
      switch (filter) {
        case 'unread':
          result = await this.getUnreadNotifications();
          break;
        case 'read':
          const allNotifications = await this.getAllNotifications();
          if (allNotifications.success) {
            result = {
              ...allNotifications,
              data: allNotifications.data.filter(n => n.read)
            };
          } else {
            result = allNotifications;
          }
          break;
        default:
          result = await this.getAllNotifications();
      }

      if (!result.success) {
        return result;
      }

      // Trier les notifications côté client
      const sortedData = [...result.data].sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortBy === 'type') {
          return (a.type || '').localeCompare(b.type || '');
        }
        return 0;
      });

      return {
        ...result,
        data: sortedData
      };
    } catch (error) {
      console.error('Erreur lors du filtrage des notifications:', error);
      return {
        success: false,
        data: [],
        message: 'Erreur lors du filtrage des notifications'
      };
    }
  }

  /**
   * Polling pour récupérer automatiquement les nouvelles notifications
   * @param {Function} callback - Fonction appelée avec les nouvelles notifications
   * @param {number} interval - Intervalle en millisecondes (défaut: 30 secondes)
   * @returns {number} ID de l'intervalle pour pouvoir l'arrêter
   */
  startPolling(callback, interval = 30000) {
    const intervalId = setInterval(async () => {
      try {
        const result = await this.getAllNotifications();
        if (result.success && callback) {
          callback(result.data);
        }
      } catch (error) {
        console.error('Erreur lors du polling des notifications:', error);
      }
    }, interval);

    return intervalId;
  }

  /**
   * Arrêter le polling
   * @param {number} intervalId - ID de l'intervalle retourné par startPolling
   */
  stopPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  /**
   * Extraire le message d'erreur approprié
   * @param {Object} error - Objet d'erreur
   * @returns {string} Message d'erreur formaté
   */
  getErrorMessage(error) {
    if (error.response) {
      // Erreur de réponse du serveur
      if (error.response.status === 401) {
        return 'Vous devez être connecté pour accéder aux notifications';
      } else if (error.response.status === 403) {
        return 'Vous n\'avez pas l\'autorisation d\'accéder à cette notification';
      } else if (error.response.status === 404) {
        return 'Notification non trouvée';
      } else if (error.response.data && error.response.data.message) {
        return error.response.data.message;
      }
      return `Erreur du serveur: ${error.response.status}`;
    } else if (error.request) {
      // Erreur de réseau
      return 'Erreur de connexion au serveur';
    } else {
      // Autre erreur
      return 'Une erreur inattendue s\'est produite';
    }
  }
}

// Export d'une instance singleton
const notificationService = new NotificationService(); 
export default notificationService;