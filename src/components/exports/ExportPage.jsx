import React, { useState, useEffect } from 'react';
import { PiExportBold } from 'react-icons/pi';
import { FaFilePdf } from 'react-icons/fa';
import { BsCheckCircleFill } from 'react-icons/bs';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import './ExportPage.css';
import exportService from '../../services/export'; // Importer le service d'export

// Composant pour afficher les notifications
const Notification = ({ message, icon, type }) => { 
  return (
    <div className={`export-notification ${type}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}; 

const ExportPage = ({ projects, usersList }) => {
  const [projectsData, setProjectsData] = useState([]);
  const [exportType, setExportType] = useState('all'); // 'all' ou 'employees'
  const [notification, setNotification] = useState(null);
  const [isExporting, setIsExporting] = useState(false); // État pour indiquer qu'un export est en cours
  
  // S'assurer que les données sont correctement formatées
  useEffect(() => {
    if (projects && Array.isArray(projects)) {
      console.log('Projets disponibles:', projects.length);
      setProjectsData(projects);
    } else {
      console.error('Données de projets invalides:', projects);
      setProjectsData([]);
    }
  }, [projects]);

  // Fonction pour afficher une notification
  const showNotification = (message, type, icon) => {
    setNotification({ message, type, icon });
    // Faire disparaître la notification après 5 secondes
    setTimeout(() => setNotification(null), 5000);
  };

  // Fonction pour exporter en PDF en utilisant le backend
  const exportToPDF = async () => {
    // Empêcher les exports multiples simultanés
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    
    try {
      console.log('Début de l\'export PDF avec type:', exportType);
      
      // Afficher une notification de démarrage
      showNotification(
        'Export en cours...', 
        'info', 
        <AiOutlineLoading3Quarters className="notification-icon loading-spin" />
      );
      
      // Appeler le service approprié selon le type d'export
      if (exportType === 'all') {
        // Export complet avec tâches et employés
        await exportService.exportAndDownloadAllProjects();
      } else {
        // Export liste des employés par projet
        await exportService.exportAndDownloadProjectsWithUsers();
      }
      
      // Afficher la notification de succès
      showNotification(
        'Fichier PDF exporté avec succès', 
        'success', 
        <BsCheckCircleFill className="notification-icon success" />
      );
      
      console.log('PDF exporté avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      
      // Afficher la notification d'erreur
      showNotification(
        error.message || 'Erreur lors de l\'export PDF', 
        'error', 
        <FaFilePdf className="notification-icon error" />
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction pour exporter un projet spécifique
  const exportSingleProject = async (projectId, projectName) => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    
    try {
      showNotification(
        `Export du projet "${projectName}" en cours...`, 
        'info', 
        <AiOutlineLoading3Quarters className="notification-icon loading-spin" />
      );
      
      await exportService.exportAndDownloadProject(projectId, projectName);
      
      showNotification(
        `Projet "${projectName}" exporté avec succès`, 
        'success', 
        <BsCheckCircleFill className="notification-icon success" />
      );
      
    } catch (error) {
      console.error('Erreur lors de l\'export du projet:', error);
      showNotification(
        error.message || `Erreur lors de l'export du projet "${projectName}"`, 
        'error', 
        <FaFilePdf className="notification-icon error" />
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-page-container">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          icon={notification.icon} 
        />
      )}
      <div className="export-header">
        <h1><PiExportBold className="export-icon" /> Exporter les données</h1>
        <p className="export-description">
          Exportez les données de vos projets et de votre équipe au format PDF pour une utilisation externe.
        </p>
      </div>

      <div className="export-options">
        <div className="export-option-group">
          <h2>Type de données à exporter</h2>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="exportType"
                value="all"
                checked={exportType === 'all'}
                onChange={() => setExportType('all')}
                disabled={isExporting}
              />
              <span className="radio-label">Projets complets avec tâches et employés</span>
              <p className="option-description">Inclut tous les détails des projets, les tâches associées et les employés assignés à chaque tâche.</p>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="exportType"
                value="employees"
                checked={exportType === 'employees'}
                onChange={() => setExportType('employees')}
                disabled={isExporting}
              />
              <span className="radio-label">Liste des employés par projet</span>
              <p className="option-description">Affiche uniquement la liste des employés assignés à chaque projet.</p>
            </label>
          </div>
        </div> 

        <div className="export-actions">
          <h2>Format d'export</h2>
          <div className="export-buttons">
            <button 
              className={`export-btn pdf-btn ${isExporting ? 'exporting' : ''}`}
              onClick={exportToPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <AiOutlineLoading3Quarters className="format-icon loading-spin" />
              ) : (
                <FaFilePdf className="format-icon" />
              )}
              <span>
                {isExporting ? 'Export en cours...' : 'Exporter en PDF'}
              </span>
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default ExportPage;