// services/deleteRequestService.js

class DeleteRequestService {
  constructor() {
    this.baseURL = 'http://localhost:8000/api/admin/delete-requests';
    this.getAuthHeaders = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, 
    });
  } 
 
  // Approuver une demande de suppression 
  async approveRequest(requestId) { 
    try {
      const response = await fetch(`${this.baseURL}/${requestId}/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'approbation');
      }

      return {
        success: true,
        data: data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Rejeter une demande de suppression
  async rejectRequest(requestId, rejectionReason) { 
    try {
      const response = await fetch(`${this.baseURL}/${requestId}/reject`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          rejection_reason: rejectionReason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du rejet');
      }

      return {
        success: true,
        data: data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Obtenir toutes les demandes (pour les admins)
  async getAllRequests() {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des demandes');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Obtenir les demandes en attente
  async getPendingRequests() {
    try {
      const response = await fetch(`${this.baseURL}/pending`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des demandes en attente');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Obtenir une demande spécifique
  async getRequest(requestId) {
    try {
      const response = await fetch(`${this.baseURL}/${requestId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération de la demande');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new DeleteRequestService(); 