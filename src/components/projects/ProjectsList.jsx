import { useState, useEffect } from 'react';
import ProjectForm from './ProjectForm';
import TaskForm from '../tasks/TaskForm';
import ProjectService from '../../services/projectService';
import AuthService from '../../services/auth';
import './ProjectsList.css'; 

const ProjectsList = ({ isPersonalView = false }) => {
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [usersList, setUsersList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
        const response = await ProjectService.getAllProjects();
        setProjects(response.data || []);
        
      } catch (error) {
        console.error('Erreur:', error);
        setMessage({ text: 'Erreur lors du chargement des projets', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => { 
      try {
        const response = await ProjectService.getemployees();
        if (response.success) {
          setUsersList(response.data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    };

    fetchUsers();
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...projects];
    if (statusFilter !== 'all') {
      result = result.filter(project => project.status && project.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(project =>
        (project.name && project.name.toLowerCase().includes(query)) ||
        (project.description && project.description.toLowerCase().includes(query))
      );
    }
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc': return new Date(a.start_date || 0) - new Date(b.start_date || 0);
        case 'date-desc': return new Date(b.start_date || 0) - new Date(a.start_date || 0);
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
    setFilteredProjects(result);
  }, [projects, statusFilter, sortOption, searchQuery]);

  const toggleProjectExpand = (projectId) => {
    setExpandedProject(prev => prev === projectId ? null : projectId);
  };

  const getStatusClass = (status) => { 
    switch (status.toLowerCase()) {
      case 'en cours':
      case 'en_cours':
        return 'status-in-progress';
      case 'terminé':
        return 'status-completed';
      case 'en attente': 
      case 'en_attente':
        return 'status-pending';
      default:
        return '';
    }
  };
 
  const getStatusLabel = (status) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'terminé': return 'Terminé';
      default: return status;
    }
  };

  const handleOpenProjectForm = (project = null) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleCloseProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      if (editingProject) {
        const response = await ProjectService.updateProject(editingProject.id, projectData);
        console.log("Données envoyées à l'API:", projectData); 
        if (response.success) {
          setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data : p));
          setMessage({ text: 'Projet modifié avec succès', type: 'success' });
        }
      } else {
        const response = await ProjectService.createProject(projectData);
        if (response.success) {
          setProjects(prev => [...prev, response.data]);
          setMessage({ text: 'Projet créé avec succès', type: 'success' });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      console.error("Erreur détaillée:", error.response?.data);
    }
    handleCloseProjectForm();
  };

  const handleOpenTaskForm = (project) => {
    setSelectedProject(project);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        const response = await ProjectService.deleteProject(projectId);
        if (response.success) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          setMessage({ text: 'Projet supprimé avec succès', type: 'success' });
        }
      } catch (error) {
        console.error('Erreur:', error);
        setMessage({ text: 'Erreur lors de la suppression', type: 'error' });
      }
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="projects-list-container">
      <div className="projects-header">
        <h2>{isPersonalView ? 'Mes Projets' : 'Gestion des Projets'}</h2>
        {!isPersonalView && (
          <button className="create-project-btn" onClick={() => handleOpenProjectForm()}>+ Nouveau Projet</button>
        )}
      </div>

      {message.text && <div className={`notification ${message.type}`}>{message.text}</div>}

      <div className="projects-filters">
        <div className="filter-group">
          <label>Statut:</label> 
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous</option>
            <option value="en_cours">En cours</option>
            <option value="terminé">Terminé</option>
            <option value="en_attente">En attente</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Trier par:</label>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date-desc">Date (récent)</option>
            <option value="date-asc">Date (ancien)</option>
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
          </select>
        </div> 
        <div className="filter-search">
          <input type="text" className="filter-input" placeholder="Rechercher un projet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Chargement des projets en cours...</span>
        </div>
      ) : (
        <div className="projects-table">
          <div className="projects-table">
        <div className="table-header">
          <div className="header-cell">Projet</div>
          <div className="header-cell">Statut</div>
          <div className="header-cell">Deadline</div>
          {!isPersonalView && <div className="header-cell">Actions</div>}
          
        </div>
         
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>Aucun projet trouvé</p>
            {!isPersonalView && (
              <button 
                className="create-project-btn" 
                onClick={() => handleOpenProjectForm()}
              >
                + Créer un projet
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-row">
              <div 
                className={`project-main ${expandedProject === project.id ? 'active' : ''}`} 
                onClick={() => toggleProjectExpand(project.id)}
              >
                <div className="cell project-name">
                  <span className={`expand-icon ${expandedProject === project.id ? 'expanded' : ''}`}>
                    ▶
                  </span>
                  {project.name}
                </div>
                
                <div className="cell project-status">
                  <span className={`project-status ${getStatusClass(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span> 
                </div>
                
                <div className="cell project-deadline">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                </div>
                
                <div className="cell project-actions">
                  {!isPersonalView && (
                  <button 
                    className="action-btn edit-btn"  
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProjectForm(project);
                    }}
                  >
                    Modifier
                  </button>
                  )}
                  {!isPersonalView && (
                  <button 
                    className="action-btn delete-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                  >
                    Supprimer 
                  </button>
                  )}
                </div>
              </div>
              
              {expandedProject === project.id && (
                <div className="project-details">
                  <div className="details-section">
                    <h4>Description</h4>
                    <p>{project.description || 'Aucune description disponible.'}</p>
                  </div>
                  
                  <div className="details-section">
                    <div className="tasks-header">
                      <h4>Tâches ({project.tasks?.length || 0})</h4>
                      {!isPersonalView && (
                      <button 
                        className="add-task-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTaskForm(project);
                        }}
                      >
                        + Ajouter une tâche
                      </button>
                      )} 
                    </div>
                    
                     {project.tasks && project.tasks.length > 0 ? (
                      <div className="tasks-list">
                        {project.tasks.map(task => ( 
                          <div key={task.id} className="task-item">
                            <div className="task-name">{task.name}</div>
                            <div className="task-description"> Description : {task.description}</div> 
                            <div className="task-meta">
                              <span className={`task-status ${getStatusClass(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span> 
                              <span className="task-due-date">
                                 Date de fin  : {task.end_date && new Date(task.end_date).toLocaleDateString()}
                              </span>
                              <span className="task-assignee">
                                Assignée à :<br/>
                                {task.assigned_to ? 
                                  `${task.assigned_user.prenom} ${task.assigned_user.name}` : 
                                  'Non assignée'} 
                              </span> 
                            </div>
                          </div>
                        ))}
                      </div> 
                    ) : (
                      <p className="no-tasks">Aucune tâche associée à ce projet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
        </div>
      )}

      {showProjectForm && (
        <div className="inline-form">
        <ProjectForm onClose={handleCloseProjectForm} onSubmit={handleProjectSubmit} editProject={editingProject} tasksList={[]} />
        </div> 
      )}

      {showTaskForm && (
        <TaskForm onClose={handleCloseTaskForm} onSubmit={() => {}} projectId={selectedProject?.id} usersList={usersList} />
      )}
    </div>
  );
};

export default ProjectsList;
