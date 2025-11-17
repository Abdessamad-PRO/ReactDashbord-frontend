import api from '../axios';

const ProjectService = {
  /**
   * Récupère tous les projets
   * @returns {Promise} - Promesse contenant la liste des projets
   */
  getAllProjects() { 
    return api.get('/projects')
      .then(response => {
        console.log('Projets récupérés:', response.data);
        return response.data;
      }); 
  }, 
   
  getProjectsForManager() { 
    return api.get('/projects') 
      .then(response => { 
        console.log('Projets récupérés:', response.data); 
        return response.data.data || [];
      });
  }, 

 
  /**
   * Récupère un projet par son ID
   * @param {number} id - ID du projet
   * @returns {Promise} - Promesse contenant les détails du projet
   */
  getProjectById(id) {
    return api.get(`/projects/${id}`)
      .then(response => {
        console.log('Projet récupéré:', response.data);
        return response.data;
      });
  },

  /**
   * Crée un nouveau projet
   * @param {Object} projectData - Données du projet à créer
   * @returns {Promise} - Promesse contenant le projet créé
   */
  createProject(projectData) {
    console.log('Données du projet à créer:', projectData);
    return api.post('/projects', projectData) 
      .then(response => {
        console.log('Projet créé:', response.data);
        return response.data;
      }); 
  },

  /**
   * Met à jour un projet existant
   * @param {number} id - ID du projet à mettre à jour
   * @param {Object} projectData - Nouvelles données du projet
   * @returns {Promise} - Promesse contenant le projet mis à jour
   */
  updateProject(id, projectData) {
    console.log('Mise à jour du projet:', id, projectData);
    return api.put(`/projects/${id}`, projectData)
      .then(response => {
        console.log('Projet mis à jour:', response.data);
        return response.data;
      });
  },

  /**
   * Supprime un projet
   * @param {number} id - ID du projet à supprimer
   * @returns {Promise} - Promesse contenant le statut de suppression
   */
  deleteProject(id) {
    return api.delete(`/projects/${id}`)
      .then(response => {
        console.log('Projet supprimé:', response.data);
        return response.data;
      });
  },

  /**
   * Récupère la liste des employés disponibles
   * @returns {Promise} - Promesse contenant la liste des employés
   */
  getemployees() { 
    return api.get('/assign-user') 
      .then(response => {
        console.log('Employés récupérés:', response.data.data);
        return response.data.data;
      });
  }  
};

export default ProjectService; 