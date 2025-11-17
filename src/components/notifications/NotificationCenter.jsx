import { useState, useRef, useEffect } from 'react';
// import notificationService from '../../services/notificationService'; // adapte le chemin selon ton projet
import './NotificationCenter.css';
import notificationService from '../../services/notificationService';

const NotificationCenter = ({ setActiveMenu }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notes, setNotes] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Récupérer les notifications non lues
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getUnreadNotifications();
      setNotes(res.data); 
    } catch (err) { 
      console.error("Erreur lors de la récupération des notifications", err);
    }
  };

  // Compter les notifications non lues
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.count); 
    } catch (err) {
      console.error("Erreur lors du comptage des notifications", err);
    }
  }; 

  // Click en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); 
    };
  }, [showNotifications]);

  // Fetch au montage
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error("Erreur lors du marquage comme lu", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotes([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur lors du marquage global", err);
    }
  };

  return (
    <div className="notification-center" ref={notificationRef}>
      <button
        className="notification-trigger"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Centre de notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
 
      {showNotifications && ( 
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button className="mark-all-read" onClick={handleMarkAllAsRead}>
              Tout marquer comme lu
            </button>
          </div>

          <div className="notifications-list">
            {notes.length > 0 ? (
              notes.map(note => (
                <div
                  key={note.id}
                  className="notification-item unread"
                  onClick={() => handleMarkAsRead(note.id)}
                >
                  <div className="notification-icon">🔔</div>
                  <div className="notification-content">
                    <h4 className="notification-title">{note.title}</h4> 
                    <h4 className="notification-title">{note.content}</h4> 
                    <p className="notification-time">
                      {new Date(note.created_at).toLocaleString('fr-FR')}
                    </p>
                    <div className="notification-actions">
                      <button className="notification-action-btn">Ignorer</button>
                      <button className="notification-action-btn primary">Marquer comme lu</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="notifications-empty">
                <div className="notifications-empty-icon">🔔</div>
                <p>Aucune notification non lue</p> 
              </div>
            )}
          </div>

          <div className="notifications-footer">
            <button
              onClick={() => {
                setShowNotifications(false);
                setActiveMenu('notifications');
              }}
              className="view-all-btn"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
