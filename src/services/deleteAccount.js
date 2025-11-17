import axios from 'axios';
import api from '../axios'; // Importez l'instance api configurée

const DeleteAccountService = { 
  // Soumettre une demande de suppression de compte
  async requestAccountDeletion(reason) { 
    try { 
      const response = await api.post('/account/delete-request', { reason });
      return response.data;
    } catch (error) {
      console.error('Erreur de suppression:', error);
      throw error.response?.data || { message: 'Une erreur est survenue lors de la soumission de la demande.' };
    } 
  },

  // Vérifier le statut de la demande de suppression
  async getRequestStatus() { 
    try {
      const response = await api.get('/account/delete-request/status');
      return response.data;
    } catch (error) {
      console.error('Erreur de statut:', error);
      throw error.response?.data || { message: 'Une erreur est survenue lors de la vérification du statut.' };
    }
  } 
};

export default DeleteAccountService;
