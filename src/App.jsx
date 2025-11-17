import { useState, useEffect } from 'react'
import './App.css'
import './styles.css'
import './theme.css'
import './auth.css'
import './profile.css'
import './sidebar.css'
import './dashboard.css'
import './components.css' 
import './projects.css' 
import './reports.css'
import './welcome.css'
import logoDark from './assets/images/dashboard logo.png'
import logoLight from './assets/images/dashboard logo white.png'
import Login from './components/auth/Login'
import ForgotPassword from './components/auth/ForgotPassword'
import Welcome from './components/welcome/Welcome'
import RegisterForm from './components/welcome/RegisterForm'
import StatsCards from './components/dashboard/StatsCards'
import ProfileButton from './components/profile/ProfileButton'
import ProjectsList from './components/projects/ProjectsList'
import TasksManager from './components/tasks/TasksManager'
import ProjectsChartsemployee from './components/charts/ProjectsChartsemployee'
import ProjectsCharts from './components/charts/ProjectsCharts'
import ReportsDashboard from './components/reports/ReportsDashboard'
import ThemeToggle from './components/theme/ThemeToggle'
import NotificationCenter from './components/notifications/NotificationCenter'
import NotificationsPage from './components/notifications/NotificationsPage'
import ProfilePage from './components/profile/ProfilePage';
import AdminProfilePage from './components/profile/AdminProfilePage';
import ChatIcon from './components/messaging/ChatIcon'
import EmployeeForm from './components/users/EmployeeForm'
import EmployeesList from './components/users/EmployeesList'
import ManagersList from './components/users/ManagersList'
import EmployeeHome from './components/accueil/EmployeeHome'
import ManagerHome from './components/accueil/ManagerHome'
import AdminHome from './components/accueil/AdminHome'
import Calendar from './components/calendar/Calendar'
import ManagerCalendar from './components/calendar/ManagerCalendar'
import ExportPage from './components/exports/ExportPage';
import GanttPage from './components/gantt/GanttPage';
import MyTasks from './components/tasks/MyTasks';
import ChatButton from './components/chatbox/ChatButton';
import { userData, statsData, projectsData, tasksData, usersData } from './data/mockData'
import api from './axios'
import { formatRole } from './utils'
import { CgProfile } from "react-icons/cg";
import { TbLayoutDashboard } from "react-icons/tb";
import { AiFillProject } from "react-icons/ai";
import { FaTasks } from "react-icons/fa";
import { PiUsersThreeDuotone, PiExportBold } from "react-icons/pi";
import { GrUserManager } from "react-icons/gr";
import { IoSettingsOutline, IoNotifications } from "react-icons/io5";
import { RiResetRightLine } from "react-icons/ri";
import { AiOutlineSecurityScan, AiOutlineHome } from "react-icons/ai";
import { PiPaintBrushDuotone } from "react-icons/pi";
import { LuCalendarDays, LuChartGantt } from "react-icons/lu";
// Utilisé seulement pour le state local
const mockData = {
  user: userData
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(userData.role || null)
  const [activeMenu, setActiveMenu] = useState('accueil')
  const [isLoading, setIsLoading] = useState(true)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [projects, setProjects] = useState(projectsData)
  const [tasks, setTasks] = useState(tasksData)
  const [users, setUsers] = useState(usersData)
  // Filtrer uniquement les vrais managers pour éviter les doublons
  const [managers, setManagers] = useState(() => {
    const managersList = usersData.filter(user => user.role === 'manager');
    // S'assurer qu'il n'y a pas de doublons
    return managersList.filter((manager, index, self) => 
      index === self.findIndex((m) => m.id === manager.id)
    );
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [managerToDelete, setManagerToDelete] = useState(null)
  const [currentUser, setCurrentUser] = useState(userData)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [formError, setFormError] = useState('');
  const [sidebarAvatarUrl, setSidebarAvatarUrl] = useState(userData.avatarUrl || '');
  
  // Effet pour mettre à jour l'URL de l'avatar de la sidebar lorsque currentUser.avatarUrl change
  useEffect(() => { 
    if (currentUser.avatarUrl) {
      // Ajouter un timestamp à l'URL pour forcer le rafraîchissement de l'image
      const timestamp = new Date().getTime();
      // Vérifier si l'URL contient déjà un paramètre de requête
      const separator = currentUser.avatarUrl.includes('?') ? '&' : '?';
      setSidebarAvatarUrl(`${currentUser.avatarUrl}${separator}t=${timestamp}`);
    } else {
      setSidebarAvatarUrl('');
    }
  }, [currentUser.avatarUrl]);

  // Surveiller les changements de thème
  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light')
    } 
    
    // Observer les changements d'attribut sur l'élément HTML
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          handleThemeChange()
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => { 
    const checkAuthentication = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Vérifier que le token est toujours valide avec Laravel Sanctum/Passport
          const response = await api.get('/user');
          if (response.data) {
            const user = response.data;
            setCurrentUser(user);
            setUserRole(user.role);
            setIsAuthenticated(true);
            // Mettre à jour les données locales si elles ont changé
            localStorage.setItem('user_data', JSON.stringify(user));
          }
        } catch (error) {
          console.error('Token invalide:', error);
          // Token invalide, nettoyer le localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setIsAuthenticated(false);
          setCurrentUser(null);
          setUserRole(null);
        }
      }
      setIsLoading(false);
    }

    checkAuthentication();
  }, []);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setFormError('');
    
    try {
      console.log('Tentative de connexion avec:', credentials);
      // Utiliser le service d'authentification pour la connexion
      const response = await api.post('/login', {
        email: credentials.email,
        password: credentials.password,
      });
      console.log('Réponse de connexion:', response.data);
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      // Mettre à jour l'état de l'application
      setIsAuthenticated(true);
      setUserRole(response.data.user.role);
      setCurrentUser(response.data.user);
      setShowForgotPassword(false);
      setShowWelcome(false);
      setShowRegisterForm(false);
    } catch (error) {
      console.error('Erreur de connexion détaillée:', error);
      console.error('Réponse d\'erreur:', error.response?.data);
      console.error('Statut d\'erreur:', error.response?.status);
      
      // Afficher le message d'erreur renvoyé par Laravel
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Informer le serveur Laravel de la déconnexion
      await api.post('/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage et l'état local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Réinitialiser tous les états importants pour éviter les écrans blancs
      setCurrentUser(null);
      setUserRole(null);
      setActiveMenu('dashboard');
      
      // Rafraîchir la page pour forcer une réinitialisation complète
      // C'est la solution la plus simple et fiable pour éviter les problèmes d'état
      window.location.href = '/'; // Redirection vers la racine de l'application
      
      // Note: le code après window.location.href ne sera pas exécuté
      // mais nous le laissons par précaution
      setIsAuthenticated(false);
      setShowWelcome(true);
      setShowRegisterForm(false);
      setShowForgotPassword(false);
      setIsLoading(false);
    }
  };
  
  const handleEditProfile = async (updatedUserData, profileImage = null) => {
    setIsLoading(true);
    
    try {
      // Appeler le service d'authentification pour mettre à jour le profil dans la base de données
      const response = await api.put('/profile', updatedUserData, {
        headers: {
          'Content-Type': profileImage ? 'multipart/form-data' : 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log('Réponse de mise à jour du profil:', response.data);
      
      if (response.data.success || response.status === 200) {
        // Mettre à jour l'état currentUser avec les nouvelles données
        setCurrentUser(updatedUserData);
        
        // Mettre à jour les données utilisateur dans le localStorage pour assurer la persistance
        // et la synchronisation avec d'autres composants qui utilisent ces données
        const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
        const mergedUserData = { ...storedUser, ...updatedUserData };
        localStorage.setItem('user_data', JSON.stringify(mergedUserData));
          
        // Mettre à jour les données de l'utilisateur dans mockData également si nécessaire
        if (mockData.user) {
          mockData.user = updatedUserData;
        }
      } else { 
        console.error('La mise à jour du profil a échoué:', response.data);
        // Vous pourriez ajouter ici une notification à l'utilisateur
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      // Vous pourriez ajouter ici une notification à l'utilisateur
    } finally {
      setIsLoading(false);
    }
  } 
  
  // Effets pour simuler le chargement initial
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [])

  // Fonction pour formater les icônes du menu
  const renderMenuIcon = (icon) => {
    return <span className="menu-icon">{icon}</span>
  }

  const getMenuItems = () => {
    // Initialiser la liste des items de menu
    const items = []
    
    // Accueil (pour tous les utilisateurs) - toujours en première position
    items.push({ id: 'accueil', label: 'Accueil', icon: <AiOutlineHome /> })
    
    // Tableau de bord (uniquement pour manager)
    if (userRole === 'manager') {
      items.push({ id: 'dashboard', label: 'Tableau de bord', icon:<TbLayoutDashboard /> })
    }
    // tableau de board uniquement pour employe
    items.push({ id: 'employee-dashboard', label: 'Tableau de bord', icon:<TbLayoutDashboard /> })
    if (userRole === 'manager' || userRole === 'admin') {
      items.pop({ id:'employee-dashboard' , label: 'Tableau de bord', icon:<TbLayoutDashboard /> })
    }
    // Diagramme de Gantt pour les managers
    if (userRole === 'manager') {
      items.push({ id: 'gantt', label: 'Diagramme de Gantt', icon: <LuChartGantt /> })
    }

    // Projets (uniquement pour manager)
    if (userRole === 'manager') {
      items.push({ id: 'projects', label: 'Projets', icon:<AiFillProject /> })
    }


    // Tâches (pour manager uniquement - gestion globale)
    if (userRole === 'manager') {
      items.push({ id: 'tasks', label: 'Tâches', icon: <FaTasks /> })
    }
    
    // Calendrier pour les managers
    if (userRole === 'manager') {
      items.push({ id: 'managercalendar', label: 'Calendrier', icon: <LuCalendarDays /> })
    }

    // Mes Projets (pour les employés)
    items.push({ id: 'myprojects', label: 'Mes Projets', icon: <AiFillProject /> })

    // Mes Tâches (pour les employés)
    items.push({ id: 'mytasks', label: 'Mes Tâches', icon: <FaTasks /> })

    // Calendrier pour les employés
      items.push({ id: 'calendar', label: 'Calendrier', icon: <LuCalendarDays /> })
   
    if (userRole === 'manager'|| userRole === 'admin') {
      items.pop({ id: 'calendar', label: 'Calendrier', icon: <LuCalendarDays /> })
    }

    // retirer Mes Tâches (pour les managers et admin)
    if (userRole === 'manager'|| userRole === 'admin') {
      items.pop({ id: 'mytasks', label: 'Mes Tâches', icon: <FaTasks /> })
    }
    
    // retirer Mes Projets (pour les managers et admin)
    if (userRole === 'manager'|| userRole === 'admin') {
      items.pop({ id: 'myprojects', label: 'Mes Projets', icon: <AiFillProject /> })
    }
    
    // Employés (uniquement pour manager et admin)
    if (userRole === 'manager' || userRole === 'admin') {
      items.push({ id: 'users', label: 'Employés', icon: <PiUsersThreeDuotone /> })
    }
    
    // Managers (uniquement pour admin)
  if (userRole === 'admin') {
    items.push({ id: 'managers', label: 'Managers', icon: <GrUserManager /> })
  }
  
   // Export (uniquement pour manager)
   if (userRole === 'manager') {
    items.push({ id: 'export', label: 'Export', icon:<PiExportBold /> })
  }
  // Mon Profil (pour tous les utilisateurs)
  items.push({ id: 'profile', label: 'Mon Profil', icon: <CgProfile /> })
  
  
  // Admin uniquement - en fin de liste
  if (userRole === 'admin') {
    items.push({ id: 'settings', label: 'Paramètres', icon: <IoSettingsOutline /> })
    // Élément Permissions supprimé
  }

  return items
}  

  // Gestionnaires de projets et tâches
  const handleEditProject = (projectData) => {
    // Si nous recevons un objet de projet complet, nous mettons à jour le projet
    if (typeof projectData === 'object') {
      setProjects(prevProjects => {
        // Si le projet existe déjà, on le met à jour
        if (prevProjects.find(p => p.id === projectData.id)) {
          return prevProjects.map(project => project.id === projectData.id ? projectData : project);
        } 
        // Sinon, on ajoute un nouveau projet
        else {
          return [...prevProjects, projectData];
        }
      });
    } 
    // Si nous recevons juste un ID, c'est un comportement legacy
    else {
      console.log(`Édition du projet ${projectData}`);
    }
  };

  const handleDeleteProject = (projectId) => { 
    console.log('Supprimer le projet:', projectId);
    setProjects(projects.filter(p => p.id !== projectId));
  }

  const handleAssignTask = (taskData) => { 
    console.log('Nouvelle tâche ajoutée:', taskData);
    // Ajouter la tâche à la liste des tâches
    setTasks(prevTasks => {
      // Vérifier si la tâche existe déjà
      if (prevTasks.find(t => t.id === taskData.id)) {
        return prevTasks.map(task => task.id === taskData.id ? taskData : task);
      } 
      // Sinon, ajouter la nouvelle tâche
      else {
        return [...prevTasks, taskData];
      }
    });
  }

  const handleEditTask = (taskData) => {
    // Si nous recevons un objet de tâche complet, nous mettons à jour la tâche
    if (typeof taskData === 'object') {
      setTasks(prevTasks => {
        // Si la tâche existe déjà, on la met à jour
        if (prevTasks.find(t => t.id === taskData.id)) {
          return prevTasks.map(task => task.id === taskData.id ? taskData : task);
        } 
        // Sinon, on ajoute une nouvelle tâche
        else {
          return [...prevTasks, taskData];
        }
      });
    } 
    // Si nous recevons juste un ID, c'est un comportement legacy
    else {
      console.log(`Édition de la tâche ${taskData}`);
    }
  };

  const handleDeleteTask = (taskId) => {
    console.log('Supprimer la tâche:', taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  }

  // Gestionnaire pour supprimer un employé
  const handleDeleteEmployee = (employeeId) => {
    console.log('Supprimer l\'employé:', employeeId);
    setUsers(users.filter(u => u.id !== employeeId));
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  }
  
  // Gestionnaire pour supprimer un manager
  const handleDeleteManager = (managerId) => {
    console.log('Supprimer le manager:', managerId);
    setManagers(managers.filter(m => m.id !== managerId));
    // Mettre à jour également la liste globale des utilisateurs
    setUsers(users.filter(u => u.id !== managerId));
    setShowDeleteConfirm(false);
    setManagerToDelete(null);
  }

  const handleTaskStatusChange = (taskId, newStatus) => {
    console.log('Changer statut tâche:', taskId, 'vers', newStatus);
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  }
  
  // Fonction pour basculer l'état de la sidebar sur mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Gestionnaire pour naviguer vers le formulaire d'inscription
  const handleRegisterClick = () => {
    setShowWelcome(false);
    setShowRegisterForm(true);
  };

  // Gestionnaire pour naviguer vers la page de connexion
  const handleLoginClick = () => {
    setShowWelcome(false)
    setShowRegisterForm(false)
    setShowForgotPassword(false)
  };

  // Gestionnaire pour retourner à la page d'accueil
  const handleBackToWelcome = () => {
    setShowWelcome(true)
    setShowRegisterForm(false)
    setShowForgotPassword(false)
  };

  // Gestionnaire pour traiter l'inscription d'un manager
  const handleRegisterSubmit = (formData) => {
    setIsLoading(true);
    // Ici, vous pourriez envoyer les données à votre API
    console.log('Données du formulaire d\'inscription:', formData);
    
    // Simuler le temps de traitement
    setTimeout(() => {
      // Rediriger vers la page de connexion après inscription réussie
      setShowRegisterForm(false);
      setIsLoading(false);
    }, 1500);
  };

  // Le rendu principal commence ici
  return (
    <div className="app">
      {isLoading && (
        <div className="loading-screen">
          <div className="corner-circle-1"></div>
          <div className="corner-circle-2"></div>
          <div className="spinner">
            <div className="spinner-inner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
            </div>
          </div>
          <p>Chargement...</p>
        </div>
      )}
      
      {showWelcome ? (
        <Welcome onLogin={handleLoginClick} onRegister={handleRegisterClick} theme={theme} />
      ) : showRegisterForm ? (
        <RegisterForm onBack={handleBackToWelcome} onRegister={handleRegisterSubmit} />
       ) : !isAuthenticated && !showWelcome && !showRegisterForm && !showForgotPassword ? (
        <Login 
          onLogin={handleLogin} 
          onForgotPassword={() => setShowForgotPassword(true)} 
          onRegister={handleRegisterClick} 
        />
      ) : !isAuthenticated && !showWelcome && !showRegisterForm && showForgotPassword ? (
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      ) : (

        <>
          {/* Lien pour l'accessibilité */}
          <a href="#main-content" className="skip-link">Aller au contenu principal</a>

          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
            <div className="sidebar-header">
              <div className="app-brand" onClick={() => setActiveMenu('dashboard')} style={{ cursor: 'pointer' }}>
                <img 
                  src={theme === 'dark' ? logoLight : logoDark} 
                  alt="Dashboard" 
                  className="app-logo-img" 
                />
              </div>
            </div>
            <div className="sidebar-user">
              <div className="user-avatar">
                {/* {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" />
                  
                ) : ( 
                  <div className="avatar-placeholder">{currentUser.prenom?.[0]}{currentUser.name?.[0]}</div>
                )}  */}
                <img 
                  // src={currentUser.avatarUrl} 
                  src={`https://archive.org/download/instagram-plain-round/instagram%20dip%20in%20hair.jpg`} 
                  alt="Avatar" 
                /> 
              </div> 
              <div className="user-info"> 
                <p className="user-name">{currentUser.prenom} {currentUser.name}</p>
                <p className="user-role">{formatRole(userRole)}</p>
              </div> 
            </div> 
            <nav className="sidebar-nav"> 
              {getMenuItems().map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  {renderMenuIcon(item.icon)}
                  <span>{item.label}</span>
                  {activeMenu === item.id && <span className="active-indicator"></span>}
                </button>
              ))}
            </nav>
          </aside>
          
          {/* Overlay pour mobile */}
          {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

          {/* Main Content */}
          <main id="main-content" className="main-content">
            {/* Header avec toggle thème */}
            <header className="app-header">
              <div className="header-left">
                <button 
                  className="menu-toggle" 
                  onClick={toggleSidebar}
                  aria-label="Menu principal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                <div className="header-brand" onClick={() => setActiveMenu('dashboard')} style={{ cursor: 'pointer' }}>
                  <img 
                    src={theme === 'dark' ? logoLight : logoDark} 
                    alt="Dashboard" 
                    className="header-logo" 
                  />
                </div>
              </div>
              
              <div className="header-actions">
                <NotificationCenter setActiveMenu={setActiveMenu} />
                {/* {userRole !== 'admin' && <ChatIcon currentUser={currentUser} />} */}
                <ThemeToggle />
                <ProfileButton 
                  user={currentUser} 
                  onLogout={handleLogout}
                />
              </div>
            </header>
            
            <div className="content-container">
        {activeMenu === 'accueil' && (
          <div className="accueil-content">
            {userRole === 'admin' ? (
              <AdminHome currentUser={currentUser} setActiveMenu={setActiveMenu} />
            ) : userRole === 'manager' ? (
              <ManagerHome currentUser={currentUser} setActiveMenu={setActiveMenu} />
            ) : (
              <EmployeeHome currentUser={currentUser} setActiveMenu={setActiveMenu} />
            )}
          </div>
        )}
        {activeMenu === 'notifications' && <NotificationsPage />} 
        {activeMenu === 'calendar' && <Calendar />}
       
        {activeMenu === 'managercalendar' && <ManagerCalendar projects={projects} tasks={tasks} />}
        {activeMenu === 'export' && <ExportPage projects={projects} usersList={users} />}
        {activeMenu === 'gantt' && <GanttPage projectsData={projects} />}
        {activeMenu === 'dashboard' && ( 
          <div className="dashboard-content"> 
            <div className="page-header"> 
              <h1 className="fade-in">Tableau de Bord</h1>
              <p className="page-subtitle slide-in">Suivi des projets et tâches en temps réel</p>
            </div>
            
            {/* Stats Cards */}
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <StatsCards stats={statsData}  />
            </div>

            {/* Charts */}
            <div className="fade-in" style={{ animationDelay: '0.3s' }}>
              <ProjectsCharts projects={projects} tasks={tasks} />
            </div>

            {/* Tasks Summary */}
            {/* <div className="tasks-summary fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="summary-header">
                <h2>Aperçu des Tâches</h2>
                <button className="view-all-btn" onClick={() => setActiveMenu('tasks')}>Voir tout</button>
              </div>
              <div className="summary-cards">
                <div className="summary-card pending">
                  <h3>À faire</h3>
                  <div className="summary-count">{tasks.filter(t => t.status === 'En attente').length}</div>
                </div>
                <div className="summary-card in-progress">
                  <h3>En cours</h3>
                  <div className="summary-count">{tasks.filter(t => t.status === 'En cours').length}</div>
                </div>
                <div className="summary-card completed">
                  <h3>Terminé</h3>
                  <div className="summary-count">{tasks.filter(t => t.status === 'Terminé').length}</div>
                </div>
              </div>
            </div> */}
          </div>
        )}
        
        {activeMenu === 'employee-dashboard' && (
          <div className="dashboard-content">
            <div className="page-header">
              <h1 className="fade-in">Votre Tableau de Bord</h1>
              <p className="page-subtitle slide-in">Suivi tes tâches en temps réel</p>
            </div>

            {/* Charts */}
            <div className="fade-in" style={{ animationDelay: '0.3s' }}>
              <ProjectsChartsemployee tasks={tasks} currentUser={currentUser} />
            </div>

            {/* Tasks Summary */}
            {/* <div className="tasks-summary fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="summary-header">
                <h2>Aperçu de tes Tâches</h2>
                <button className="view-all-btn" onClick={() => setActiveMenu('tasks')}>Voir tout</button>
              </div>
              <div className="summary-cards">
                <div className="summary-card pending">
                  <h3>À faire</h3> 
                  <div className="summary-count">{tasks.filter(t => t.status === 'En attente').length}</div>
                </div> 
                <div className="summary-card in-progress">
                  <h3>En cours</h3>
                  <div className="summary-count">{tasks.filter(t => t.status === 'En cours').length}</div>
                </div>
                <div className="summary-card completed">
                  <h3>Terminé</h3> 
                  <div className="summary-count">{tasks.filter(t => t.status === 'Terminé').length}</div>
                </div>
              </div>
            </div> */}
          </div>
        )}

        {activeMenu === 'projects' && (
          <div className="projects-content">
            <div className="page-header">
              <h1 className="fade-in">Gestion des Projets</h1>
              <p className="page-subtitle slide-in">Suivez et gérez tous vos projets</p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <ProjectsList 
                projects={projects} 
                isPersonalView={false}        //here 
                onEdit={handleEditProject} 
                onDelete={handleDeleteProject}
                onAssignTask={handleAssignTask}
                allTasks={tasks}
                usersList={users} 
                currentUser={currentUser}    //here 
              /> 
            </div>
          </div>
        )}

        {activeMenu === 'tasks' && (
          <div className="tasks-content">
            <div className="page-header">
              <h1 className="fade-in">Gestion des Tâches</h1> 
              <p className="page-subtitle slide-in">Organisez et suivez l'avancement de vos tâches</p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <TasksManager 
                tasks={tasks} 
                onEdit={handleEditTask} 
                onDelete={handleDeleteTask}
                onStatusChange={handleTaskStatusChange}
                userRole={userRole} 
                projectsList={projects}
              /> 
            </div>
          </div>
        )}
        
        {activeMenu === 'mytasks' && (
          <div className="tasks-content">
            <div className="page-header">
              <h1 className="fade-in">Mes Tâches</h1>
              <p className="page-subtitle slide-in">Suivez et gérez vos tâches assignées</p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <MyTasks 
                currentUser={currentUser} 
              />
            </div>
          </div>
        )}

        {activeMenu === 'myprojects' && (
          <div className="projects-content">
            <div className="page-header">
              <h1 className="fade-in">Mes Projets</h1>
              <p className="page-subtitle slide-in">Suivez les projets auxquels vous êtes assigné</p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <ProjectsList 
                projects={projects.filter(project => {
                  // Vérifier si l'employé est assigné à au moins une tâche de ce projet
                  const projectTasks = tasks.filter(task => task.projectId === project.id);
                  return projectTasks.some(task => task.assignedTo === currentUser.id);
                })} 
                onEdit={handleEditProject} 
                onDelete={handleDeleteProject}
                onAssignTask={handleAssignTask}
                allTasks={tasks.filter(task => task.assignedTo === currentUser.id)}
                usersList={users}
                isPersonalView={true}
                currentUser={currentUser}    //here
              /> 
            </div>
          </div>
        )}
        
        {/* La section des rapports a été supprimée */}

        {activeMenu === 'users' && userRole !== 'user' && (
          <div className="users-content">
            <EmployeesList 
              users={users} 
              userRole={userRole} 
              onDeleteEmployee={handleDeleteEmployee}
            />
          </div>
        )}

        {activeMenu === 'managers' && userRole === 'admin' && (
          <div className="managers-content">
            <ManagersList 
              managers={managers} 
              userRole={userRole} 
              onDeleteManager={handleDeleteManager}
            />
          </div>
        )}

        {activeMenu === 'profile' && (
          <div className="content-container fade-in" style={{ padding: 0, maxWidth: '100%' }}>
            {userRole === 'admin' ? (
              <AdminProfilePage
                currentUser={currentUser}
                onUpdateProfile={handleEditProfile}
              />
            ) : (
              <ProfilePage 
                currentUser={currentUser} 
                onUpdateProfile={handleEditProfile} 
              />
            )}
          </div>
        )}

        {activeMenu === 'permissions' && userRole === 'admin' && (
          <div className="permissions-content">
            <div className="page-header">
              <h1 className="fade-in">Gestion des Permissions</h1>
              <p className="page-subtitle slide-in">Configurez les droits d'accès pour chaque rôle utilisateur</p>
            </div>
            
            <div className="section-container fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <span className="icon" style={{ fontSize: '20px', backgroundColor: 'rgba(25, 118, 210, 0.1)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔒</span>
                    <span>Matrice des Permissions</span>
                  </h2>
                </div>
                <div className="section-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline btn-icon" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span><RiResetRightLine /></span> Réinitialiser
                  </button>
                  <button className="btn btn-primary" style={{ padding: '8px 15px', borderRadius: '6px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}>Sauvegarder les modifications</button>
                </div>
              </div>
              
              <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-header-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '500', fontSize: '16px' }}>Gérer les rôles et permissions</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'inline-block' }}></span>
                        <span>Activé</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block' }}></span>
                        <span>Désactivé</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '10px 20px 20px', backgroundColor: 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Gestion des utilisateurs</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Admin</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked disabled />
                              <span className="toggle-slider" style={{ backgroundColor: 'var(--primary-color)' }}></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Manager</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Utilisateur</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Gestion des projets</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Admin</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked disabled />
                              <span className="toggle-slider" style={{ backgroundColor: 'var(--primary-color)' }}></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Manager</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Utilisateur</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Gestion des tâches</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Admin</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked disabled />
                              <span className="toggle-slider" style={{ backgroundColor: 'var(--primary-color)' }}></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Manager</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Utilisateur</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Accès aux rapports</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Admin</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked disabled />
                              <span className="toggle-slider" style={{ backgroundColor: 'var(--primary-color)' }}></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Manager</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                          <div className="permission-item" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-header-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>Utilisateur</div>
                            <label className="toggle-switch" style={{ alignSelf: 'flex-start' }}>
                              <input type="checkbox" defaultChecked />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="helper-text" style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', padding: '10px 15px', borderRadius: '6px', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '10px', borderLeft: '4px solid var(--warning-color)' }}>
                    <p style={{ margin: '0', fontSize: '14px' }}><strong>Note :</strong> Les permissions du rôle Admin ne peuvent pas être modifiées pour des raisons de sécurité.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'settings' && userRole === 'admin' && (
          <div className="settings-content">
            <div className="page-header">
              <h1 className="fade-in">Paramètres du Système</h1>
              <p className="page-subtitle slide-in">Configurez les paramètres globaux de l'application</p>
            </div>
            
            <div className="settings-grid fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="setting-card" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', transform: 'translateY(0)', ':hover': { transform: 'translateY(-5px)' } }}>
                <div className="setting-card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="setting-icon" style={{ fontSize: '24px', backgroundColor: 'rgba(25, 118, 210, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IoNotifications /></div>
                  <h3 className="setting-title" style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Notifications</h3>
                </div>
                <div className="setting-card-body" style={{ padding: '20px 0' }}>
                  <div className="setting-section" style={{ marginBottom: '25px', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Par Email</h4>
                    <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Nouveaux projets</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Mises à jour des tâches</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Nouveaux employés</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Rapports hebdomadaires</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="setting-section" style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Dans l'application</h4>
                    <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Alertes en temps réel</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Notifications sonores</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Nouveau message</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Tâche à expiration</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="setting-card" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', transform: 'translateY(0)', ':hover': { transform: 'translateY(-5px)' } }}>
                <div className="setting-card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="setting-icon" style={{ fontSize: '24px', backgroundColor: 'rgba(244, 67, 54, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AiOutlineSecurityScan /></div>
                  <h3 className="setting-title" style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Sécurité</h3>
                </div>
                <div className="setting-card-body">
                  <div className="setting-section" style={{ marginBottom: '25px', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Politique de mot de passe</h4>
                    <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Minimum 8 caractères</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Au moins une majuscule</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Au moins un chiffre</span>
                      </label>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Au moins un caractère spécial</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="setting-section" style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Session utilisateur</h4>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                      <div style={{ minWidth: '200px' }}>
                        <label style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Délai d'expiration (minutes)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          defaultValue="60" 
                          min="5" 
                          max="240" 
                          style={{ 
                            padding: '10px 12px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-color)', 
                            backgroundColor: 'var(--input-bg)', 
                            color: 'var(--text-primary)', 
                            fontSize: '14px',
                            width: '100%'
                          }} 
                        />
                      </div>
                      
                      <div style={{ minWidth: '200px' }}>
                        <label style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Tentatives de connexion max</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          defaultValue="5" 
                          min="1" 
                          max="10" 
                          style={{ 
                            padding: '10px 12px', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-color)', 
                            backgroundColor: 'var(--input-bg)', 
                            color: 'var(--text-primary)', 
                            fontSize: '14px',
                            width: '100%'
                          }} 
                        />
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '15px' }}>
                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-color)', width: '18px', height: '18px' }} /> 
                        <span style={{ flex: 1 }}>Déconnexion automatique après inactivité</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="setting-card" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', transform: 'translateY(0)', ':hover': { transform: 'translateY(-5px)' } }}>
                <div className="setting-card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="setting-icon" style={{ fontSize: '24px', backgroundColor: 'rgba(156, 39, 176, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PiPaintBrushDuotone /></div>
                  <h3 className="setting-title" style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Apparence</h3>
                </div>
                <div className="setting-card-body">
                  <div className="setting-option">
                    <label className="setting-option-label" style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>Thème par défaut</label>
                    <p className="setting-description" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>Thème appliqué aux nouveaux utilisateurs</p>
                    <select 
                      className="form-select" 
                      value={theme} 
                      onChange={(e) => {
                        const newTheme = e.target.value;
                        setTheme(newTheme);
                        document.documentElement.setAttribute('data-theme', newTheme);
                        localStorage.setItem('theme', newTheme);
                      }}
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)', 
                        backgroundColor: 'var(--input-bg)', 
                        color: 'var(--text-primary)', 
                        fontSize: '14px',
                        width: '100%',
                        maxWidth: '200px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique (selon système)</option>
                    </select>
                  </div>
                  

                </div>
              </div>
            </div>
            
            <div className="button-group fade-in" style={{ animationDelay: '0.3s', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline">Annuler</button>
              <button className="btn btn-primary">Enregistrer les paramètres</button>
            </div>
          </div>
        )}
            </div>
          </main>
        </>
      )}
       {/* Bouton de chat flottant pour les managers */}
      {/* {userRole === 'manager' && <ChatButton />} */} 
      {isAuthenticated && userRole !== 'admin' && <ChatButton />}
    </div>
  ) 
}

export default App 
