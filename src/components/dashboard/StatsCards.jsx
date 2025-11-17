import { useEffect, useState } from 'react';
import './StatsCards.css';
import TaskService from '../../services/taskService';

const StatsCards = () => { 
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,  
    totalEmployees: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupération des stats du manager connecté
        const managerStats = await TaskService.getManagersStats(); 
        const manager = managerStats[0] || {};

        // Récupération des tâches supervisées par le manager
        const tasks = await TaskService.getTasksForManager();

        setStats({
          totalProjects: manager.projects_count || 0,
          totalTasks: tasks.length || 0,
          totalEmployees: manager.team_members_count || 0
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques :', error);
      }
    };

    fetchStats();
  }, []);


  const getTrend = (index) => {
    const trends = ['+12%', '+5.3%', '-2.8%', '+32%'];
    const isPositive = !trends[index].includes('-');
    return {
      value: trends[index],
      isPositive
    };
  };

  const getIconClass = (index) => {
    const icons = ['📋', '✅', '👥', '⏱️'];
    return icons[index];
  };

  const getGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    ];
    return gradients[index];
  };

  const getLightColor = (index) => {
    const colors = [
      'rgba(59, 130, 246, 0.1)',
      'rgba(79, 70, 229, 0.1)',
      'rgba(245, 158, 11, 0.1)',
      'rgba(239, 68, 68, 0.1)'
    ];
    return colors[index];
  };

  const items = [ 
    { title: 'Nombre de Projets', value: `${stats.totalProjects || 0}`, subtitle: 'En cours' },
    { title: 'Nombre de Tâches', value: `${stats.totalTasks || 0}`, subtitle: 'À réaliser' },
    { title: 'Nombre d\'Employés', value: `${stats.totalEmployees || 0}`, subtitle: 'Dans l\'équipe' },
    
  ];

  return (
    <div className="stats-container">
      {items.map((item, index) => {
        const trend = getTrend(index);
        return (
          <div
            className="stat-card" 
            key={index}
            style={{
              borderLeft: `4px solid ${getGradient(index).split(',')[0].replace('linear-gradient(135deg', '').trim()}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: getLightColor(index),
                opacity: 0.5,
                zIndex: 0
              }}
            />
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: getGradient(index) }}>
                <span>{getIconClass(index)}</span>
              </div>
              <div
                className="stat-trend"
                style={{
                  backgroundColor: trend.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: trend.isPositive ? '#10b981' : '#ef4444'
                }}
              >
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}</span>
              </div>
            </div>
            <div className="stat-card-content">
              <h3>{item.title}</h3>
              <div className="stat-value" style={{ fontWeight: '800' }}>{item.value}</div>
              <div className="stat-subtitle">{item.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div> 
  );
}

export default StatsCards;
