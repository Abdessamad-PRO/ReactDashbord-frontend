// Données utilisateur
export const userData = {
  id: 'USR12345',
  firstName: 'Thomas',
  lastName: 'Dupont',
  email: 'thomas.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  address: '15 rue de Paris, 75001 Paris',
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  createdAt: '05/03/2024',
  lastLogin: '28/04/2025',
  role: 'user'
};

// Statistiques générales
export const statsData = {
  totalProjects: 28,
  totalTasks: 176,
  totalEmployees: 42,
  daysRemaining: 14
};

// Données des projets
export const projectsData = [
  {
    id: 1,
    name: 'Refonte Site Web',
    description: 'Modernisation complète de l\'interface et de l\'expérience utilisateur du site web de l\'entreprise.',
    status: 'En cours',
    progress: 65,
    deadline: '15/06/2025',
    assignee: 'Marie Laurent',
    tasks: [
      {
        id: 101,
        title: 'Maquettes UI',
        status: 'Terminé',
        deadline: '20/04/2025',
        assignedTo: 'Sophie Martin',
        priority: 'Haute',
        description: 'Créer les maquettes UI pour la nouvelle interface.'
      },
      {
        id: 102,
        title: 'Développement Frontend',
        status: 'En cours',
        deadline: '10/05/2025',
        assignedTo: 'Thomas Dupont',
        priority: 'Haute',
        description: 'Développer les composants frontend en React.'
      },
      {
        id: 103,
        title: 'Tests d\'intégration',
        status: 'En attente',
        deadline: '01/06/2025',
        assignedTo: 'Jean Moreau',
        priority: 'Moyenne',
        description: 'Effectuer les tests d\'intégration des composants.'
      }
    ],
    createdAt: '01/03/2025'
  },
  {
    id: 2,
    name: 'Application Mobile',
    description: 'Développement d\'une application mobile native pour iOS et Android.',
    status: 'En attente',
    progress: 25,
    deadline: '30/08/2025',
    assignee: 'David Bernard',
    tasks: [
      {
        id: 201,
        title: 'UX Design Mobile',
        status: 'En cours',
        deadline: '15/05/2025',
        assignedTo: 'Sophie Martin',
        priority: 'Haute',
        description: 'Concevoir l\'expérience utilisateur pour l\'application mobile.'
      },
      {
        id: 202,
        title: 'Développement iOS',
        status: 'En attente',
        deadline: '30/06/2025',
        assignedTo: 'Alexandre Petit',
        priority: 'Haute',
        description: 'Développer la version iOS de l\'application.'
      }
    ],
    createdAt: '15/03/2025'
  },
  {
    id: 3,
    name: 'Système de Facturation',
    description: 'Mise en place d\'un nouveau système de facturation automatisé.',
    status: 'Terminé',
    progress: 100,
    deadline: '10/04/2025',
    assignee: 'Sarah Lefevre',
    tasks: [
      {
        id: 301,
        title: 'Intégration API Paiement',
        status: 'Terminé',
        deadline: '01/04/2025',
        assignedTo: 'Thomas Dupont',
        priority: 'Haute',
        description: 'Intégrer l\'API de paiement avec le système.'
      },
      {
        id: 302,
        title: 'Tests de Sécurité',
        status: 'Terminé',
        deadline: '05/04/2025',
        assignedTo: 'Marie Laurent',
        priority: 'Haute',
        description: 'Effectuer les tests de sécurité du système de paiement.'
      }
    ],
    createdAt: '01/02/2025'
  },
  {
    id: 4,
    name: 'Automatisation Marketing',
    description: 'Implémentation d\'un système d\'automatisation des campagnes marketing.',
    status: 'En cours',
    progress: 40,
    deadline: '30/07/2025',
    assignee: 'Julie Dubois',
    tasks: [
      {
        id: 401,
        title: 'Configuration Email',
        status: 'Terminé',
        deadline: '15/04/2025',
        assignedTo: 'Julie Dubois',
        priority: 'Moyenne',
        description: 'Configurer les templates d\'email pour les campagnes.'
      },
      {
        id: 402,
        title: 'Intégration CRM',
        status: 'En cours',
        deadline: '30/05/2025',
        assignedTo: 'David Bernard',
        priority: 'Haute',
        description: 'Intégrer le système avec notre CRM existant.'
      },
      {
        id: 403,
        title: 'Segmentation Clients',
        status: 'En attente',
        deadline: '15/06/2025',
        assignedTo: 'Sarah Lefevre',
        priority: 'Moyenne',
        description: 'Implémenter la segmentation automatique des clients.'
      }
    ],
    createdAt: '01/03/2025'
  }
];

// Toutes les tâches (combinées de tous les projets)
export const tasksData = projectsData.reduce((acc, project) => {
  const projectTasks = project.tasks.map(task => ({
    ...task,
    project: project.name
  }));
  return [...acc, ...projectTasks];
}, []);

// Utilisateurs
export const usersData = [
  {
    id: 'USR12345',
    firstName: 'Thomas',
    lastName: 'Dupont',
    email: 'thomas.dupont@example.com',
    role: 'admin',
    department: 'IT',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    projectsAssigned: [1, 3],
    tasksAssigned: [102, 301]
  },
  {
    id: 'USR12346',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@example.com',
    role: 'manager',
    department: 'Design',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    projectsAssigned: [],
    tasksAssigned: [101, 201]
  },
  {
    id: 'USR12347',
    firstName: 'David',
    lastName: 'Bernard',
    email: 'david.bernard@example.com',
    role: 'manager',
    department: 'Mobile',
    avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
    projectsAssigned: [2],
    tasksAssigned: [402]
  },
  {
    id: 'USR12348',
    firstName: 'Marie',
    lastName: 'Laurent',
    email: 'marie.laurent@example.com',
    role: 'manager',
    department: 'Web',
    avatarUrl: 'https://randomuser.me/api/portraits/women/17.jpg',
    projectsAssigned: [1],
    tasksAssigned: [302]
  },
  {
    id: 'USR12349',
    firstName: 'Jean',
    lastName: 'Moreau',
    email: 'jean.moreau@example.com',
    role: 'user',
    department: 'QA',
    avatarUrl: 'https://randomuser.me/api/portraits/men/57.jpg',
    projectsAssigned: [],
    tasksAssigned: [103]
  },
  {
    id: 'USR12350',
    firstName: 'Sarah',
    lastName: 'Lefevre',
    email: 'sarah.lefevre@example.com',
    role: 'user',
    department: 'Finance',
    avatarUrl: 'https://randomuser.me/api/portraits/women/67.jpg',
    projectsAssigned: [3],
    tasksAssigned: [403]
  }
];
