import React, { useState, useRef } from 'react';
import { formatRole } from '../../utils';
import './ProfilePage.css';
import AuthService from '../../services/auth';
import { IoIosAddCircle } from "react-icons/io";
import { PiArrowsClockwiseDuotone } from "react-icons/pi";
import { PiCheckFatDuotone } from "react-icons/pi";
import { PiXDuotone } from "react-icons/pi";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdOutlineSecurity } from "react-icons/md";
import { LiaUserEditSolid } from "react-icons/lia";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { MdOutlinePassword } from "react-icons/md";

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

  // Les données mockées pour les statistiques et activités ont été supprimées

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      setIsSubmitting(true);
      setUpdateStatus({ success: false, message: '' });
      
      // Préparer les données à envoyer
      const profileData = {
        name: formData.lastName,
        prenom: formData.firstName,
        email: formData.email,
        telephone: formData.phone,
        adresse: formData.address,
        bio: formData.bio,
      };
      
      // Log pour débogage
      console.log('Données envoyées au backend:', profileData);
      console.log('Image à envoyer:', imageFile);
      
      // Envoyer les données au backend
      const response = await AuthService.updateUserProfile(profileData, imageFile);
      
      // Afficher les données mises à jour dans la console pour débogage
      console.log('Profile updated:', response);
      
      // Créer un objet utilisateur mis à jour avec les nouvelles données
      const updatedUser = {
        ...currentUser,
        prenom: formData.firstName,
        name: formData.lastName,
        email: formData.email,
        telephone: formData.phone,
        adresse: formData.address,
        bio: formData.bio,
      };
      
      // Si une nouvelle image a été téléchargée et que le backend a renvoyé une URL
      if (response.user && response.user.avatarUrl) {
        updatedUser.avatarUrl = response.user.avatarUrl;
      } else if (selectedImage) {
        // Utiliser l'image sélectionnée comme URL temporaire si le backend n'a pas renvoyé d'URL
        updatedUser.avatarUrl = selectedImage;
      }
      
      // Mettre à jour currentUser pour refléter les modifications dans l'en-tête
      if (typeof onUpdateProfile === 'function') {
        // Appeler la fonction de mise à jour passée en props avec les données mises à jour
        onUpdateProfile(updatedUser);
      }
      
      // Afficher un message de succès
      setUpdateStatus({ 
        success: true, 
        message: 'Votre profil a été mis à jour avec succès!' 
      });
      
      // Fermer le mode édition après 2 secondes
      setTimeout(() => {
        setIsEditing(false);
        toggleBodyScroll(false); // Réactiver le défilement
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
    // toggleBodyScroll(false); // Réactiver le défilement - supprimé
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setImageFile(e.target.files[0]);
      };
      
      reader.readAsDataURL(e.target.files[0]);
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
  
  // Les fonctions renderStatistics et renderActivity ont été supprimées

  const renderSecurity = () => {
    return (
      <div className="profile-security-container">
        <div className="profile-info-card">
          <h3>Sécurité du compte</h3>
        
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
          
          {/* Élément Sessions actives supprimé */}
        </div>
        {/* Section Préférences de confidentialité supprimée */}
      </div>
    );
  };

  // La fonction renderNotifications a été supprimée

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
                {currentUser.phone && (
                  <div className="profile-contact-item">
                    <span className="info-icon"><IoPhonePortraitOutline /></span>
                    <span>{currentUser.phone}</span>
                  </div>
                )}
              </div>
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
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="tab-icon"><MdOutlineSecurity /></span>
              Sécurité
            </button>
          </div> 
        </div>
        
        <div className="profile-tab-content">
          <div className="profile-section-header">
            {activeTab === 'informations' && <h2>Informations personnelles</h2>}
            {activeTab === 'security' && <h2>Sécurité et confidentialité</h2>}
          </div>
          
          <div className="profile-section-content">
            {activeTab === 'informations' && renderPersonalInfo()}
            {activeTab === 'security' && renderSecurity()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
