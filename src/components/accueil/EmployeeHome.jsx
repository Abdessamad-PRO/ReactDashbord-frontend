import React from 'react';
import './home.css';
import { BsCheckCircleFill, BsChatLeftTextFill, BsListTask, BsArrowRight, BsBell } from 'react-icons/bs';
import { MdOutlineUpdate } from 'react-icons/md';
import { PiUsersFourDuotone } from 'react-icons/pi';
import { FaTasks, FaCalendarAlt } from 'react-icons/fa';
import { IoNotifications } from 'react-icons/io5';
import { AiFillProject } from 'react-icons/ai';

const EmployeeHome = ({ currentUser, setActiveMenu }) => {
  // Date actuelle formatée
  const currentDate = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('fr-FR', options);
  // Fonction pour gérer la navigation
  const handleNavigation = (menuId) => {
    if (setActiveMenu) {
      setActiveMenu(menuId);
    } else {
      console.log(`Navigation vers: ${menuId} (setActiveMenu non disponible)`);
    }
  };
 
  // Données simulées des activités récentes
  const recentActivities = [
    { id: 1, type: 'task_completed', description: 'Tâche "Mise à jour de la documentation" terminée', date: 'Aujourd\'hui, 14:23' },
    { id: 2, type: 'comment_added', description: 'Commentaire ajouté sur "Développement frontend"', date: 'Aujourd\'hui, 11:17' },
    { id: 3, type: 'project_joined', description: 'A rejoint le projet "Refonte du site web"', date: 'Hier, 09:45' },
    { id: 4, type: 'task_assigned', description: 'Nouvelle tâche assignée: "Amélioration UI"', date: 'Hier, 08:30' },
    { id: 5, type: 'status_update', description: 'Mise à jour statut sur "API Integration"', date: '15/05/2025, 16:20' }
  ];

  // Données simulées pour les cartes
  const quickLinks = [
    {
      id: 1,
      title: 'Mes tâches',
      icon: <FaTasks />,
      description: 'Consultez vos tâches en cours et à venir',
      menuId: 'mytasks'
    },
    {
      id: 2,
      title: 'Mes projets',
      icon: <AiFillProject />,
      description: 'Suivez l\'avancement de vos projets actuels',
      menuId: 'myprojects'
    },
    {
      id: 3,
      title: 'Calendrier',
      icon: <FaCalendarAlt />,
      description: 'Consultez vos échéances et réunions',
      menuId: 'calendar'
    },
    {
      id: 4,
      title: 'Notifications',
      icon: <IoNotifications />,
      description: 'Consultez vos alertes et informations',
      menuId: 'notifications'
    } 
  ];
  
  // Données simulées des tâches à venir pour le calendrier
  const upcomingTasks = [
    { id: 1, title: 'Finaliser le rapport mensuel', deadline: '05/06/2025', priority: 'high' },
    { id: 2, title: 'Réunion d\'équipe', deadline: '07/06/2025', priority: 'medium' },
    { id: 3, title: 'Présentation client', deadline: '10/06/2025', priority: 'high' },
    { id: 4, title: 'Mise à jour documentation', deadline: '12/06/2025', priority: 'low' },
    { id: 5, title: 'Formation React', deadline: '15/06/2025', priority: 'medium' }
  ];

  return (
    <div className="accueil-page-container">
      <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Bienvenue, <span className="manager-name">{currentUser.prenom} {currentUser.name}</span></h1>
      </div>
      
      <p className="home-welcome">
        Bienvenue, <strong>{currentUser.prenom} {currentUser.name}</strong>. Nous sommes le <strong>{formattedDate}</strong>.
      </p>
      
      <div className="home-cards-container">
        {quickLinks.map((link) => (
          <div className="home-card" key={link.id}>
            <div className="home-card-header">
              <div className="home-card-icon">
                {link.icon}
              </div>
              <h3 className="home-card-title">{link.title}</h3>
            </div>
            <p className="home-card-content">
              {link.description}
            </p>
            <div className="home-card-footer">
              <button 
                className="home-card-link"
                onClick={() => handleNavigation(link.menuId)}
              >
                Accéder <BsArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* <div className="employee-home-activities">
        <h3 className="home-card-title" style={{ marginBottom: '1rem' }}>Activités récentes</h3>
        <ul className="activity-list">
          {recentActivities.map((activity) => (
            <li className="activity-item" key={activity.id}>
              <div className="activity-icon">
                {activity.type === 'task_completed' && <BsCheckCircleFill />}
                {activity.type === 'comment_added' && <BsChatLeftTextFill />}
                {activity.type === 'project_joined' && <PiUsersFourDuotone />}
                {activity.type === 'task_assigned' && <BsListTask />}
                {activity.type === 'status_update' && <MdOutlineUpdate />}
              </div>
              <div className="activity-content">
                <div className="activity-title">{activity.description}</div>
                <div className="activity-time">{activity.date}</div>
              </div>
            </li>
          ))}
        </ul> 
      </div> */}
      
      <div className="employee-calendar-section">
        <h3 className="home-card-title" style={{ marginBottom: '1rem' }}>Calendrier des échéances</h3>
         <div className="calendar-tasks-list">
          {upcomingTasks.map((task) => ( 
            <div className="calendar-task-item" key={task.id} style={{
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '10px',
              backgroundColor: 'var(--card-bg)',
              borderLeft: `4px solid ${task.priority === 'high' ? 'var(--danger-color)' : 
                            task.priority === 'medium' ? 'var(--warning-color)' : 'var(--success-color)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ flex: '1' }}>
                <div style={{ fontWeight: '500', marginBottom: '5px', color: 'var(--text-primary)' }}>{task.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                  <FaCalendarAlt style={{ marginRight: '5px', fontSize: '12px' }} /> {task.deadline}
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: task.priority === 'high' ? 'rgba(var(--danger-rgb), 0.1)' : 
                                task.priority === 'medium' ? 'rgba(var(--warning-rgb), 0.1)' : 'rgba(var(--success-rgb), 0.1)',
                color: task.priority === 'high' ? 'var(--danger-color)' : 
                       task.priority === 'medium' ? 'var(--warning-color)' : 'var(--success-color)',
                fontWeight: '500'
              }}>
                {/* {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'} */}
              </div>
            </div>
          ))}
        </div> 
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button 
            className="home-card-link" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            onClick={() => handleNavigation('calendar')}
          >
            Voir tout le calendrier <BsArrowRight />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EmployeeHome;
