
import axios from '../axios';

class ExportService {
  /**
   * Exporte tous les projets avec tâches et employés (projets complets)
   * @returns {Promise} - Promise qui résout avec le blob du PDF
   */
  async exportAllProjects() { 
    try {
      const response = await axios.get('/export/projects/pdf', {
        responseType: 'blob', // Important pour recevoir le fichier PDF
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'export de tous les projets:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de l\'export des projets complets'
      );
    }
  }

  /**
   * Exporte la liste des projets avec leurs employés (sans détails des tâches)
   * @returns {Promise} - Promise qui résout avec le blob du PDF
   */
  async exportProjectsWithUsers() {
    try {
      const response = await axios.get('/export/projects-with-users', {
        responseType: 'blob', // Important pour recevoir le fichier PDF
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'export des projets avec employés:', error);
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de l\'export des projets avec employés'
      );
    }
  }

  /**
   * Exporte un projet spécifique avec ses tâches et employés
   * @param {number} projectId - ID du projet à exporter
   * @returns {Promise} - Promise qui résout avec le blob du PDF
   */
  async exportProject(projectId) {
    try {
      const response = await axios.get(`/export/projects/${projectId}/pdf`, {
        responseType: 'blob', // Important pour recevoir le fichier PDF
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export du projet ${projectId}:`, error);
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de l\'export du projet'
      );
    }
  }

  /**
   * Utilitaire pour télécharger un blob PDF
   * @param {Blob} blob - Le blob PDF à télécharger
   * @param {string} filename - Le nom du fichier
   */
  downloadPDFBlob(blob, filename) {
    try {
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL créée
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      throw new Error('Erreur lors du téléchargement du fichier PDF');
    }
  }

  /**
   * Méthode complète pour exporter et télécharger tous les projets
   */
  async exportAndDownloadAllProjects() {
    try {
      const blob = await this.exportAllProjects();
      const filename = `projets_complets_${new Date().toISOString().split('T')[0]}.pdf`;
      this.downloadPDFBlob(blob, filename);
      return true;
    } catch (error) {
      console.error('Erreur complète export tous projets:', error);
      throw error;
    }
  }

  /**
   * Méthode complète pour exporter et télécharger les projets avec employés
   */
  async exportAndDownloadProjectsWithUsers() {
    try {
      const blob = await this.exportProjectsWithUsers();
      const filename = `projets_employes_${new Date().toISOString().split('T')[0]}.pdf`;
      this.downloadPDFBlob(blob, filename);
      return true;
    } catch (error) {
      console.error('Erreur complète export projets avec employés:', error);
      throw error;
    }
  }

  /**
   * Méthode complète pour exporter et télécharger un projet spécifique
   * @param {number} projectId - ID du projet
   * @param {string} projectName - Nom du projet (optionnel, pour le nom du fichier)
   */
  async exportAndDownloadProject(projectId, projectName = null) {
    try {
      const blob = await this.exportProject(projectId);
      const safeName = projectName ? projectName.replace(/[^a-zA-Z0-9]/g, '_') : projectId;
      const filename = `projet_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.downloadPDFBlob(blob, filename);
      return true;
    } catch (error) {
      console.error(`Erreur complète export projet ${projectId}:`, error);
      throw error;
    }
  }
}

// Créer une instance unique du service
const exportService = new ExportService();

export default exportService; 