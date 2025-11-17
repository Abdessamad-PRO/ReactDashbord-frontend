import { useState, useRef, useEffect } from 'react';
import UserProfile from './UserProfile';

const ProfileButton = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  // État pour stocker l'URL de l'avatar avec un timestamp pour forcer le rafraîchissement
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || 'https://content-viajes.nationalgeographic.com.es/medio/2023/03/24/big-ben-y-alrededores_852e28a7_475606798_230324072203_1280x841.jpg');
 
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  
  // Status du profil (en ligne/occupé/absent)
  const userStatus = user.status || 'online';

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

  // Ferme le profil quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]); 

  return (
    <div className="profile-container" ref={profileRef}>
      <button  
        className="profile-button" 
        onClick={toggleProfile}
        aria-expanded={showProfile}
        aria-label="Menu du profil utilisateur"
      >
        <div className="profile-avatar-wrapper"> 
          <img 
            // src={`http://localhost:8000/${user.avatarUrl}`} 
            src={`https://archive.org/download/instagram-plain-round/instagram%20dip%20in%20hair.jpg`} 
            alt={`Avatar de ${user.firstName}`} 
             
            className="profile-avatar-img"
            style={{ objectFit: 'cover', border: '2px solid var(--primary-color-light)' }}
          />
          {console.log('IMAGE ',user.avatarUrl)} ;
          <span className={`profile-status-indicator ${userStatus}`} title={`Statut: ${userStatus}`}></span>
        </div>
      </button>
      
      {showProfile && (
        <div className="profile-popup">
          <div className="profile-popup-arrow"></div>
          <UserProfile 
            user={user} 
            onClose={() => setShowProfile(false)} 
            onLogout={onLogout}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
