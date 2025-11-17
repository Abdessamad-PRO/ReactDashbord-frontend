import api from '../axios';

const TaskCancellationService = {
  // Envoyer une demande d'annulation (par l'utilisateur)
  requestCancellation(taskId, formData) {
    return api.post(`/task-cancellation-request/${taskId}`, formData)
      .then(res => res.data); 
  },

  // Approuver une demande d'annulation (par le manager)
  approveRequest(requestId) {
    return api.post(`/manager/task-cancellations/${requestId}/approve`)
      .then(res => res.data);
  },
 
  // Rejeter une demande d'annulation (par le manager)
  rejectRequest(requestId, rejectionReason = '') { 
    return api.post(`/manager/task-cancellations/${requestId}/reject`, {
      rejection_reason: rejectionReason,
    }).then(res => res.data);
  }
};

export default TaskCancellationService;
