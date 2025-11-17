import React, { useState, useEffect } from 'react';
import { LuChartGantt } from 'react-icons/lu';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiErrorCircle } from 'react-icons/bi';
import { FaCheck, FaHourglassHalf, FaPause, FaExclamationTriangle } from 'react-icons/fa';
import ProjectService from '../../services/projectService';
import TaskService from '../../services/taskService';
import './GanttPage.css';

const GanttPage = () => {
  const [ganttData, setGanttData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [backendProjects, setBackendProjects] = useState([]);

  // Fonction pour déterminer la couleur en fonction du statut
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'terminé':
      case 'complete':
      case 'completed':
      case 'fini':
        return '#4caf50'; // Vert
      case 'en_cours':
      case 'in progress':
      case 'actif':
      case 'active':
        return '#2196f3'; // Bleu
      case 'en_attente':
      case 'pending':
      case 'attente':
        return '#ff9800'; // Orange
      case 'bloqué':
      case 'blocked':
      case 'suspendu':
        return '#f44336'; // Rouge
      default:
        return '#9e9e9e'; // Gris par défaut
    }
  };

  // Fonction pour obtenir l'icône en fonction du statut
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'terminé':
      case 'complete':
      case 'completed':
      case 'fini':
        return <FaCheck />;
      case 'en_cours':
      case 'in progress':
      case 'actif':
      case 'active':
        return <FaHourglassHalf />;
      case 'en_attente':
      case 'pending':
      case 'attente':
        return <FaPause />;
      case 'bloqué':
      case 'blocked':
      case 'suspendu':
        return <FaExclamationTriangle />;
      default:
        return null;
    }
  };

  // Fonction pour calculer la position et la largeur de la barre de la tâche
  const calculateTaskBar = (startDate, endDate) => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth, daysInMonth);
    
    // Assurer que les dates sont dans le bon format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Si la tâche est en dehors du mois sélectionné, retourner null
    if (end < monthStart || start > monthEnd) {
      return { display: 'none' };
    }
    
    // Calculer la position de début (en % du mois)
    const startPosition = start < monthStart 
      ? 0 
      : ((start.getDate() - 1) / daysInMonth) * 100;
    
    // Calculer la fin (en % du mois)
    const endPosition = end > monthEnd 
      ? 100 
      : ((end.getDate()) / daysInMonth) * 100;
    
    // Calculer la largeur
    const width = endPosition - startPosition;
    
    return {
      left: `${startPosition}%`,
      width: `${width}%`
    };
  };

  // Fonction pour récupérer les projets et leurs tâches depuis le backend
  const fetchProjectsAndTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les projets
      const projectsResponse = await ProjectService.getAllProjects();
      const projects = projectsResponse.data || projectsResponse || [];

      console.log('Projets récupérés du backend:', projects);

      // Pour chaque projet, récupérer ses tâches
      const projectsWithTasks = await Promise.all(
        projects.map(async (project) => {
          try {
            const tasks = await TaskService.getTasksByProject(project.id);
            console.log(`Tâches pour le projet ${project.id}:`, tasks);
            
            return {
              ...project,
              tasks: tasks || []
            };
          } catch (taskError) {
            console.error(`Erreur lors de la récupération des tâches pour le projet ${project.id}:`, taskError);
            return {
              ...project,
              tasks: []
            };
          }
        })
      );

      console.log('Projets avec tâches:', projectsWithTasks);
      setBackendProjects(projectsWithTasks);

    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Erreur lors du chargement des projets et tâches');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour transformer les données backend en format Gantt
  const transformBackendDataToGantt = (backendData) => {
    return backendData.map(project => {
      // Mapper les champs de la base de données vers le format attendu
      const startDate = project.start_date 
        ? new Date(project.start_date) 
        : new Date();
      
      const endDate = project.end_date 
        ? new Date(project.end_date) 
        : new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000));

      // Transformer les tâches
      const tasks = project.tasks.map((task, index) => {
        const taskStart = task.start_date 
          ? new Date(task.start_date) 
          : new Date(startDate.getTime() + (index * 2 * 24 * 60 * 60 * 1000));
        
        const taskEnd = task.end_date 
          ? new Date(task.end_date) 
          : new Date(taskStart.getTime() + (5 * 24 * 60 * 60 * 1000));

        return {
          id: task.id,
          name: task.name || `Tâche ${index + 1}`,
          start: taskStart,
          end: taskEnd,
          status: task.status || 'En cours',
          assignedTo: task.assigned_to || '',
          progress: 0, // Vous pouvez ajouter ce champ dans votre base de données si nécessaire
          dependencies: task.previous_task_id ? [task.previous_task_id] : []
        };
      });

      return {
        id: project.id,
        name: project.name || 'Projet sans nom',
        start: startDate,
        end: endDate,
        progress: 0, // Calculer le progrès basé sur les tâches si nécessaire
        tasks: tasks
      };
    });
  };

  useEffect(() => {
    // Récupérer automatiquement depuis le backend
    fetchProjectsAndTasks();
  }, []);

  useEffect(() => {
    // Quand les données backend sont récupérées, les transformer
    if (backendProjects.length > 0) {
      try {
        const formattedData = transformBackendDataToGantt(backendProjects);
        console.log('Données formatées depuis backend:', formattedData);
        setGanttData(formattedData);
      } catch (err) {
        console.error('Erreur lors de la transformation des données backend:', err);
        setError('Erreur lors du formatage des données');
      }
    }
  }, [backendProjects]);

  // Générer les jours du mois pour l'en-tête du calendrier
  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <div key={`day-${i}`} className="gantt-day">
          {i}
        </div>
      );
    }
    
    return days;
  };
  
  // Changer de mois
  const changeMonth = (increment) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };
  
  // Obtenir le nom du mois
  const getMonthName = (month) => {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return monthNames[month];
  };

  // Fonction pour actualiser les données
  const refreshData = () => {
    fetchProjectsAndTasks();
  };

  return (
    <div className="gantt-page">
      <div className="gantt-header">
        <h1><LuChartGantt className="gantt-icon" /> Diagramme de Gantt</h1>
        <p>Visualisation chronologique des projets et tâches</p>
        {/* <button onClick={refreshData} className="refresh-btn" disabled={loading}>
          {loading ? <AiOutlineLoading3Quarters className="spinning" /> : '🔄'} Actualiser
        </button> */}
      </div> 

      {/* Contrôles de navigation */}
      <div className="gantt-controls">
        <button onClick={() => changeMonth(-1)} className="month-nav-btn">
          &lt;
        </button>
        <h2>{getMonthName(selectedMonth)} {selectedYear}</h2>
        <button onClick={() => changeMonth(1)} className="month-nav-btn">
          &gt; 
        </button>
      </div>

      {/* Légende des couleurs */}
      <div className="gantt-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4caf50' }}></div>
          <span>Terminé</span>
          <FaCheck className="legend-icon" />
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2196f3' }}></div>
          <span>En cours</span>
          <FaHourglassHalf className="legend-icon" />
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff9800' }}></div>
          <span>En attente</span>
          <FaPause className="legend-icon" />
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f44336' }}></div>
          <span>Bloqué</span>
          <FaExclamationTriangle className="legend-icon" />
        </div>
      </div>

      {/* Affichage des états de chargement, erreur, ou vide */}
      {loading && (
        <div className="gantt-loading">
          <div className="spinner"></div>
          <p>Chargement du diagramme de Gantt...</p>
        </div>
      )}

      {error && (
        <div className="gantt-error">
          <BiErrorCircle className="error-icon" />
          {error}
          <button onClick={refreshData} className="retry-btn">
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && ganttData.length === 0 && (
        <div className="gantt-empty">
          <LuChartGantt className="gantt-icon" />
          <h2>Aucun projet disponible</h2>
          <p>Ajoutez des projets pour visualiser le diagramme de Gantt</p>
          <button onClick={refreshData} className="refresh-btn">
            Charger les projets
          </button>
        </div>
      )}
      
      {/* Rendu du diagramme de Gantt */}
      {!loading && !error && ganttData.length > 0 && (
        <div className="custom-gantt-container">
          {/* En-tête du calendrier */}
          <div className="gantt-calendar-header">
            <div className="gantt-project-header">Projets / Tâches</div>
            <div className="gantt-days-container">
              {generateDays()}
            </div>
          </div>
          
          {/* Corps du diagramme avec projets et tâches */}
          <div className="gantt-body">
            {ganttData.map(project => {
              const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
              
              const projectStart = new Date(project.start);
              const projectEnd = new Date(project.end);
              
              const projectInSelectedMonth = (
                (projectStart.getMonth() <= selectedMonth && projectStart.getFullYear() <= selectedYear) ||
                (projectEnd.getMonth() >= selectedMonth && projectEnd.getFullYear() >= selectedYear)
              );
              
              if (!projectInSelectedMonth) return null;
              
              let startPos = 0;
              if (projectStart.getMonth() === selectedMonth && projectStart.getFullYear() === selectedYear) {
                startPos = (projectStart.getDate() - 1) / daysInMonth * 100;
              }
              
              let width = 100 - startPos;
              if (projectEnd.getMonth() === selectedMonth && projectEnd.getFullYear() === selectedYear) {
                width = (projectEnd.getDate() - Math.max(1, projectStart.getDate()) + 1) / daysInMonth * 100;
              }
              
              return (
                <div key={project.id}>
                  {/* Ligne du projet */}
                  <div className="gantt-row">
                    <div className="gantt-project-name">
                      {project.name}
                      <div className="project-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="gantt-timeline">
                      {/* Ligne de projet supprimée à la demande du client */}
                    </div>
                  </div>
                  
                  {/* Lignes des tâches du projet */}
                  {project.tasks && project.tasks.map(task => {
                    console.log('Task being processed:', task);
                    
                    const taskStart = new Date(task.start);
                    const taskEnd = new Date(task.end);
                    
                    let taskStartPos = 0;
                    if (taskStart.getMonth() === selectedMonth && taskStart.getFullYear() === selectedYear) {
                      taskStartPos = (taskStart.getDate() - 1) / daysInMonth * 100;
                    }
                    
                    let taskWidth = 100 - taskStartPos;
                    if (taskEnd.getMonth() === selectedMonth && taskEnd.getFullYear() === selectedYear) {
                      taskWidth = (taskEnd.getDate() - Math.max(1, taskStart.getDate()) + 1) / daysInMonth * 100;
                    }
                    
                    return (
                      <div key={task.id} className="gantt-row">
                        <div className="gantt-task-name">
                          <span className="task-status-icon">{getStatusIcon(task.status)}</span>
                          {task.name}
                          {task.assignedTo && (
                            <span className="task-assigned">({task.assignedTo})</span>
                          )}
                        </div>
                        <div className="gantt-timeline">
                          <div 
                            className="timeline-bar task-bar" 
                            style={{
                              left: `${taskStartPos}%`,
                              width: `${taskWidth}%`,
                              backgroundColor: getStatusColor(task.status),
                            }}
                            title={`${task.name}: ${new Date(task.start).toLocaleDateString()} - ${new Date(task.end).toLocaleDateString()}`}
                          >
                            <div 
                              className="task-progress" 
                              style={{ width: `${task.progress || 0}%` }}
                            ></div>
                            {/* Dates supprimées à la demande du client */}
                          </div>
                          
                          {/* Affichage des dépendances/antécédents si présents */}
                          {task.dependencies && task.dependencies.length > 0 && (
                            <div className="task-dependencies">
                              {task.dependencies.map(depId => {
                                const depTask = project.tasks.find(t => t.id === depId || t.id === parseInt(depId));
                                if (depTask) {
                                  return (
                                    <div key={`dep-${task.id}-${depId}`} className="dependency-indicator">
                                      ⟵ {depTask.name || depTask.title}
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttPage;