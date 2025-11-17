import React, { useState, useRef, useEffect } from 'react';
import { formatRole } from '../../utils';
import './ProfilePage.css';
import AuthService from '../../services/auth';
import DeleteAccountService from '../../services/deleteAccount';
import { IoIosAddCircle } from "react-icons/io";
import { PiArrowsClockwiseDuotone } from "react-icons/pi";
import { PiCheckFatDuotone } from "react-icons/pi";
import { PiXDuotone } from "react-icons/pi";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdNotificationsActive } from "react-icons/md";
import { MdOutlineSecurity } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { LiaUserEditSolid } from "react-icons/lia";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { MdOutlinePassword } from "react-icons/md";
import { LiaUserSlashSolid } from "react-icons/lia";
import { TbUserSquareRounded } from "react-icons/tb";
import { AiOutlineMail } from "react-icons/ai"; 
import { AiTwotoneQuestionCircle } from "react-icons/ai";
import { LuSend } from "react-icons/lu";
import { PiUserSwitchDuotone } from "react-icons/pi";
import { BsCheckCircleFill } from "react-icons/bs"; 
import { BsChatLeftTextFill } from "react-icons/bs";
import { PiUsersFourDuotone } from "react-icons/pi";
import { BsListTask } from "react-icons/bs";
import { MdOutlineUpdate } from "react-icons/md";

const ProfilePage = ({ currentUser, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('informations');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...currentUser 
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ success: false, message: '' });
  const fileInputRef = useRef(null);
  const [showDeleteAccountForm, setShowDeleteAccountForm] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState({ 
    reason: '' 
  });
  const [deleteAccountStatus, setDeleteAccountStatus] = useState({ success: false, message: '' });
  const [requestStatus, setRequestStatus] = useState(null);

  // Vérifier le statut de la demande de suppression au chargement
  useEffect(() => {
    const checkRequestStatus = async () => { 
      try {
        const status = await DeleteAccountService.getRequestStatus();
        setRequestStatus(status);
        if (status.has_request) {
          setDeleteAccountStatus({
            success: true, 
            message: status.message
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut de la demande:', error);
      }
    };
    checkRequestStatus();
  }, []);

  // Oublier le mot de passe 
  const onForgotPassword = () => {
    localStorage.setItem('resetEmail', currentUser.email || '');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.setItem('showWelcome', 'false');
    localStorage.setItem('showForgotPassword', 'true');
    window.location.href = '/';
  };

  // Simulation des statistiques de l'utilisateur
  const userStats = {
    tasksCompleted: 42,
    tasksInProgress: 7,
    projectsParticipated: 8,
    lastActive: 'Aujourd\'hui à 14:23',
    accountCreated: '15/01/2025',
    totalHoursLogged: 256
  };

  // Simulation des activités récentes
  const recentActivities = [
    { id: 1, type: 'task_completed', description: 'Tâche "Mise à jour de la documentation" terminée', date: 'Aujourd\'hui, 14:23' },
    { id: 2, type: 'comment_added', description: 'Commentaire ajouté sur "Développement frontend"', date: 'Aujourd\'hui, 11:17' },
    { id: 3, type: 'project_joined', description: 'A rejoint le projet "Refonte du site web"', date: 'Hier, 09:45' },
    { id: 4, type: 'task_assigned', description: 'Nouvelle tâche assignée: "Amélioration UI"', date: 'Hier, 08:30' },
    { id: 5, type: 'status_update', description: 'Mise à jour statut sur "API Integration"', date: '15/05/2025, 16:20' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      setIsSubmitting(true);
      setUpdateStatus({ success: false, message: '' });
      
      const profileData = {
        name: formData.lastName,
        prenom: formData.firstName,
        email: formData.email,
        telephone: formData.phone,
        adresse: formData.address,
        departement: formData.department, 
        bio: formData.bio,
      };
      
      console.log('Données envoyées au backend:', profileData);
      console.log('Image à envoyer:', imageFile);
      
      const response = await AuthService.updateUserProfile(profileData, imageFile);
      
      console.log('Profile updated:', response);
      
      const updatedUser = { 
        ...currentUser,
        prenom: formData.firstName,
        name: formData.lastName,
        email: formData.email,
        telephone: formData.phone,
        adresse: formData.address,
        departement: formData.department,
        bio: formData.bio,
        avatarUrl: response.user?.photo_de_profile || selectedImage || currentUser.avatarUrl
      }; 
        
      if (response.user && response.user.avatarUrl) {
        updatedUser.avatarUrl = response.user.avatarUrl;
      } else if (selectedImage) {
        updatedUser.avatarUrl = selectedImage;
      }
      
      if (typeof onUpdateProfile === 'function') {
        onUpdateProfile(updatedUser);
      }
      
      setUpdateStatus({ 
        success: true, 
        message: 'Votre profil a été mis à jour avec succès!' 
      });
      
      setTimeout(() => {
        setIsEditing(false);
        setSelectedImage(null);
        setImageFile(null);
        setUpdateStatus({ success: false, message: '' });
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setUpdateStatus({ 
        success: false, 
        message: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ ...currentUser }); 
    setIsEditing(false);
    setSelectedImage(null);
  };

  const handleImageClick = () => { 
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 160;
          const ctx = canvas.getContext('2d');
          
          ctx.beginPath();
          ctx.arc(80, 80, 80, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          const aspectRatio = img.width / img.height;
          let drawWidth, drawHeight, startX, startY;
          
          if (aspectRatio >= 1) {
            drawHeight = 160;
            drawWidth = drawHeight * aspectRatio;
            startX = (160 - drawWidth) / 2;
            startY = 0;
          } else {
            drawWidth = 160;
            drawHeight = drawWidth / aspectRatio;
            startX = 0;
            startY = (160 - drawHeight) / 2;
          }
          
          ctx.drawImage(img, startX, startY, drawWidth, drawHeight);
           
          const dataUrl = canvas.toDataURL('image/png');
          setSelectedImage(dataUrl);
          setImageFile(e.target.files[0]);
        };
        img.src = event.target.result;
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDeleteAccountInputChange = (e) => { 
    const { name, value } = e.target;
    setDeleteAccountData({ ...deleteAccountData, [name]: value });
  };

  const handleDeleteAccountSubmit = async () => { 
    try {
      setIsSubmitting(true);
      const response = await DeleteAccountService.requestAccountDeletion(deleteAccountData.reason);
      
      setDeleteAccountStatus({
        success: true,
        message: response.message
      });

      setTimeout(() => {
        setShowDeleteAccountForm(false);
        setDeleteAccountData({ reason: '' });
        setTimeout(() => {
          setDeleteAccountStatus({ success: false, message: '' });
          setRequestStatus({ has_request: true, message: response.message });
        }, 5000);
      }, 3000);
    } catch (error) {
      setDeleteAccountStatus({
        success: false,
        message: error.message || 'Une erreur est survenue lors de la soumission de la demande.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalInfo = () => {
    if (isEditing) {
      return (
        <div className="profile-edit-form">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''} 
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
              />
            </div>
          </div> 
        
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''} 
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Adresse</label> 
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Département</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              rows="4"
            ></textarea>
          </div>
          
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSaveProfile} disabled={isSubmitting}>
              {isSubmitting ? (
                <span><PiArrowsClockwiseDuotone /> Mise à jour en cours...</span>
              ):(
              <span><PiCheckFatDuotone /> Enregistrer les modifications</span>
              )}
            </button>
            <button className="btn-cancel" onClick={handleCancelEdit}>
              <span><PiXDuotone /></span> Annuler
            </button>
          </div>
        </div>
        
      );
    }
    
    return (
      <div className="profile-info-container">
        <div className="profile-info-card">
          <h3>Informations de contact</h3> 
          <div className="info-group">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{currentUser.email || 'Non renseigné'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Téléphone:</span>
              <span className="info-value">{currentUser.telephone || 'Non renseigné'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Adresse:</span>
              <span className="info-value">{currentUser.adresse || 'Non renseignée'}</span>
            </div>
          </div>
        </div>
        
        <div className="profile-info-card">
          <h3>Informations professionnelles</h3>
          <div className="info-group">
            <div className="info-item">
              <span className="info-label">Département:</span>
              <span className="info-value">{currentUser.departement || 'Non renseigné'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rôle:</span>
              <span className="info-value role-badge">{formatRole(currentUser.role) || 'Utilisateur'}</span>
            </div>
          </div>
        </div>
        
        {currentUser.bio && (
          <div className="profile-info-card">
            <h3>À propos de moi</h3>
            <div className="user-bio">
              {currentUser.bio}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderStatistics = () => {
    return (
      <div className="profile-stats-container">
        {/* <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{userStats.tasksCompleted}</div>
            <div className="stat-label">Tâches terminées</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.tasksInProgress}</div>
            <div className="stat-label">Tâches en cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{userStats.projectsParticipated}</div>
            <div className="stat-label">Projets</div>
          </div>
        </div> */}
        
        <div className="profile-info-card">
          <h3>Informations du compte</h3>
          <div className="info-group">
            <div className="info-item">
              <span className="info-label">Identifiant:</span>
              <span className="info-value">{currentUser.id || 'USER123'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Créé le:</span>
              <span className="info-value">{userStats.accountCreated}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dernière activité:</span>
              <span className="info-value">{userStats.lastActive}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Heures travaillées:</span>
              <span className="info-value">{userStats.totalHoursLogged}h</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderActivity = () => {
    return (
      <div className="profile-activity-container">
        <h3>Activités récentes</h3>
        <div className="activity-timeline">
          {recentActivities.map((activity) => (
            <div className="activity-item" key={activity.id}>
              <div className="activity-icon">
                {activity.type === 'task_completed' && <BsCheckCircleFill />}
                {activity.type === 'comment_added' && <BsChatLeftTextFill />}
                {activity.type === 'project_joined' && <PiUsersFourDuotone />}
                {activity.type === 'task_assigned' && <BsListTask />}
                {activity.type === 'status_update' && <MdOutlineUpdate />}
              </div>
              <div className="activity-content">
                <div className="activity-description">{activity.description}</div>
                <div className="activity-date">{activity.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSecurity = () => {
    return (
      <div className="profile-security-container">
        <div className="profile-info-card">
          <h3>Sécurité du compte</h3>
          {/* <div className="security-item">
            <div className="security-header">
              <div className="security-title">Mot de passe</div>
              <button 
                className="security-action" 
                onClick={onForgotPassword}
              ><MdOutlinePassword />
                Modifier
              </button>
            </div>
          </div> */}
          
          <div className="security-item">
            <div className="security-header">
              <div className="security-title">Authentification à deux facteurs</div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div> 
            <div className="security-description">
              Protégez votre compte avec une couche de sécurité supplémentaire
            </div>
          </div>
          
        </div>
        
        <div className="profile-info-card">
          <h3>Préférences de confidentialité</h3>
          <div className="security-item">
            <div className="security-header">
              <div className="security-title">Visibilité du profil</div>
              <select className="security-select">
                <option value="all">Tous les utilisateurs</option>
                <option value="team">Mon équipe uniquement</option>
                <option value="nobody">Personne</option>
              </select>
            </div>
            <div className="security-description">
              Qui peut voir votre profil complet
            </div>
          </div>
          
          <div className="security-item">
            <div className="security-header">
              <div className="security-title">Activité visible par</div>
              <select className="security-select">
                <option value="all">Tous les utilisateurs</option>
                <option value="team">Mon équipe uniquement</option>
                <option value="nobody">Personne</option>
              </select>
            </div>
            <div className="security-description">
              Qui peut voir vos activités récentes
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNotifications = () => {
    return (
      <div className="profile-notifications-container">
        <div className="profile-info-card">
          <h3>Préférences de notification</h3>
          
          <div className="notification-category">
            <h4>Notifications par email</h4>
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-title">Tâches assignées</div>
                <div className="notification-description">Recevoir un email quand une nouvelle tâche vous est assignée</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-title">Commentaires</div>
                <div className="notification-description">Recevoir un email quand quelqu'un commente une tâche que vous suivez</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-title">Mises à jour des projets</div>
                <div className="notification-description">Recevoir un email pour les mises à jour importantes des projets</div>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          
          <div className="notification-category">
            <h4>Notifications dans l'application</h4>
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-title">Tâches assignées</div>
                <div className="notification-description">Recevoir une notification quand une nouvelle tâche vous est assignée</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-title">Commentaires</div>
                <div className="notification-description">Recevoir une notification quand quelqu'un commente une tâche que vous suivez</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-title">Mises à jour des projets</div>
                <div className="notification-description">Recevoir une notification pour les mises à jour importantes des projets</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="notification-item">
              <div className="notification-info">
                <div className="notification-title">Mentions</div>
                <div className="notification-description">Recevoir une notification quand quelqu'un vous mentionne</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div className="profile-cover">
          <div className="profile-cover-gradient"></div>
          <div className="profile-cover-pattern"></div>
        </div>
      </div>
      
      <div className="profile-main-content">
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-container">
              <img  
                // src={selectedImage || currentUser.avatarUrl || 'https://via.placeholder.com/150'} 
                src={`https://archive.org/download/instagram-plain-round/instagram%20dip%20in%20hair.jpg`} 
                alt="Avatar de l'utilisateur" 
                className="profile-avatar"
                onClick={handleImageClick}
                style={{ cursor: 'pointer' }}
              />
              <div className="profile-avatar-edit" onClick={handleImageClick}>
                <span><IoIosAddCircle /></span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
            </div>
            <div className="profile-user-info">
              <h2 className="profile-name">{currentUser.prenom} {currentUser.name}</h2>
              <div className="profile-role">{formatRole(currentUser.role)}</div>
              <div className="profile-contact-info">
                <div className="profile-contact-item">
                  <span className="info-icon"><MdOutlineEmail /></span>
                  <span>{currentUser.email}</span>
                </div>
                {currentUser.telephone && (
                  <div className="profile-contact-item">
                    <span className="info-icon"><IoPhonePortraitOutline /></span>
                    <span>{currentUser.telephone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="profile-edit-button" onClick={() => {
                setIsEditing(true);
              }}>
                <span className="button-icon"><LiaUserEditSolid /></span>
                Modifier mon profil
              </button>
            </div>
          </div>
        </div>
        
        <div className="profile-navigation">
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${activeTab === 'informations' ? 'active' : ''}`}
              onClick={() => setActiveTab('informations')}
            >
              <span className="tab-icon"><HiOutlineInformationCircle /></span>
              Informations
            </button>
            <button 
              className={`profile-tab ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              <span className="tab-icon"><FaArrowTrendUp /></span>
              Statistiques
            </button>
            <button 
              className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="tab-icon"><SlCalender /></span>
              Activité
            </button>
            <button 
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="tab-icon"><MdOutlineSecurity /></span>
              Sécurité
            </button>
            <button 
              className={`profile-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="tab-icon"><MdNotificationsActive /></span>
              Notifications
            </button>
          </div>
        </div>
        
        <div className="profile-tab-content">
          <div className="profile-section-header">
            {activeTab === 'informations' && <h2>Informations personnelles</h2>}
            {activeTab === 'statistics' && <h2>Statistiques d'activité</h2>}
            {activeTab === 'activity' && <h2>Historique d'activités</h2>}
            {activeTab === 'security' && <h2>Sécurité et confidentialité</h2>}
            {activeTab === 'notifications' && <h2>Préférences de notifications</h2>}
          </div>
          
          <div className="profile-section-content">
            {activeTab === 'informations' && renderPersonalInfo()}
            {activeTab === 'statistics' && renderStatistics()}
            {activeTab === 'activity' && renderActivity()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'notifications' && renderNotifications()}
          </div>
        </div>
      </div>

      {/* Bouton Supprimer mon compte */}
      <div className="delete-account-section">
        <button 
          className="delete-account-btn"
          onClick={() => setShowDeleteAccountForm(true)}
          disabled={requestStatus?.has_request}
        >
          <LiaUserSlashSolid /> Supprimer mon compte
        </button>
        {requestStatus?.has_request && ( 
          <div className="delete-account-status">
            <PiUserSwitchDuotone /> {requestStatus.message}
          </div>
        )}
      </div>

      {/* Formulaire de suppression de compte */}
      {showDeleteAccountForm && !requestStatus?.has_request && ( 
        <div className="delete-account-overlay">
          <div className="delete-account-form">
            <h3><LiaUserSlashSolid /> Demande de suppression de compte</h3>
            <p>Veuillez expliquer pourquoi vous souhaitez supprimer votre compte. Cette action est irréversible.</p>
            
            {deleteAccountStatus.success ? (
              <div className="delete-account-success">
                <PiUserSwitchDuotone /> {deleteAccountStatus.message}
              </div>
            ) : ( 
              <>
                <div className="delete-form-group">
                  <label><AiTwotoneQuestionCircle /> Raison de la suppression</label>
                  <textarea
                    name="reason"
                    placeholder="Veuillez expliquer pourquoi vous souhaitez supprimer votre compte"
                    value={deleteAccountData.reason}
                    onChange={handleDeleteAccountInputChange}
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="delete-form-actions">
                  <button 
                    className="delete-form-submit"  
                    onClick={handleDeleteAccountSubmit}
                    disabled={isSubmitting || !deleteAccountData.reason.trim()}
                  >
                    <LuSend /> {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                  </button>
                  <button 
                    className="delete-form-cancel" 
                    onClick={() => setShowDeleteAccountForm(false)} 
                  >
                    <PiXDuotone /> Annuler
                  </button>  
                </div>
                {deleteAccountStatus.message && !deleteAccountStatus.success && (
                  <div className="delete-account-error">
                    {deleteAccountStatus.message}
                  </div>
                )}
              </> 
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;