import { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import deleteRequestService from '../../services/deleteRequestService';
import TaskCancellationService from '../../services/taskCancellationService';
import TaskStatusChangeService from '../../services/taskStatusChangeService';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTaskRequest, setSelectedTaskRequest] = useState(null);
  const [selectedStatusRequest, setSelectedStatusRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const loadNotifications = async () => { 
    setLoading(true); 
    setError(null); 
    
    try {
      const result = await notificationService.getFilteredNotifications(filter, sortBy);
      
      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.message);
        setNotifications([]);
      }
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.count);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du compteur:', err);
    }
  };

  const refreshData = () => {
    loadNotifications();
    loadUnreadCount();
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [filter, sortBy]);

  useEffect(() => {
    const intervalId = notificationService.startPolling((newNotifications) => {
      setNotifications(newNotifications);
      loadUnreadCount();
    }, 30000);

    return () => {
      notificationService.stopPolling(intervalId);
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const markAsRead = async (id) => {
    try {
      const result = await notificationService.markAsRead(id);
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors du marquage de la notification');
    }
  };

  const markAllAsRead = async () => { 
    try {
      const result = await notificationService.markAllAsRead();
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors du marquage de toutes les notifications');
    }
  };

  const deleteNotification = async (id) => { 
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }

    try {
      const result = await notificationService.deleteNotification(id);
      
      if (result.success) {
        const notificationToDelete = notifications.find(n => n.id === id);
        const wasUnread = notificationToDelete && !notificationToDelete.read;
        
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la notification');
    }
  };

  const approveAccountDeletion = async (requestId, notificationId) => { 
    if (!window.confirm('Êtes-vous sûr de vouloir approuver cette demande de suppression de compte ? Cette action est irréversible.')) {
      return;
    }

    setProcessingAction(true);
    try {
      const result = await deleteRequestService.approveRequest(requestId);

      if (result.success) {
        await markAsRead(notificationId);
        await deleteNotification(notificationId);
        setSuccessMessage('Demande de suppression de compte approuvée avec succès');
        refreshData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors de l\'approbation de la demande');
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectAccountDeletion = async () => { 
    if (!rejectionReason.trim()) {
      setError('Veuillez fournir une raison pour le rejet');
      return;
    }

    setProcessingAction(true);
    try {
      const result = await deleteRequestService.rejectRequest(
        selectedRequest.request_id, 
        rejectionReason
      );

      if (result.success) {
        await markAsRead(selectedRequest.notification_id);
        await deleteNotification(selectedRequest.notification_id);
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        setSuccessMessage('Demande de suppression de compte rejetée avec succès');
        refreshData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors du rejet de la demande');
    } finally {
      setProcessingAction(false);
    }
  };

  const approveTaskCancellation = async (requestId, notificationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir approuver cette demande d\'annulation de tâche ?')) {
      return;
    }

    setProcessingAction(true);
    try {
      const result = await TaskCancellationService.approveRequest(requestId);

      if (result.success) {
        await markAsRead(notificationId);
        await deleteNotification(notificationId);
        setSuccessMessage('Demande d\'annulation de tâche approuvée avec succès');
        refreshData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors de l\'approbation de la demande');
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectTaskCancellation = async () => {
    if (!rejectionReason.trim()) {
      setError('Veuillez fournir une raison pour le rejet');
      return;
    }

    setProcessingAction(true);
    try {
      const result = await TaskCancellationService.rejectRequest(
        selectedTaskRequest.request_id, 
        rejectionReason
      );

      if (result.success) {
        await markAsRead(selectedTaskRequest.notification_id);
        await deleteNotification(selectedTaskRequest.notification_id);
        setShowRejectModal(false);
        setSelectedTaskRequest(null);
        setRejectionReason('');
        setSuccessMessage('Demande d\'annulation de tâche rejetée avec succès');
        refreshData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur lors du rejet de la demande');
    } finally {
      setProcessingAction(false);
    }
  };

  const approveStatusChange = async (requestId, notificationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir approuver ce changement de statut ?')) {
      return;
    }

    setProcessingAction(true);
    try {
      const result = await TaskStatusChangeService.approveStatusChangeRequest(requestId);
      
      if (result.success) {
        await markAsRead(notificationId);
        await deleteNotification(notificationId);
        setSuccessMessage('Changement de statut approuvé avec succès');
        refreshData();
      } else {
        setError(result.message || "Échec de l'approbation");
      }
    } catch (err) {
      setError('Erreur lors de l\'approbation du changement de statut');
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectStatusChange = async (requestId, notificationId) => {
    setProcessingAction(true);
    try {
      const result = await TaskStatusChangeService.rejectStatusChangeRequest(requestId);
      
      if (result.success) {
        await markAsRead(notificationId);
        await deleteNotification(notificationId);
        setShowRejectModal(false);
        setSelectedStatusRequest(null);
        setRejectionReason('');
        setSuccessMessage('Changement de statut rejeté avec succès');
        refreshData();
      } else {
        setError(result.message || "Échec du rejet");
      }
    } catch (err) {
      setError('Erreur lors du rejet du changement de statut');
    } finally {
      setProcessingAction(false);
    }
  }; 

  const openRejectModal = (notification, type = 'account') => {
    const commonData = {
      request_id: notification.data?.request_id,
      notification_id: notification.id
    };

    if (type === 'task') {
      setSelectedTaskRequest({
        ...commonData,
        task_name: notification.data?.task_name,
        user_name: `${notification.data?.user_first_name} ${notification.data?.user_last_name}`,
        reason: notification.data?.reason
      });
      setSelectedRequest(null);
      setSelectedStatusRequest(null);
      setShowRejectModal(true);
    } else if (type === 'status') {
      setSelectedStatusRequest({
        ...commonData,
        task_name: notification.data?.task_name,
        user_name: `${notification.data?.user_first_name} ${notification.data?.user_last_name}`,
        requested_status: notification.data?.requested_status
      });
      setSelectedRequest(null);
      setSelectedTaskRequest(null);
      // Don't show modal for status change rejection
      rejectStatusChange(notification.data.request_id, notification.id);
    } else {
      setSelectedRequest({
        ...commonData,
        user_first_name: notification.data?.user_first_name,
        user_last_name: notification.data?.user_last_name,
        user_email: notification.data?.user_email
      });
      setSelectedTaskRequest(null);
      setSelectedStatusRequest(null);
      setShowRejectModal(true);
    }
    
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setSelectedTaskRequest(null);
    setSelectedStatusRequest(null);
    setRejectionReason('');
  };

  const getStatusLabel = (status) => {
    const labels = {
      'en_attente': 'À faire',
      'en_cours': 'En cours',
      'terminé': 'Terminé'
    };
    return labels[status] || status;
  };

  const getNotificationIcon = (type) => { 
    switch (type) {
      case 'delete_account_request': return '🗑️';
      case 'task_cancellation_request': return '✖️';
      case 'task_status_change': return '🔄';
      case 'account_deleted': return '✅';
      case 'account_deletion_rejected': return '❌';
      case 'info': return '📋';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Chargement des notifications...</p>
        </div>
      </div>
    ); 
  }

  return ( 
    <div className="notifications-page">
      <div className="notifications-page-header">
        <div className="header-title">
          <h1>Centre de Notifications</h1>
          {/* {unreadCount > 0 && (
            <div className="unread-badge">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </div> 
          )} */} 
        </div>
        
        <div className="notifications-controls">
          <div className="notifications-filters">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toutes les notifications</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Trier par date</option>
              <option value="type">Trier par type</option>
            </select>
          </div>
          
          <div className="action-buttons">
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              disabled={loading || unreadCount === 0}
            >
              Tout marquer comme lu
            </button>
          </div> 
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-message">❌ {error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div> 
      )}

      {successMessage && (
        <div className="success-banner">
          <span className="success-message">✅ {successMessage}</span>
          <button onClick={clearSuccessMessage} className="success-close">×</button>
        </div>
      )}

      <div className="notifications-list-container"> 
        {notifications.length > 0 ? (
          <div className="notifications-grid">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${notification.read ? 'read' : 'unread'} ${
                  notification.type === 'delete_account_request' ? 'delete-request' : 
                  notification.type === 'task_cancellation_request' ? 'task-request' :
                  notification.type === 'task_status_change' ? 'status-request' : ''
                }`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div> 
                <div className="notification-content"> 
                  <h3 className="notification-title">{notification.title}</h3> 
                  <p className="notification-message">{notification.message}</p> 
                  
                  {notification.data?.rejection_reason && ( 
                    <div className="rejection-reason">
                      <strong>Raison du rejet :</strong> {notification.data.rejection_reason}
                    </div>
                  )}
                  
                  {notification.type === 'delete_account_request' && notification.data && ( 
                    <div className="delete-request-details">
                      <div className="user-info"> 
                        <p><strong>Utilisateur:</strong> {notification.data.user_first_name} {notification.data.user_last_name}</p>
                        <p><strong>Email:</strong> {notification.data.user_email}</p>
                        <p><strong>Rôle:</strong> {notification.data.user_role}</p>
                        {notification.data.deletion_reason && ( 
                          <p><strong>Raison:</strong> {notification.data.deletion_reason}</p>
                        )} 
                      </div> 
                      <div className="request-actions">
                        <button 
                          onClick={() => approveAccountDeletion(notification.data.request_id, notification.id)}
                          className="action-btn approve-btn"
                          disabled={processingAction} 
                        >
                          {processingAction ? '⏳' : '✅'} Approuver
                        </button>
                        <button 
                          onClick={() => openRejectModal(notification)} 
                          className="action-btn reject-btn"
                          disabled={processingAction} 
                        >
                          {processingAction ? '⏳' : '❌'} Rejeter
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {notification.type === 'task_cancellation_request' && notification.data && (
                    <div className="task-cancellation-details">
                      <div className="request-info">
                        <p><strong>Tâche:</strong> {notification.data.task_name}</p>
                        <p><strong>Demandeur:</strong> {notification.data.user_name} </p>
                        <p><strong>Raison:</strong> {notification.data.reason}</p>
                      </div>
                      <div className="request-actions">
                        <button 
                          onClick={() => approveTaskCancellation(notification.data.request_id, notification.id)}
                          className="action-btn approve-btn"
                          disabled={processingAction}
                        >
                          {processingAction ? '⏳' : '✅'} Approuver
                        </button>
                        <button 
                          onClick={() => openRejectModal(notification, 'task')} 
                          className="action-btn reject-btn"
                          disabled={processingAction}
                        >
                          {processingAction ? '⏳' : '❌'} Rejeter
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {notification.type === 'task_status_change' && notification.data && (
                    <div className="status-change-details">
                      <div className="request-info">
                        <p><strong>Tâche:</strong> {notification.data.task_name}</p>
                        <p><strong>Demandeur:</strong> {notification.data.user_name} </p>
                        <p><strong>Nouveau statut demandé:</strong> {getStatusLabel(notification.data.requested_status)}</p>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => approveStatusChange(notification.data.request_id, notification.id)}
                          className="action-btn approve-btn"
                          disabled={processingAction}
                        >
                          {processingAction ? '⏳' : '✅'} Approuver
                        </button>
                        <button
                          onClick={() => openRejectModal(notification, 'status')}
                          className="action-btn reject-btn"
                          disabled={processingAction}
                        >
                          {processingAction ? '⏳' : '❌'} Rejeter
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="notification-meta">
                    <span className="notification-date">
                      {formatDate(notification.created_at)}
                    </span>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="action-btn read-btn"
                          disabled={loading}
                        >
                          Marquer comme lu
                        </button> 
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="action-btn delete-btn"
                        disabled={loading}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <p>
              {filter === 'unread' 
                ? 'Aucune notification non lue' 
                : filter === 'read' 
                ? 'Aucune notification lue' 
                : 'Aucune notification à afficher'
              }
            </p>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeRejectModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {selectedRequest && 'Rejeter la demande de suppression de compte'}
                {selectedTaskRequest && 'Rejeter la demande d\'annulation de tâche'}
              </h3>
              <button onClick={closeRejectModal} className="modal-close">×</button>
            </div> 
            <div className="modal-body">
              {selectedRequest && (
                <>
                  <p><strong>Utilisateur:</strong> {selectedRequest.user_last_name} {selectedRequest.user_first_name}</p>
                  <p><strong>Email:</strong> {selectedRequest.user_email}</p>
                </>
              )}
              {selectedTaskRequest && (
                <>
                  <p><strong>Tâche:</strong> {selectedTaskRequest.task_name}</p>
                  {/* <p><strong>Demandeur:</strong> {selectedTaskRequest.user_name}</p> */} 
                  <p><strong>Raison originale:</strong> {selectedTaskRequest.reason}</p>
                </>
              )}
              <div className="form-group">
                <label htmlFor="rejection-reason">Raison du rejet <span style={{color: 'red'}}>*</span>:</label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous rejetez cette demande..."
                  rows="4"
                  className="rejection-textarea"
                  maxLength="1000"
                />
                <small style={{color: '#6c757d', fontSize: '12px'}}>
                  {rejectionReason.length}/1000 caractères
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={closeRejectModal} 
                className="btn-secondary"
                disabled={processingAction}
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  if (selectedRequest) {
                    rejectAccountDeletion();
                  } else if (selectedTaskRequest) {
                    rejectTaskCancellation();
                  }
                }}
                className="btn-danger"
                disabled={processingAction || !rejectionReason.trim()}
                onClose={closeRejectModal}    ///// j'ai ajouté cette ligne 
              >
                {processingAction ? '⏳ Traitement...' : 'Rejeter la demande'}
              </button>
            </div>
          </div>
        </div> 
      )}
    </div>
  );
};

export default NotificationsPage;