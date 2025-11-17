import { useState, useEffect } from 'react';
import TaskService from '../../services/taskService';
import './TaskForm.css';

const TaskForm = ({ onClose, onSubmit, editTask = null, projectId = null, usersList = [] }) => {
  const [task, setTask] = useState({
    id: null,
    name: '',
    description: '',
    status: 'En attente',
    start_date: '', 
    end_date: '',
    assigned_to: '',
    project_id: '',
    previous_task_id: null,
  });

  const [availableTasks, setAvailableTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTask) {
      setTask({
        ...editTask,
        start_date: editTask.start_date ? editTask.start_date.split('T')[0] : '',
        end_date: editTask.end_date ? editTask.end_date.split('T')[0] : '',
        previous_task_id: editTask.previous_task_id || null,
      });
    } else if (projectId) {
      setTask(prev => ({
        ...prev,
        project_id: projectId,
      }));
    }
  }, [editTask, projectId]);

  useEffect(() => { 
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const employeesData = await TaskService.getemployees();
        setEmployees(employeesData); 
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      if (task.project_id) {
        try {
          const tasks = await TaskService.getTasksByProject(task.project_id);
          const filtered = tasks.filter(t => !editTask || t.id !== editTask.id);
          setAvailableTasks(filtered);
        } catch (error) {
          console.error('Erreur lors du chargement des tâches:', error);
          setAvailableTasks([]);
        }
      } else {
        setAvailableTasks([]);
      }
    };

    loadTasks();
  }, [task.project_id, editTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handlePreviousTaskChange = (e) => {
    const value = e.target.value;
    setTask(prev => ({ ...prev, previous_task_id: value || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task.name.trim()) {
      alert("Le nom de la tâche est requis");
      return;
    }

    const pid = task.project_id || projectId;
    if (!pid) {
      alert("Un projet doit être sélectionné");
      return;
    }

    try {
      setLoading(true);

      const taskData = { 
        name: task.name,
        description: task.description,
        start_date: task.start_date || null,
        end_date: task.end_date || null,
        status: task.status,
        assigned_to: task.assigned_to || null, 
        previous_task_id: task.previous_task_id || null,
        project_id: pid,
      }; 

      let result;
      if (editTask) { 
        result = await TaskService.updateTask(pid, editTask.id, taskData);
      } else {  
        result = await TaskService.createTask(pid, taskData);
      }

      onSubmit(result.data || result);
      onClose();
    } catch (error) { 
      console.error('Erreur lors de la soumission:', error);
      alert(`Erreur lors de ${editTask ? 'la modification' : 'la création'} de la tâche`);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="name">Nom *</label>
            <input
              type="text"
              id="name"
              name="name" 
              value={task.name}
              onChange={handleChange}
              required
              placeholder="Nom de la tâche"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={task.description}
              onChange={handleChange}
              placeholder="Description détaillée"
              rows="3"
            /> 
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="start_date">Date de début</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={task.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group half">
              <label htmlFor="end_date">Date d'échéance</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={task.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="previous_task_id">Tâche antécédente</label>
              <select
                id="previous_task_id"
                name="previous_task_id"
                value={task.previous_task_id || ""}
                onChange={handlePreviousTaskChange} 
                className="form-select"
                disabled={loading}
              >
                <option value="">choisir une tâche antécédente</option>
                {availableTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option> 
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label htmlFor="assigned_to">Assignée à</label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={task.assigned_to}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                <option value="">Sélectionner un employé</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.prenom}   
                  </option> 
                ))} 
              </select>
            </div>
          </div>

          <div className="form-group">
            {/* <label htmlFor="project_id">Nom du projet</label> */}
            <input
             
              type="hidden"
              id="project_id"
              name="project_id"
              value={task.project_id || ''}
              readOnly
              className="readonly-input"
              placeholder="Aucun projet sélectionné"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Chargement...' : (editTask ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
