import React from 'react';
import { useEffect, useState } from 'react';
import './home.css';
import { BsArrowRight } from 'react-icons/bs';
import { FaUsers, FaUserTie, FaCog, FaChartLine, FaServer, FaShieldAlt, FaBell } from 'react-icons/fa';
import ProjectService from '../../services/projectService';

const AdminHome = ({ currentUser, setActiveMenu }) => {
  const [realStats, setRealStats] = useState({
    employees: 0,
    managers: 0,
    projects: 0,
    tasks: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projectsData = await ProjectService.getProjectsForManager();
        
        // Extraire les managers uniques 
        const uniqueManagers = new Set();
        // Extraire les employés uniques (assignés aux tâches)
        const uniqueEmployees = new Set();
        let totalTasks = 0;

        projectsData.forEach(project => {
          // Compter les managers
          if (project.manager) {
            uniqueManagers.add(project.manager.id);
          }
          
          // Compter les tâches et employés
          if (project.tasks && project.tasks.length > 0) {
            totalTasks += project.tasks.length;
            project.tasks.forEach(task => {
              if (task.assigned_user) {
                uniqueEmployees.add(task.assigned_user.id);
              }
            });
          }
        });

        setRealStats({
          employees: uniqueEmployees.size,
          managers: uniqueManagers.size,
          projects: projectsData.length,
          tasks: totalTasks
        });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Données simulées des statistiques
  const platformStats = [
    { id: 1, value: realStats.employees, label: 'Employés' },
    { id: 2, value: realStats.managers, label: 'Managers' },
    { id: 3, value: realStats.projects, label: 'Projets' }, 
    { id: 4, value: realStats.tasks, label: 'Tâches' }
  ];

  // Données simulées pour les actions rapides
  const quickActions = [
    {
      id: 1,
      title: 'Gestion des employés',
      icon: <FaUsers />,
      menuId: 'users'
    },
    {
      id: 2,
      title: 'Gestion des managers',
      icon: <FaUserTie />,
      menuId: 'managers'
    },
    {
      id: 3,
      title: 'Paramètres',
      icon: <FaCog />,
      menuId: 'settings'
    },
    {
      id: 4,
      title: 'Sécurité',
      icon: <FaShieldAlt />,
      menuId: 'settings'
    },
    {
      id: 5,
      title: 'Notifications',
      icon: <FaBell />,
      menuId: 'settings'
    },
    {
      id: 6,
      title: 'Système',
      icon: <FaServer />,
      menuId: 'settings'
    }
  ];

  // Données simulées pour les cartes
  const adminInsights = [
    {
      id: 1,
      title: 'Performance Système',
      icon: <FaChartLine />,
      description: 'Tous les indicateurs de performance sont au vert. La charge du système est stable.',
      menuId: 'settings'
    },
    {
      id: 2,
      title: 'Dernières inscriptions',
      icon: <FaUsers />,
      description: '12 nouveaux utilisateurs ont rejoint la plateforme cette semaine.',
      menuId: 'users'
    },
    {
      id: 3,
      title: 'Sécurité',
      icon: <FaShieldAlt />,
      description: 'Aucune alerte de sécurité. Dernière mise à jour des protocoles: hier.',
      menuId: 'settings'
    },
    {
      id: 4,
      title: 'Maintenance',
      icon: <FaServer />,
      description: 'Prochaine maintenance planifiée: 15/06/2025 à 23:00.',
      menuId: 'settings'
    }
  ];

  // Fonction pour gérer la navigation en utilisant setActiveMenu
  const handleNavigation = (menuId) => {
    if (setActiveMenu) {
      setActiveMenu(menuId);
    } else {
      console.log(`Navigation vers: ${menuId} (setActiveMenu non disponible)`);
    }
  };

  return (
    <div className="accueil-page-container">
      <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Administration Système</h1>
      </div>
      
      <p className="home-welcome">
        Bonjour, <strong>{currentUser.prenom} {currentUser.name}</strong>. Bienvenue sur le panneau d'administration.
      </p>
      
      <div className="manager-stats-row">
        {platformStats.map((stat) => (
          <div className="manager-stat-card" key={stat.id}> 
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div> 
      
      <h3 className="home-card-title" style={{ marginBottom: '1rem' }}>Actions rapides</h3>
      <div className="admin-quick-actions">
        {quickActions.map((action) => (
          <button 
            className="quick-action-btn" 
            key={action.id}
            onClick={() => handleNavigation(action.menuId)}
          >
            <div className="quick-action-icon">
              {action.icon}
            </div>
            <div className="quick-action-title" style={{ 
              fontSize: '14px', 
              fontWeight: '500',
              color: 'var(--text-primary)',
              textAlign: 'center',
              marginTop: '8px',
              whiteSpace: 'nowrap'
            }}>
              {action.title}
            </div>
          </button>
        ))}
      </div>
      
    
      </div>
    </div>
  );
};

export default AdminHome;
