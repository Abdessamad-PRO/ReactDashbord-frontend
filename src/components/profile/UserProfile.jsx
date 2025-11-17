import { useState, useEffect } from 'react';
import { formatRole } from '../../utils';
import { MdOutlinePowerSettingsNew } from "react-icons/md";

const UserProfile = ({ user, onClose, onLogout }) => {

  // État pour stocker l'URL de l'avatar avec un timestamp pour forcer le rafraîchissement
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || 'https://via.placeholder.com/150');

  // Effet pour mettre à jour l'URL de l'avatar lorsque user.avatarUrl change
  useEffect(() => {
    if (user.avatarUrl) {
      // Ajouter un timestamp à l'URL pour forcer le rafraîchissement de l'image
      const timestamp = new Date().getTime();
      // Vérifier si l'URL contient déjà un paramètre de requête 
      const separator = user.avatarUrl.includes('?') ? '&' : '?';
      setAvatarUrl(`${user.avatarUrl}${separator}t=${timestamp}`);
    } else {
      setAvatarUrl('https://content-viajes.nationalgeographic.com.es/medio/2023/03/24/big-ben-y-alrededores_852e28a7_475606798_230324072203_1280x841.jpg');
    }
  }, [user.avatarUrl]);
 
  return (
    <div className="profile-dropdown">
      <button className="profile-close-btn" onClick={onClose} aria-label="Fermer">
        <span>×</span>
      </button>
      
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        <div className="profile-avatar-container" style={{ marginRight: '9px' }}>
          <img  
            // src={user.avatarUrl} 
            src={`https://archive.org/download/instagram-plain-round/instagram%20dip%20in%20hair.jpg`} 
            alt={`Avatar de ${user.prenom}`} 
            className="profile-avatar" 
            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          />
        </div>
        <div className="profile-main-info">
          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '500' }}>{user.prenom} {user.name}</h3>
          <p className="profile-role" style={{ margin: '0', color: 'var(--primary-color)', fontSize: '14px' }}>{formatRole(user.role)}</p>
        </div>
      </div>

      <div className="profile-content" style={{ padding: '0 20px' }}>
          <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="profile-info-group" style={{ backgroundColor: 'var(--card-bg-accent)', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Informations personnelles</h4>
              <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
                <span className="profile-label" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Email:</span>
                <span className="profile-value" style={{ color: 'var(--text-primary)' }}>{user.email}</span>
                
                <span className="profile-label" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Téléphone:</span>
                <span className="profile-value" style={{ color: 'var(--text-primary)' }}>{user.telephone || 'Non renseigné'}</span>
                
                <span className="profile-label" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Adresse:</span>
                <span className="profile-value" style={{ color: 'var(--text-primary)' }}>{user.adresse || 'Non renseignée'}</span>
                
                <span className="profile-label" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Département:</span>
                <span className="profile-value" style={{ color: 'var(--text-primary)' }}>{user.departement || 'Non renseigné'}</span>
              </div>
            </div>
    
            <div className="profile-info-group" style={{ backgroundColor: 'var(--card-bg-accent)', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Informations du compte</h4>
              <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
                <span className="profile-label" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Identifiant:</span>
                <span className="profile-value" style={{ color: 'var(--text-primary)' }}>{user.id || 'USER123'}</span> 
                
                <span className="profile-label" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Date d'inscription:</span>
                <span className="profile-value" style={{ color: 'var(--text-primary)' }}>{user.createdAt || '01/01/2025'}</span>
                
                <span className="profile-label" style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Dernière connexion:</span>
                <span className="profile-value" style={{ color: 'var(--text-primary)' }}>{user.lastLogin || 'Aujourd\'hui'}</span>
              </div>
            </div>
          </div>
      </div>
      
      <div className="profile-footer" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', marginTop: '15px', textAlign: 'center' }}>
        <button 
          className="profile-action-btn logout"
          onClick={onLogout}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <span className="action-icon" style={{ marginRight: '8px' }}><MdOutlinePowerSettingsNew /></span>
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
