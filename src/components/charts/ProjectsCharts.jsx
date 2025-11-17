import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import ProjectService from '../../services/projectService';
import TaskService from '../../services/taskService';
import './ProjectsCharts.css';

const ProjectsCharts = () => {
  const [projects, setProjects] = useState([]);  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour calculer la progression d'un projet basée sur ses tâches
  const calculateProjectProgress = (projectId, allTasks) => {
    const projectTasks = allTasks.filter(task => task.project_id === projectId);
    
    if (projectTasks.length === 0) {
      return 0; // Aucune tâche = 0% de progression
    }

    const completedTasks = projectTasks.filter(task => task.status === 'terminé').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }; 

  // Fonction pour mapper les statuts de l'API vers les statuts d'affichage
  const mapStatus = (status) => {
    switch (status) {
      case 'en_cours':
        return 'En cours';
      case 'en_attente':
        return 'En attente';
      case 'terminé':
        return 'Terminé';
      default:
        return status;
    }
  };

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupération des projets du manager
        const projectsResponse = await ProjectService.getProjectsForManager();
        
        // Récupération des tâches du manager  
        const tasksResponse = await TaskService.getTasksForManager();
        
        // Traitement des projets avec calcul de progression
        const processedProjects = projectsResponse.map(project => ({
          ...project,
          status: mapStatus(project.status), 
          // Utiliser la progression de la BDD ou calculer si pas disponible
          progress: project.progress || calculateProjectProgress(project.id, tasksResponse)
        }));

        // Traitement des tâches
        const processedTasks = tasksResponse.map(task => ({
          ...task,
          status: mapStatus(task.status),
          project: task.project ? task.project.name : 'Sans projet'
        }));

        setProjects(processedProjects);  
        setTasks(processedTasks);
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Données pour le graphique de statut des projets
  const getProjectStatusData = () => {
    const statusCount = { 'En cours': 0, 'Terminé': 0, 'En attente': 0 };
    projects.forEach(project => {
      statusCount[project.status] = (statusCount[project.status] || 0) + 1;
    });

    return Object.keys(statusCount).map(status => ({
      name: status,
      value: statusCount[status]
    })).filter(item => item.value > 0); // Ne montrer que les statuts avec des projets
  };

  // Données pour le graphique de progression des projets
  const getProjectProgressData = () => {
    return projects.map(project => ({
      name: project.name.length > 12 ? project.name.substring(0, 12) + '...' : project.name,
      progression: project.progress,
      fullName: project.name // Pour le tooltip
    })).slice(0, 6); // Limiter à 6 projets pour une meilleure lisibilité
  };

  // Données pour le graphique de répartition des tâches par projet
  const getTasksDistributionData = () => {
    const tasksByProject = {};
    tasks.forEach(task => {
      if (task.project) {
        tasksByProject[task.project] = (tasksByProject[task.project] || 0) + 1;
      }
    });
    
    // Trier les projets par nombre de tâches décroissant et limiter à 5 projets
    return Object.keys(tasksByProject)
      .map(project => ({
        name: project.length > 12 ? project.substring(0, 12) + '...' : project,
        tasks: tasksByProject[project],
        fullName: project // Pour le tooltip
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5);
  };

  // Fonction pour filtrer les tâches par statut
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };


  // Données pour le graphique d'évolution des tâches dans le temps
  const getTasksProgressionData = () => {
    // Calculer les données réelles basées sur les dates des tâches
    const today = new Date();
    const weeks = [];
    
    // Générer les 5 dernières semaines
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const statusCount = {
        'En attente': weekTasks.filter(t => t.status === 'En attente').length,
        'En cours': weekTasks.filter(t => t.status === 'En cours').length,
        'Terminé': weekTasks.filter(t => t.status === 'Terminé').length
      };

      weeks.push({
        date: `Sem ${5-i}`,
        ...statusCount
      });
    } 

    return weeks;
  };

  // Couleurs pour les graphiques - Palette plus moderne
  const statusColors = {
    'En cours': '#3b82f6',  // Bleu vif
    'Terminé': '#10b981',  // Vert plus vif
    'En attente': '#f43f5e'  // Rouge plus vibrant
  };

  // Palette de couleurs moderne avec des teintes plus harmonieuses
  const COLORS = [
    '#4f46e5', // Indigo
    '#0ea5e9', // Bleu ciel
    '#8b5cf6', // Violet
    '#ec4899', // Rose
    '#f97316', // Orange
    '#eab308'  // Jaune
  ];
  
  // Configurations des graphiques pour un style cohérent
  const chartConfig = {
    strokeWidth: 2,
    activeDotSize: 6,
    labelOffset: 5,
    animationDuration: 1500,
    borderRadius: 10,
    gridOpacity: 0.3
  };

  // Gestion du chargement et des erreurs
  if (loading) {
    return (
      <div className="charts-container">
        <div className="loading-spinner">
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="charts-container">
        <div className="no-data-message">
          <p>Aucun projet trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <div className="charts-row">
        <div className="chart-card">
          <h3>Statut des Projets ({projects.length})</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={getProjectStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={30}
                  outerRadius={80}
                  paddingAngle={3}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  animationDuration={chartConfig.animationDuration}
                  animationBegin={0}
                >
                  {getProjectStatusData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={statusColors[entry.name] || COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={1}
                      cornerRadius={3}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    padding: '10px 14px',
                  }} 
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center" 
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontWeight: 500
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Progression des Projets</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getProjectProgressData()}
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  opacity={chartConfig.gridOpacity} 
                  vertical={false}
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [`${value}%`, 'Progression']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName || label;
                  }}
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    padding: '10px 14px'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontWeight: 500
                  }}
                />
                <Bar 
                  dataKey="progression" 
                  name="Progression (%)" 
                  fill="#4f46e5"
                  radius={[chartConfig.borderRadius, chartConfig.borderRadius, 0, 0]}
                  animationDuration={chartConfig.animationDuration}
                  barSize={30}
                >
                  {getProjectProgressData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`rgba(79, 70, 229, ${0.5 + (entry.progression / 200)})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Répartition des Tâches par Projet ({tasks.length} tâches)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getTasksDistributionData()}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                layout="vertical"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  opacity={chartConfig.gridOpacity}
                  horizontal={false}
                />
                <XAxis 
                  type="number" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [`${value}`, 'Nombre de tâches']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName || label;
                  }}
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    padding: '10px 14px'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontWeight: 500
                  }}
                />
                <Bar 
                  dataKey="tasks" 
                  name="Nombre de tâches" 
                  fill="#8884d8"
                  radius={[5, 5, 5, 5]}
                  animationDuration={chartConfig.animationDuration}
                  barSize={30}
                >
                  {getTasksDistributionData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Évolution des Tâches dans le Temps</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={getTasksProgressionData()}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  opacity={chartConfig.gridOpacity}
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    padding: '10px 14px'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontWeight: 500
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="En attente" 
                  stroke={statusColors['En attente']} 
                  strokeWidth={chartConfig.strokeWidth}
                  dot={{ r: 4, strokeWidth: 1, fill: '#fff' }}
                  activeDot={{ r: chartConfig.activeDotSize, strokeWidth: 1 }}
                  animationDuration={chartConfig.animationDuration}
                />
                <Line 
                  type="monotone" 
                  dataKey="En cours" 
                  stroke={statusColors['En cours']} 
                  strokeWidth={chartConfig.strokeWidth}
                  dot={{ r: 4, strokeWidth: 1, fill: '#fff' }}
                  activeDot={{ r: chartConfig.activeDotSize, strokeWidth: 1 }}
                  animationDuration={chartConfig.animationDuration + 200}
                />
                <Line 
                  type="monotone" 
                  dataKey="Terminé" 
                  stroke={statusColors['Terminé']} 
                  strokeWidth={chartConfig.strokeWidth}
                  dot={{ r: 4, strokeWidth: 1, fill: '#fff' }}
                  activeDot={{ r: chartConfig.activeDotSize, strokeWidth: 1 }}
                  animationDuration={chartConfig.animationDuration + 400}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="tasks-summary fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="summary-header">
                <h2>Aperçu des Tâches</h2>
              </div>
              <div className="summary-cards">
                <div className="summary-card pending">
                  <h3>À faire</h3>
                  <div className="summary-count">{getTasksByStatus('En attente').length}</div>
                </div> 
                <div className="summary-card in-progress">
                  <h3>En cours</h3>
                  <div className="summary-count">{getTasksByStatus('En cours').length}</div>
                </div>
                <div className="summary-card completed">
                  <h3>Terminé</h3>
                  <div className="summary-count">{getTasksByStatus('Terminé').length}</div>
                </div>
              </div>
            </div>
    </div>
    
  );
};

export default ProjectsCharts;