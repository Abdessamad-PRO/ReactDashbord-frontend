import { useState } from 'react';

// Données fictives pour les graphiques
const monthlyData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  datasets: [
    {
      label: 'Projets Complétés',
      data: [5, 8, 12, 9, 7, 15, 18, 14, 10, 13, 11, 9],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.4
    }, 
    {
      label: 'Nouveaux Projets',
      data: [8, 10, 15, 12, 9, 18, 20, 17, 13, 15, 14, 11],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      tension: 0.4
    }
  ]
}; 

const statusData = {
  labels: ['En cours', 'Terminé', 'En attente', 'Annulé'],
  datasets: [
    {
      label: 'Statut des Projets',
      data: [12, 19, 8, 3],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }
  ]
};

const taskCompletionData = {
  labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
  datasets: [
    {
      label: 'Tâches Complétées',
      data: [15, 22, 19, 27],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }
  ]
};

const teamPerformanceData = {
  labels: ['Conception', 'Développement', 'Tests', 'Déploiement', 'Maintenance'],
  datasets: [
    {
      label: 'Équipe A',
      data: [85, 92, 78, 89, 95],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: true
    },
    {
      label: 'Équipe B',
      data: [78, 88, 93, 82, 87],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: true
    }
  ]
};

const ReportsDashboard = () => {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('performance');
  
  const exportPDF = () => {
    alert('Exportation PDF en cours...');
    // Logique d'exportation PDF
  };
  
  const exportCSV = () => {
    alert('Exportation CSV en cours...');
    // Logique d'exportation CSV
  };
  
  return (
    <div className="reports-dashboard">
      <div className="reports-header">
        <h2>Rapports et Analyses</h2>
        <div className="reports-actions">
          <button className="export-btn pdf-btn" onClick={exportPDF}>
            Exporter PDF
          </button>
          <button className="export-btn csv-btn" onClick={exportCSV}>
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <span className="filter-label">Période:</span>
          <select 
            className="filter-select" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Type de rapport:</span>
          <select 
            className="filter-select" 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="performance">Performance des projets</option>
            <option value="tasks">Suivi des tâches</option>
            <option value="team">Performance de l'équipe</option>
            <option value="financial">Données financières</option>
          </select>
        </div>
      </div>

      <div className="report-cards">
        <div className="summary-card total-projects">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Total Projets</h3>
            <div className="card-value">42</div>
            <div className="card-change positive">+12% depuis {period}</div>
          </div>
        </div>
        
        <div className="summary-card completed-projects">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Projets Terminés</h3>
            <div className="card-value">19</div>
            <div className="card-change positive">+8% depuis {period}</div>
          </div>
        </div>
        
        <div className="summary-card avg-completion">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <h3>Durée Moyenne</h3>
            <div className="card-value">28 jours</div>
            <div className="card-change negative">+3% depuis {period}</div>
          </div>
        </div>
        
        <div className="summary-card task-completion">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Tâches Complétées</h3>
            <div className="card-value">183</div>
            <div className="card-change positive">+15% depuis {period}</div>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Évolution des Projets ({period})</h3>
            <div className="chart-options">
              <button className="chart-option active">
                <span className="option-icon">📈</span>
              </button>
              <button className="chart-option">
                <span className="option-icon">📊</span>
              </button>
            </div>
          </div>
          <div className="chart-body">
            <Line 
              data={monthlyData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Statut des Projets</h3>
            </div>
            <div className="chart-body">
              <Doughnut 
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  },
                  cutout: '65%'
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Tâches Complétées par Semaine</h3>
            </div>
            <div className="chart-body">
              <Bar 
                data={taskCompletionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Performance des Équipes</h3>
          </div>
          <div className="chart-body">
            <Line 
              data={teamPerformanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="reports-table-container">
        <div className="table-header">
          <h3>Détails des projets récents</h3>
          <div className="table-filter">
            <input type="text" placeholder="Rechercher un projet..." className="filter-input" />
          </div>
        </div>
        <div className="recent-projects-table">
          <div className="table-header-row">
            <div className="header-cell">Projet</div>
            <div className="header-cell">Responsable</div>
            <div className="header-cell">Statut</div>
            <div className="header-cell">Progression</div>
            <div className="header-cell">Tâches</div>
            <div className="header-cell">Dernier update</div>
          </div>
          
          {[
            { id: 1, name: "Refonte du site web", manager: "Sophie Martin", status: "En cours", progress: 75, tasks: "18/24", lastUpdate: "Aujourd'hui" },
            { id: 2, name: "Application mobile v2", manager: "Thomas Dubois", status: "Terminé", progress: 100, tasks: "32/32", lastUpdate: "Hier" },
            { id: 3, name: "Intégration CRM", manager: "Emma Leroy", status: "En attente", progress: 30, tasks: "6/20", lastUpdate: "3 jours" },
            { id: 4, name: "Mise à jour API", manager: "Lucas Bernard", status: "En cours", progress: 60, tasks: "12/20", lastUpdate: "1 jour" },
            { id: 5, name: "Dashboard Marketing", manager: "Julie Petit", status: "Terminé", progress: 100, tasks: "15/15", lastUpdate: "2 jours" }
          ].map(project => (
            <div key={project.id} className="table-row">
              <div className="table-cell project-name">{project.name}</div>
              <div className="table-cell">{project.manager}</div>
              <div className="table-cell">
                <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                  {project.status}
                </span>
              </div>
              <div className="table-cell">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{project.progress}%</span>
              </div>
              <div className="table-cell">{project.tasks}</div>
              <div className="table-cell">{project.lastUpdate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
