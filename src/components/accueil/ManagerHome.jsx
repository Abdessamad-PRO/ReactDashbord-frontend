import React from 'react';
import './home.css';
import { FaTasks, FaUsers, FaProjectDiagram, FaBell, FaRegCalendarCheck, FaUserTie, FaLink } from 'react-icons/fa';
import { BsArrowRight, BsCheckCircleFill, BsBell, BsExclamationCircleFill, BsLightningCharge } from 'react-icons/bs';
import { MdOutlineTimer, MdNotificationsActive } from 'react-icons/md';
import { HiOutlineBadgeCheck, HiOutlineStatusOnline } from 'react-icons/hi';
import { AiOutlineTeam, AiOutlineProject, AiOutlineSchedule } from 'react-icons/ai';
import { IoIosStats } from 'react-icons/io';
import { GiProgression } from 'react-icons/gi';
import ProjectService from '../../services/projectService';
import TaskService from '../../services/taskService';
import { useEffect, useState } from 'react';
import ChatButton from '../chatbox/ChatButton'; 
const ManagerHome = ({ currentUser, setActiveMenu }) => {

  const [teamStats, setTeamStats] = useState([
    { id: 1, value: 0, label: 'Membres d\'équipe' }, 
    { id: 2, value: 0, label: 'Tâches en cours' },
    { id: 3, value: 0, label: 'Projets' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      // Récupérer les projets du manager
      const projects = await ProjectService.getProjectsForManager();
      
      // Récupérer les tâches du manager
      const tasks = await TaskService.getTasksForManager();
      
      // Récupérer les employés
      const employees = await TaskService.getemployees();
      
      // Filtrer les tâches en cours
      const tasksInProgress = tasks.filter(task => task.status === 'en_cours');
      
      setTeamStats([
        { id: 1, value: employees.length, label: 'Membres d\'équipe' },
        { id: 2, value: tasksInProgress.length, label: 'Tâches en cours' },
        { id: 3, value: projects.length, label: 'Projets' }
      ]);
      
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);

  // Fonction pour gérer la navigation
  const handleNavigation = (menuId) => {
    // Utilisation de la fonction setActiveMenu passée en props pour changer de page
    if (menuId === '/tasks') {
      setActiveMenu('tasks');
    } else if (menuId === '/team') {
      setActiveMenu('users');
    } else if (menuId === '/projects') {
      setActiveMenu('projects');
    }
  };

  // Date actuelle formatée
  const currentDate = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('fr-FR', options);
  
  // Données simulées des notifications du jour
  const todayNotifications = [
    { id: 1, message: 'Réunion d\'équipe à 14h30', priority: 'high' },
    { id: 2, message: 'Deadline projet Marketing approche (3 jours restants)', priority: 'high' },
    { id: 3, message: 'Nouvelle candidature pour le poste de développeur', priority: 'medium' },
    { id: 4, message: 'Rapport hebdomadaire à soumettre avant 18h', priority: 'medium' }
  ];
  
  // Données simulées des tâches à faire aujourd'hui
  const todayTasks = [
    { id: 1, title: 'Révision du plan marketing Q3', completed: false },
    { id: 2, title: 'Entretien avec candidat développeur frontend', completed: false },
    { id: 3, title: 'Validation maquettes application mobile', completed: true },
    { id: 4, title: 'Mise à jour documentation API', completed: false }
  ]; 
  
  // Données simulées des projets traités aujourd'hui
  const todayProjects = [
    { id: 1, name: 'Refonte Intranet', progress: 65, updates: 3 },
    { id: 2, name: 'Application Mobile v2', progress: 42, updates: 5 },
    { id: 3, name: 'Intégration API Partenaires', progress: 89, updates: 2 }
  ];

  // Données simulées pour les cartes
  const managerLinks = [
    {
      id: 1,
      title: 'Gérer les tâches',
      icon: <FaTasks />,
      description: 'Assignez et suivez les tâches de votre équipe',
      link: '/tasks'
    },
    {
      id: 2,
      title: 'Mon équipe',
      icon: <FaUsers />,
      description: 'Gérez les membres de votre équipe',
      link: '/team'
    },
    {
      id: 3,
      title: 'Projets',
      icon: <FaProjectDiagram />,
      description: 'Suivez la progression des projets de votre équipe',
      link: '/projects'
    }
  ];

  // Données simulées des membres de l'équipe
  const teamMembers = [
    { id: 1, name: 'Sophie Martin', role: 'Développeur Frontend', status: 'online', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 2, name: 'Thomas Dubois', role: 'Développeur Backend', status: 'busy', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 3, name: 'Emma Lefebvre', role: 'Designer UI/UX', status: 'online', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 4, name: 'Lucas Bernard', role: 'Testeur QA', status: 'offline', avatar: 'https://randomuser.me/api/portraits/men/85.jpg' }
  ];

  return ( 
    <div className="accueil-page-container">
      <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Bienvenue, <span className="manager-name">{currentUser.prenom} {currentUser.name}</span></h1>
        <p className="home-date">{formattedDate}</p>
      </div>

      <p className="home-welcome">
        Nous sommes heureux de vous revoir sur votre espace manager. Voici un résumé de votre journée.
      </p>
      
      <div className="manager-stats-row"> 
        {loading ? (
    <div className="loading-stats">Chargement des statistiques...</div>
  ) : (
    teamStats.map((stat, index) => (
      <div className="manager-stat-card" key={stat.id}>
        <div className="stat-icon">
          {index === 0 ? <FaUsers /> : 
           index === 1 ? <FaTasks /> : 
           index === 2 ? <AiOutlineProject /> : 
           <IoIosStats />}
        </div>
        <div className="stat-value">{stat.value}</div>
        <div className="stat-label">{stat.label}</div>
      </div>
    ))
  )}
      </div>
      
      <div className="manager-dashboard-grid">
        {/* Colonne de gauche */}
        <div className="dashboard-column">
          <div className="dashboard-section">
            <h3 className="section-title"><MdNotificationsActive className="section-icon" />Notifications du jour</h3>
            <div className="notifications-list">
              {todayNotifications.map((notif) => (
                <div className={`notification-item priority-${notif.priority}`} key={notif.id}>
                  <div className="notification-icon">
                    {notif.priority === 'high' ? <BsExclamationCircleFill /> : <BsBell />}
                  </div>
                  <div className="notification-message">{notif.message}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* <div className="dashboard-section">
            <h3 className="section-title"><FaRegCalendarCheck className="section-icon tasks-section-icon" />À faire aujourd'hui</h3>
            <div className="today-tasks-list">
              {todayTasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                    {task.completed && <BsCheckCircleFill />}
                  </div>
                  <div className={`task-title ${task.completed ? 'completed' : ''}`}>{task.title}</div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
        
        {/* Colonne de droite */}
        <div className="dashboard-column">
          <div className="dashboard-section">
            <h3 className="section-title"><GiProgression className="section-icon projects-section-icon" />Projets traités aujourd'hui</h3>
            <div className="today-projects-list">
              {todayProjects.map((project) => (
                <div className="project-item" key={project.id}>
                  <div className="project-header">
                    <div className="project-name">{project.name}</div>
                    <div className="project-updates">{project.updates} mises à jour</div>
                  </div>
                  <div className="project-progress-container">
                    <div className="project-progress-bar" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <div className="project-progress-value">{project.progress}%</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* <div className="dashboard-section">
            <h3 className="section-title"><AiOutlineTeam className="section-icon team-section-icon" />Membres de l'équipe</h3>
            <div className="team-list-compact">
              {teamMembers.map((member) => (
                <div className="team-member" key={member.id}>
                  <img src={member.avatar} alt={member.name} className="team-member-avatar" />
                  <div className="team-member-info">
                    <div className="team-member-name">{member.name}</div>
                    <div className="team-member-role">{member.role}</div>
                  </div>
                  <div className={`team-member-status ${member.status !== 'online' ? `status-${member.status}` : ''}`}>
                    {member.status === 'online' ? <><HiOutlineStatusOnline className="status-icon" /> En ligne</> : 
                     member.status === 'busy' ? <><MdOutlineTimer className="status-icon" /> Occupé</> : 
                     <><BsLightningCharge className="status-icon" /> Hors ligne</>}
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
      
      <h3 className="section-title" style={{ marginTop: '2rem' }}><FaLink className="section-icon" />Liens rapides</h3>
      <div className="home-cards-container">
        {managerLinks.map((link) => (
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
                onClick={() => handleNavigation(link.link)}
              >
                Accéder <BsArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default ManagerHome;
