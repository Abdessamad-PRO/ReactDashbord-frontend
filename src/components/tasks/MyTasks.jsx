import React, { useState, useEffect } from 'react';
import { BiTaskX } from 'react-icons/bi';
import TaskDeleteRequestForm from './TaskDeleteRequestForm';
import TaskService from '../../services/taskService';
import './TaskDeleteRequestForm.css';
import './MyTasks.css';
import TaskCancellationService from '../../services/taskCancellationService';
import TaskStatusChangeService from '../../services/taskStatusChangeService';

const MyTasks = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({ 
    'en_attente': [],
    'en_cours': [], 
    'terminé': [] 
  });
  const [showDeleteRequestForm, setShowDeleteRequestForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusLabel = (status) => {
    const labels = {
      'en_attente': 'À faire',
      'en_cours': 'En cours',
      'terminé': 'Terminé'
    };
    return labels[status] || status;
  };
 
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendTasks = await TaskService.getTasksForEmployee();
        
        setTasks(backendTasks.map(task => ({
          ...task,
          assigned_user: task.assigned_user || currentUser,
          formatted_start_date: formatDate(task.start_date),
          formatted_end_date: formatDate(task.end_date)
        })));
      } catch (err) { 
        console.error('Erreur lors du chargement des tâches:', err);
        setError('Impossible de charger les tâches. Veuillez réessayer.');
      } finally {
        setLoading(false); 
      }
    };

    loadTasks();
  }, [currentUser]);

  useEffect(() => {
    let filteredTasks = [...tasks];
    
    if (searchQuery) {
      filteredTasks = filteredTasks.filter(task => 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }
    
    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    filteredTasks.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.start_date) - new Date(a.start_date);
      if (sortBy === 'date-asc') return new Date(a.start_date) - new Date(b.start_date);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    setColumns({
      'en_attente': filteredTasks.filter(task => task.status === 'en_attente'),
      'en_cours': filteredTasks.filter(task => task.status === 'en_cours'),
      'terminé': filteredTasks.filter(task => task.status === 'terminé')
    });
  }, [searchQuery, statusFilter, sortBy, tasks]);

  const handleDeleteRequest = (task) => {
    setTaskToDelete(task); 
    setShowDeleteRequestForm(true); 
  };

  const handleSubmitCancellationRequest = async (formData) => {
    try {
      await TaskCancellationService.requestCancellation(taskToDelete.id, {
        name: formData.name,
        reason: formData.reason
      });
      
      setSuccessMessage(`Votre demande d'annulation pour la tâche "${taskToDelete.name}" a été soumise avec succès.`);
      setShowDeleteRequestForm(false);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Erreur lors de la demande d\'annulation:', error);
      setError('Une erreur est survenue lors de la soumission de votre demande. Veuillez réessayer.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const result = await TaskStatusChangeService.requestStatusChange(taskId, newStatus);
      
      if (result.success) {
        setSuccessMessage(`Demande de changement vers "${getStatusLabel(newStatus)}" envoyée au manager`);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(result.message || 'Échec de la demande de changement');
      }
    } catch (err) {
      console.error('Erreur lors de la demande de changement:', err);
      setError('Erreur lors de la demande de changement. Veuillez réessayer.');
    }
  }; 

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="my-tasks-container">
        <div className="loading-message">Chargement des tâches...</div>
      </div>
    );
  }

  return (
    <div className="my-tasks-container">
      <div className="my-tasks-header">
        <h2>Mes Tâches</h2>
      </div>

      {/* Affichage des messages d'erreur et de succès */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}

      <div className="tasks-filters-container">
        <div className="tasks-filters">
          <div className="filter-group">
            <label>Statut:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous</option>
              <option value="en_attente">À faire</option>
              <option value="en_cours">En cours</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Trier par:</label>
            <select
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Date (récent)</option>
              <option value="date-asc">Date (ancien)</option>
              <option value="name">Nom</option>
            </select>
          </div>
          
          <div className="search-group">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="tasks-columns">
        {Object.entries(columns).map(([status, tasks]) => (
          <div key={status} className="tasks-column">
            <div className="column-header">
              <h3>
                {status === 'en_attente' && <span className="column-icon todo-icon"></span>}
                {status === 'en_cours' && <span className="column-icon progress-icon"></span>}
                {status === 'terminé' && <span className="column-icon done-icon"></span>}
                {getStatusLabel(status)}
              </h3> 
              <span className="tasks-count">{tasks.length}</span>
            </div>
            
            <div className="column-tasks">
              {tasks.length === 0 ? (
                <div className="empty-column-message">
                  <p>Aucune tâche dans cette catégorie</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-card-header">
                      <div className="task-title-section">
                        <h4>{task.name}</h4>
                      </div>
                      <button 
                        className="task-delete-button"
                        onClick={() => handleDeleteRequest(task)} 
                      >
                        <BiTaskX />
                      </button>
                    </div>
                    <div className="task-card-content">
                      <p>{task.description}</p>
                    </div>
                    <div className="task-card-meta">
                      <div className="meta-item">
                        <span className="meta-label">Début:</span>
                        <span className="meta-value">{task.formatted_start_date}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Échéance:</span>
                        <span className="meta-value">{task.formatted_end_date}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Projet:</span>
                        <span className="meta-value">{task.project?.name || 'Non assigné'}</span>
                      </div>
                    </div> 
                    <div className="task-card-footer">
                      <select
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`status-selector status-${task.status}`}
                      >
                        <option value="en_attente">À faire</option>
                        <option value="en_cours">En cours</option>
                        <option value="terminé">Terminé</option>
                      </select>
                    </div> 
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showDeleteRequestForm && taskToDelete && (
        <TaskDeleteRequestForm
          onClose={() => setShowDeleteRequestForm(false)}
          onSubmit={handleSubmitCancellationRequest}
          taskTitle={taskToDelete.name}
          taskId={taskToDelete.id} 
        />
      )}
    </div>
  );
};

export default MyTasks;