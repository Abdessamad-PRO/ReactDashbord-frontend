import { useEffect, useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import TaskService from '../../services/taskService';
import './ProjectsCharts.css';

const ProjectsChartsemployee = () => {
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [taskProgressData, setTaskProgressData] = useState([]);
  const [weeklyEvolutionData, setWeeklyEvolutionData] = useState([]);
  const [tasks, setTasks] = useState([]);

  const statusColors = {
    'En cours': '#3b82f6',
    'Terminé': '#10b981',
    'En attente': '#f43f5e'
  };

  const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#ec4899', '#f97316', '#eab308'];

  const chartConfig = {
    strokeWidth: 2,
    activeDotSize: 6,
    labelOffset: 5,
    animationDuration: 1500,
    borderRadius: 10,
    gridOpacity: 0.3
  };

  const calculateTaskProgress = (task) => {
    const today = new Date();
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);

    if (task.status === 'terminé') return 100;
    if (task.status === 'en_attente') return 0;
    if (task.status === 'en_cours' && start < end && today >= start) {
      const total = end - start;
      const elapsed = today - start;
      const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
      return Math.round(progress);
    }

    return 0;
  };

  const generateWeeklyEvolution = (tasks) => {
    const weeksMap = {};

    tasks.forEach(task => {
      const start = new Date(task.start_date);
      const week = `Sem ${getWeekNumber(start)}`;

      if (!weeksMap[week]) {
        weeksMap[week] = { date: week, 'En attente': 0, 'En cours': 0, 'Terminé': 0 };
      }

      const status = mapStatus(task.status);
      weeksMap[week][status]++;
    });

    return Object.values(weeksMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date - firstDay) / (24 * 60 * 60 * 1000);
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  };

  const mapStatus = (status) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours'; 
      case 'terminé': return 'Terminé';
      default: return 'Autre';
    }
  };

  useEffect(() => {
    TaskService.getTasksForEmployee().then(tasks => {
      setTasks(tasks); 
      // 1. PieChart
      const groupedStatus = tasks.reduce((acc, task) => {
        const key = mapStatus(task.status);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const statusArray = Object.entries(groupedStatus).map(([name, value]) => ({ name, value }));
      setTaskStatusData(statusArray);

      // 2. BarChart
      const progressData = tasks.map(task => ({
        name: task.name,
        progression: calculateTaskProgress(task)
      }));
      setTaskProgressData(progressData);

      // 3. LineChart
      const evolutionData = generateWeeklyEvolution(tasks);
      setWeeklyEvolutionData(evolutionData);
    });
  }, []);
  
const getTasksByStatus = (status) => {
  return tasks.filter(task => mapStatus(task.status) === status);
};
  return (
    <div className="charts-container">
      <div className="charts-row">
        <div className="chart-card">
          <h3>Statut de tes Tâches</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={30}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  animationDuration={chartConfig.animationDuration}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[entry.name] || COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Progression de tes Tâches</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskProgressData}>
                <CartesianGrid strokeDasharray="3 3" opacity={chartConfig.gridOpacity} vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Progression']} />
                <Legend />
                <Bar dataKey="progression" fill="#4f46e5" radius={[chartConfig.borderRadius, chartConfig.borderRadius, 0, 0]}>
                  {taskProgressData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={`rgba(79, 70, 229, ${0.5 + (entry.progression / 200)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Évolution de tes Tâches</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={chartConfig.gridOpacity} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(statusColors).map(status => (
                  <Line
                    key={status}
                    type="monotone"
                    dataKey={status}
                    stroke={statusColors[status]}
                    strokeWidth={chartConfig.strokeWidth}
                    dot={{ strokeWidth: chartConfig.strokeWidth }}
                  />
                ))}
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

export default ProjectsChartsemployee;
