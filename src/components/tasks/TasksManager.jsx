import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskDeleteRequestForm from './TaskDeleteRequestForm';
import TaskService from '../../services/taskService';

const TasksManager = ({ onEdit, onDelete, onStatusChange, userRole, projectsList = [], usersList = [] }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);   
  const [showDeleteRequestForm, setShowDeleteRequestForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState({
    'en_attente': [],
    'en_cours': [], 
    'terminé': []   
  });

  // Charger les tâches
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await TaskService.getTasksForManager();
      
      // Utilisation directe des noms de champs du backend
      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        start_date: task.start_date,
        end_date: task.end_date,
        priority: 'Moyenne', // Valeur par défaut
        assigned_to: task.assigned_to,
        assigned_user: task.assigned_user ? `${task.assigned_user.prenom} ${task.assigned_user.name}` : 'Non assigné',
        project_id: task.project_id,
        project: task.project ? task.project.name : 'Aucun projet',
        previous_task_id: task.previous_task_id,
        previous_task_name: null // Peut être rempli si nécessaire
      }));
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (userRole === 'manager' || userRole === 'admin') {
      loadTasks();
    }
  }, [userRole]);

  // Gestion du changement de statut
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      await TaskService.updateTask(task.project_id, taskId, {
        name: task.name,
        description: task.description,
        start_date: task.start_date,
        end_date: task.end_date,
        status: newStatus,
        assigned_to: task.assigned_to,
        previous_task_id: task.previous_task_id,
        project_id: task.project_id 
      });

      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      setTasks(updatedTasks);

      if (onStatusChange) {
        onStatusChange(taskId, newStatus);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  // Gestion de la suppression
  const handleDelete = async (taskId) => { 
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await TaskService.deleteTask(task.project_id, taskId);
      
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);

      if (onDelete) {
        onDelete(taskId);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de la tâche');
    }
  };

  // Filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    
    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Tri et répartition des tâches
  useEffect(() => {
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.start_date) - new Date(a.start_date);
      } else if (sortBy === 'date-asc') {
        return new Date(a.start_date) - new Date(b.start_date);
      } else if (sortBy === 'deadline') { 
        return new Date(a.end_date) - new Date(b.end_date);
      } else if (sortBy === 'priority') {
        const priorityOrder = { 'Haute': 1, 'Moyenne': 2, 'Basse': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
    
    const newColumns = {
      'en_attente': sortedTasks.filter(task => task.status === 'en_attente'),
      'en_cours': sortedTasks.filter(task => task.status === 'en_cours'),
      'terminé': sortedTasks.filter(task => task.status === 'terminé')
    };
    
    setColumns(newColumns);
  }, [filteredTasks, sortBy]);

  // Gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    if (taskId) {
      handleStatusChange(taskId, targetStatus);
    }
  };

  // Gestion du formulaire de tâche
  const handleOpenTaskForm = (task = null) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) { 
        await TaskService.updateTask(editingTask.project_id, editingTask.id, { 
          name: taskData.name,
          description: taskData.description,
          start_date: taskData.start_date || new Date().toISOString(),
          end_date: taskData.end_date,
          status: taskData.status,
          assigned_to: taskData.assigned_to,
          previous_task_id: taskData.previous_task_id || null,
          project_id: taskData.project_id
        }); 
        
        if (onEdit) {
          onEdit(taskData);
        }
      }
      
      await loadTasks();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde de la tâche');
    }
  };
  
  if (loading) { 
    
    return <div className="tasks-manager-container">Chargement des tâches...</div>;
  } 

  if (error) {
    return (
      <div className="tasks-manager-container">
        <div className="error-message">
          {error}
          <button onClick={loadTasks} className="retry-button">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-manager-container">
      <div className="tasks-header">
        <h2>Gestion des Tâches</h2>
      </div>

      <div className="tasks-filters">
        <div className="filter-item">
          <label>Statut:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous</option>
            <option value="en_cours">En cours</option>
            <option value="terminé">Terminé</option>
            <option value="en_attente">En attente</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Trier par:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select" 
          >
            <option value="date-desc">Date (récent)</option>
            <option value="date-asc">Date (ancien)</option>
            <option value="deadline">Échéance</option>
            <option value="priority">Priorité</option>
          </select>
        </div>
        <div className="filter-search">
          <label>Rechercher:</label>
          <input 
            type="text" 
            placeholder="Rechercher une tâche..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div> 
      
      <div className="kanban-view">
        {/* Colonne À faire */}
        <div 
          className="kanban-column" 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'en_attente')}
        >
          <div className="column-header pending">
            <h3>À faire</h3> 
            <span className="task-count">{columns['en_attente'].length}</span>
          </div>
          <div className="column-tasks">
            {columns['en_attente'].map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={handleOpenTaskForm} 
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                userRole={userRole}
                onDeleteRequest={(task) => {
                  setTaskToDelete(task);
                  setShowDeleteRequestForm(true);
                }}
              />
            ))}
            {columns['en_attente'].length === 0 && (
              <div className="empty-column-message">Aucune tâche en attente</div>
            )}
          </div>
        </div>
        
        {/* Colonne En cours */}
        <div 
          className="kanban-column" 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'en_cours')}
        >
          <div className="column-header in-progress">
            <h3>En cours</h3>
            <span className="task-count">{columns['en_cours'].length}</span>
          </div>
          <div className="column-tasks">
            {columns['en_cours'].map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={handleOpenTaskForm}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                userRole={userRole}
                onDeleteRequest={(task) => {
                  setTaskToDelete(task);
                  setShowDeleteRequestForm(true);
                }}
              />
            ))}
            {columns['en_cours'].length === 0 && (
              <div className="empty-column-message">Aucune tâche en cours</div>
            )}
          </div>
        </div>
        
        {/* Colonne Terminé */}
        <div 
          className="kanban-column" 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'terminé')}
        >
          <div className="column-header completed">
            <h3>Terminé</h3>
            <span className="task-count">{columns['terminé'].length}</span>
          </div>
          <div className="column-tasks">
            {columns['terminé'].map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={handleOpenTaskForm}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                userRole={userRole}
                onDeleteRequest={(task) => {
                  setTaskToDelete(task);
                  setShowDeleteRequestForm(true);
                }}
              />
            ))}
            {columns['terminé'].length === 0 && (
              <div className="empty-column-message">Aucune tâche terminée</div>
            )}
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm 
          onClose={handleCloseTaskForm}
          onSubmit={handleTaskSubmit}
          editTask={editingTask}
          projectsList={projectsList}
          tasksList={tasks}
          usersList={usersList} 
        />
      )}
      
      {showDeleteRequestForm && taskToDelete && (
        <TaskDeleteRequestForm
          onClose={() => {
            setShowDeleteRequestForm(false);
            setTaskToDelete(null);
          }}
          onSubmit={(requestData) => {
            console.log('Demande d\'annulation de tâche:', {
              taskId: taskToDelete.id,
              taskName: taskToDelete.name,
              ...requestData
            });
            setShowDeleteRequestForm(false);
            setTaskToDelete(null);
          }}
          taskName={taskToDelete.name}
        />
      )}
    </div>
  );
};

// Composant TaskCard adapté
const TaskCard = ({ task, onEdit, onDelete, onStatusChange, userRole, onDeleteRequest }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Haute': return 'priority-high';
      case 'Moyenne': return 'priority-medium';
      case 'Basse': return 'priority-low';
      default: return '';
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id.toString());
  };

  return (
    <div 
      className="task-card" 
      draggable="true" 
      onDragStart={handleDragStart}
    >
      <div className="task-card-header">
        <span className={`priority-indicator ${getPriorityClass(task.priority)}`}></span>
        <h4>{task.name}</h4> 
        <div className="task-actions">
          {userRole && (userRole === 'manager' || userRole === 'admin') && (
            <button 
              className="task-action-btn edit" 
              onClick={() => onEdit(task)}
            >
              ✏️
            </button>
          )}
          {userRole === 'employee' ? (
            <button 
              className="task-action-btn delete" 
              onClick={() => onDeleteRequest(task)}
            >
              🗑️
            </button>
          ) : (
            <button 
              className="task-action-btn delete" 
              onClick={() => onDelete(task.id)}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      <div className="task-card-content">
        <p className="task-description">{task.description}</p>
        <div className="task-meta">
          <div className="deadline">
            <span className="meta-label">Échéance:</span>
            <span className="meta-value">{new Date(task.end_date).toLocaleDateString()}</span>
          </div>
          <div className="assigned-to">
            <span className="meta-label">Assignée à:</span>
            <span className="meta-value">{task.assigned_user}</span>
          </div>
          {task.previous_task_id && (
            <div className="task-dependency">
              <span className="meta-label">Tâche antécédente:</span>
              <span className="meta-value dependency-value">{task.previous_task_name || task.previous_task_id}</span>
            </div>
          )}
        </div>
        
        <div className="task-card-footer">
          <select 
            value={task.status} 
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="status-selector"
            disabled={userRole === 'employee' && task.status === 'terminé'}
          >
            <option value="en_attente">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="terminé">Terminé</option>
          </select>
          
          {task.project && (
            <div className="task-project">
              <span className="project-badge">{task.project}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksManager;