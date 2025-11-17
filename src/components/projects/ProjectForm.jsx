import { useState, useEffect } from 'react';
import './ProjectForm.css';
import ProjectService from '../../services/projectService';
import AuthService from '../../services/auth';

const ProjectForm = ({ onClose, onSubmit, editProject = null, tasksList = [] }) => {
  const [project, setProject] = useState({
    id: null,
    name: '',
    description: '',
    status: 'en_attente',
    start_date: '',
    end_date: '', 
    manager_id: '',
    tasks: []
  });
  
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger l'utilisateur connecté (manager)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        // Récupérer l'utilisateur connecté depuis le localStorage ou l'API
        const userData = AuthService.getStoredUserData();
        
        if (userData) {
          setCurrentUser(userData);
          // Définir automatiquement le manager_id avec l'ID de l'utilisateur connecté
          setProject(prev => ({ ...prev, manager_id: userData.id }));
        } else { 
          // Si les données ne sont pas dans le localStorage, les récupérer depuis l'API
          const response = await AuthService.getCurrentUser();
          setCurrentUser(response);
          setProject(prev => ({ ...prev, manager_id: response.id }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
        setError('Impossible de récupérer vos informations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Si on édite un projet existant, on charge ses données
  useEffect(() => { 
    if (editProject) {
      setProject({
        ...editProject,
        end_date: editProject.end_date ? editProject.end_date.split('T')[0] : '',
        start_date: editProject.start_date ? editProject.start_date.split('T')[0] : '',
        // On conserve le manager_id du projet en édition
        manager_id: editProject.manager?.id || (currentUser ? currentUser.id : '')
      }); 
      
      // Si le projet a des tâches, on les sélectionne
      if (editProject.tasks && editProject.tasks.length > 0) {
        setSelectedTasks(editProject.tasks.map(task => task.id));
      }
    }
  }, [editProject, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskSelection = (e) => {
    const taskId = e.target.value;
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!project.name.trim()) {
      setError('Le nom du projet est requis');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Préparer les données du projet
      const projectData = {
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        manager_id: project.manager_id, // Utilise l'ID du manager connecté
        // Ne pas inclure les tâches lors de la création initiale
        tasks: editProject ? selectedTasks : []
      };
      
      console.log('Envoi des données du projet:', projectData);
      
      // Créer ou mettre à jour le projet via l'API
      let response;
      if (project.id) {
        response = await ProjectService.updateProject(project.id, projectData);
      } else {
        response = await ProjectService.createProject(projectData); 
      }
      
      console.log('Réponse du serveur:', response);
      
      // Appeler la fonction onSubmit avec les données du projet créé/mis à jour
      onSubmit(response);
      onClose(); 
      
    } catch (err) {
      console.error('Erreur lors de la soumission du projet:', err);
      setError('Une erreur est survenue lors de la création/modification du projet');
    } finally {
      setLoading(false);
    } 
  };

  // Ajoutez ce code à votre composant ProjectForm

  return (
    <div className="modal-overlay">
      <div className="project-form-modal">
        <div className="modal-header">
          <h2>{editProject ? 'Modifier le projet' : 'Nouveau projet'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="project-form"> 
          <div className="form-group">
            <label htmlFor="name">Nom du projet *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={project.name}
              onChange={handleChange}
              required
              placeholder="Nom du projet"
            />
          </div> 
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={project.description}
              onChange={handleChange}
              placeholder="Description détaillée"
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Statut</label>
            <select
              id="status"
              name="status"
              value={project.status}
              onChange={handleChange}
            >
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="start_date">Date de début</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={project.start_date}
                onChange={handleChange}
              />
            </div> 
            
            <div className="form-group half">
              <label htmlFor="end_date">Date d'échéance</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={project.end_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <label htmlFor="end_date">Manager du projet </label>
          <div className="form-group">
            {/* <label htmlFor="manager_id">Responsable</label> */}
            <input
              type="text"
              id="manager_display"
              value={currentUser ? `${currentUser.prenom} ${currentUser.name}` : 'Chargement...'}
              readOnly 
              className="readonly-input"
            />  
            {/* Champ caché pour stocker l'ID du manager */}
            <input
              type="hidden"
              id="manager_id"
              name="manager_id"
              value={project.manager_id} 
            />
          </div>
          
          {/* Afficher la section des tâches uniquement en mode édition */}
          {editProject && tasksList && tasksList.length > 0 && (
            <div className="form-group">
              <label>Tâches associées</label>
              <div className="tasks-list">
                {tasksList.map(task => (
                  <div key={task.id} className="task-checkbox">
                    <input
                      type="checkbox"
                      id={`task-${task.id}`}
                      value={task.id}
                      checked={selectedTasks.includes(task.id)}
                      onChange={handleTaskSelection}
                    />
                    <label htmlFor={`task-${task.id}`}>{task.title || task.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Annuler</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Chargement...' : (editProject ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;