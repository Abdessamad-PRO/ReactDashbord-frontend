// services/taskService.js

import api from '../axios';

const TaskService = {
  /**
   * Récupère les tâches d'un projet (selon les droits de l'utilisateur connecté)
   * @param {number} projectId
   * @returns {Promise}
   */
  getTasksByProject(projectId) { 
    return api.get(`/projects/${projectId}/tasks`).then(res => res.data.data || []);
  },

  /**
   * Crée une nouvelle tâche dans un projet
   * @param {number} projectId
   * @param {object} taskData
   * @returns {Promise}
   */
  createTask(projectId, taskData) {
    return api.post(`/projects/${projectId}/tasks`, taskData).then(res => res.data);
  },

  /**
   * Met à jour une tâche existante
   * @param {number} projectId
   * @param {number} taskId
   * @param {object} taskData
   * @returns {Promise}
   */
  updateTask(projectId, taskId, taskData) {
    return api.put(`/projects/${projectId}/tasks/${taskId}`, taskData).then(res => res.data);
  },

  /**
   * Supprime une tâche 
   * @param {number} projectId
   * @param {number} taskId
   * @returns {Promise}
   */
  deleteTask(projectId, taskId) {
    return api.delete(`/projects/${projectId}/tasks/${taskId}`).then(res => res.data);
  },

  /**
   * Récupère une tâche spécifique d'un projet
   * @param {number} projectId
   * @param {number} taskId
   * @returns {Promise} 
   */
  getTask(projectId, taskId) { 
    return api.get(`/projects/${projectId}/tasks/${taskId}`).then(res => res.data);
  },

  getemployees() { 
    return api.get('/assign-user') 
      .then(response => {
        console.log('Employés récupérés:', response.data);
        return response.data.data || [] ;
      }); 
  },
  
  getTasksForManager() { 
  return api.get('/manager/tasks') 
    .then(res => res.data.data || []); 
  }, 

  getTasksForEmployee() { 
  return api.get('/employee/tasks')
    .then(res => res.data.data || []);
  },

  getEmployeesStats() {
    return api.get('/employees/stats')
      .then(res => res.data.data || []);
  },
  getManagersStats() { 
    return api.get('/managers/stats')
      .then(res => res.data.data || []);
  } 
  
};

export default TaskService;
