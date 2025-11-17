import api from '../axios'; // ← ton instance Axios configurée avec le token

const TaskStatusChangeService = {
  requestStatusChange: (taskId, requestedStatus) => {
    return api.post(`/task-status-change-request/${taskId}`, {
      requested_status: requestedStatus
    }).then(res => res.data); 
  }, 


  // Optionnel : approuver une demande
  approveStatusChangeRequest: (requestId) => {
    return api.post(`/task-status-change-request/${requestId}/approve`)
    .then(res => res.data);
  },

  // Optionnel : rejeter une demande
  rejectStatusChangeRequest: (requestId) => {
    return api.post(`/task-status-change-request/${requestId}/reject`)
    .then(res => res.data);
  }
};

export default TaskStatusChangeService;
