import { useState, useEffect } from 'react';
import './AssignTasksForm.css';

const AssignTasksForm = ({ onClose, onSubmit, project, allTasks = [] }) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  
  // Filtrer les tâches qui ne sont pas déjà associées au projet
  const availableTasks = allTasks.filter(task => 
    !project.tasks || !project.tasks.find(projectTask => projectTask.id === task.id)
  );

  const handleTaskSelection = (e) => {
    const taskId = e.target.value;
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setSelectedTaskIds(prev => [...prev, taskId]);
    } else {
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSubmit = (e) => { 
    e.preventDefault();
    
    // Obtenir les détails complets des tâches sélectionnées
    const selectedTasksDetails = allTasks.filter(task => 
      selectedTaskIds.includes(task.id)
    );
    
    // Mettre à jour le projet avec les nouvelles tâches
    const updatedProject = {
      ...project,
      tasks: [...(project.tasks || []), ...selectedTasksDetails]
    };
    
    onSubmit(updatedProject);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="assign-tasks-modal">
        <div className="modal-header">
          <h2>Ajouter des tâches à {project.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="assign-tasks-form">
          <div className="form-group">
            <label>Sélectionnez les tâches à ajouter</label>
            <div className="tasks-selection">
              {availableTasks.length > 0 ? (
                availableTasks.map(task => (
                  <div key={task.id} className="task-checkbox">
                    <input
                      type="checkbox"
                      id={`task-${task.id}`}
                      value={task.id}
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={handleTaskSelection}
                    />
                    <label htmlFor={`task-${task.id}`}>
                      <div className="task-details">
                        <span className="task-title">{task.title}</span>
                        <div className="task-meta">
                          <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                            {task.status}
                          </span>
                          {task.deadline && <span className="task-deadline">Échéance: {task.deadline}</span>}
                        </div>
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <p className="no-tasks-message">
                  Aucune tâche disponible. Toutes les tâches existantes sont déjà associées à ce projet ou créez d'abord de nouvelles tâches.
                </p>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Annuler</button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={selectedTaskIds.length === 0 || availableTasks.length === 0}
            >
              Ajouter au projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTasksForm;
