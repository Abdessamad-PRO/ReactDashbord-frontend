import { useState } from 'react';
import './TaskForm.css';
import { BiTaskX } from 'react-icons/bi';
import { AiTwotoneInfoCircle } from 'react-icons/ai';
import TaskCancellationService from '../../services/taskCancellationService'; // Import du service

const TaskDeleteRequestForm = ({ onClose, taskTitle, taskId }) => {
  const [formData, setFormData] = useState({ 
    name: '',       // Correspond à 'name' dans le backend
    reason: ''      // Même nom que dans le backend
  });
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
      
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Veuillez entrer votre nom complet";
    }
    if (!formData.reason.trim()) {
      newErrors.reason = "Veuillez expliquer la raison de la demande d'annulation";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    } 
    
    setIsSubmitting(true);
    
    try {
      // Appel direct au service avec les données formatées
      await TaskCancellationService.requestCancellation(taskId, formData);
      
      // Afficher le message de confirmation
      setShowConfirmation(true);
      
      // Fermer le formulaire après un court délai
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setSubmitError("Une erreur est survenue lors de la soumission de votre demande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="task-form-modal">
        <div className="modal-header">
          <h2><BiTaskX className="delete-task-icon" /> Demande d'annulation d'une tâche</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {showConfirmation ? (
          <div className="confirmation-message">
            <div className="confirmation-content">
              <AiTwotoneInfoCircle className="confirmation-icon" />
              <p>Demande soumise au manager pour vérification</p>
            </div>
          </div>
        ) : (
          <>
            {submitError && (
              <div className="error-message">
                <p>{submitError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-info">
                <p>Tâche: <strong>{taskTitle}</strong></p>
                <p>Veuillez fournir les informations suivantes pour demander l'annulation de cette tâche. Votre demande sera examinée par un manager.</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label> 
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Entrez votre nom complet"
                  className={errors.name ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="reason">Raison de la demande d'annulation *</label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Expliquez pourquoi vous demandez l'annulation de cette tâche"
                  rows="4"
                  className={errors.reason ? 'error' : ''}
                  disabled={isSubmitting}
                ></textarea>
                {errors.reason && <span className="error-message">{errors.reason}</span>}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDeleteRequestForm;