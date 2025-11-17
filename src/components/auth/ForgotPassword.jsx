import { useState } from 'react';
import logoDark from '../../assets/images/dashboard logo.png';
import AuthService from '../../services/auth';

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // Étapes: 1=email, 2=code vérification, 3=nouveau mdp
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Styles pour la mise en page et cohérence avec la page de connexion
  const styles = {
    container: {
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      padding: '2rem',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    logoImg: {
      width: '140px',
      height: 'auto',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      textAlign: 'center',
      color: 'var(--text-primary)',
    },
    subtitle: {
      fontSize: '1rem',
      marginBottom: '2rem',
      textAlign: 'center',
      color: 'var(--text-secondary)',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
    },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: '0.375rem',
      border: '1px solid var(--border-color)',
      fontSize: '1rem',
      backgroundColor: 'var(--input-bg)',
      color: 'var(--text-primary)',
      width: '100%',
      transition: 'border-color 0.2s ease',
    },
    button: {
      padding: '0.75rem 1rem',
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    buttonSecondary: {
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    error: {
      padding: '0.75rem 1rem',
      backgroundColor: 'var(--error-bg)',
      color: 'var(--error-text)',
      borderRadius: '0.375rem',
      marginBottom: '1.5rem',
    },
    success: {
      padding: '0.75rem 1rem',
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success-text)',
      borderRadius: '0.375rem',
      marginBottom: '1.5rem',
    },
    codeInput: {
      letterSpacing: '0.5rem',
      textAlign: 'center',
      fontWeight: 'bold',
    },
  };

  // Gestion soumission du formulaire d'email
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email');
      return;
    }
    
    setIsSubmitting(true);
    
    // Mode test - Décommentez ces lignes pour tester l'interface sans API
    const testMode = false; // Mettre à false pour utiliser l'API réelle
    
    if (testMode) {
      // Simuler un envoi réussi
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          setStep(2);
          setSuccess(false);
        }, 2000);
        setIsSubmitting(false);
      }, 1500);
      return;
    }
    
    try {
      console.log('Tentative d\'envoi du code à l\'email:', email);
      // Appel à l'API Laravel pour envoyer un code de vérification
      await AuthService.forgotPassword({ email });
      console.log('Code envoyé avec succès');
      setSuccess(true);
      
      // Passer à l'étape du code de vérification
      setTimeout(() => { 
        setStep(2);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Réponse d\'erreur:', error.response?.data);
      console.error('Statut d\'erreur:', error.response?.status);
      console.error('URL appelée:', error.config?.url);
      console.error('Méthode HTTP:', error.config?.method);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion soumission du code de vérification
  const handleSubmitCode = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode.trim() || verificationCode.length < 6) {
      setError('Veuillez saisir le code de vérification complet');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Vérifier le code avec l'API
      await AuthService.verifyResetCode({
        email,
        code: verificationCode
      });
      
      // Passer à l'étape de réinitialisation du mot de passe
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.message || 'Code de vérification invalide');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion soumission du nouveau mot de passe
  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword.trim()) {
      setError('Veuillez saisir un nouveau mot de passe');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Appel à l'API Laravel pour réinitialiser le mot de passe
      await AuthService.resetPassword({
        email,
        code: verificationCode,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      
      setSuccess(true);
      // Redirection vers la page de connexion après quelques secondes
      setTimeout(() => {
        handleBackToLogin();
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retour à la page de connexion
  const handleBackToLogin = () => {
    onBack && onBack();
  };

  // Afficher le contenu en fonction de l'étape
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 style={styles.title}>Mot de passe oublié</h1>
            <p style={styles.subtitle}>
              Veuillez saisir votre adresse email. <br/>
              Nous vous enverrons un code de vérification.
            </p>
            
            {error && <div style={styles.error}>{error}</div>}
            {success && (
              <div style={styles.success}>
                Un code de vérification a été envoyé à votre adresse email.
              </div>
            )}
            
            <form onSubmit={handleSubmitEmail} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>Adresse email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
                  disabled={isSubmitting}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  style={{ ...styles.button, flex: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le code'}
                </button>
              </div>
            </form>
          </>
        );
      
      case 2:
        return (
          <>
            <h1 style={styles.title}>Vérification du code</h1>
            <p style={styles.subtitle}>
              Veuillez saisir le code de vérification que nous avons envoyé à {email}.
              <br/>Le code est valide pendant 15 minutes.
            </p>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmitCode} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="verificationCode" style={styles.label}>Code de vérification</label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ ...styles.input, ...styles.codeInput }}
                  disabled={isSubmitting}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
                  disabled={isSubmitting}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  style={{ ...styles.button, flex: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Vérification...' : 'Vérifier le code'}
                </button>
              </div>
            </form>
          </>
        );
      
      case 3:
        return (
          <>
            <h1 style={styles.title}>Réinitialisation du mot de passe</h1>
            <p style={styles.subtitle}>
              Veuillez saisir votre nouveau mot de passe.
            </p>
            
            {error && <div style={styles.error}>{error}</div>}
            {success && (
              <div style={styles.success}>
                Mot de passe modifié avec succès.
              </div>
            )}
            
            <form onSubmit={handleSubmitNewPassword} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="newPassword" style={styles.label}>Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="confirmPassword" style={styles.label}>Confirmez le mot de passe</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Saisissez à nouveau votre mot de passe"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
                  disabled={isSubmitting}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  style={{ ...styles.button, flex: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Modification en cours...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      {/* Formes décoratives d'arrière-plan */}
      <div className="auth-background">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
        <div className="auth-shape auth-shape-4"></div>
      </div>
      
      <div className="auth-card modern-card">
        <div style={styles.logo}>
          <img
            src={logoDark}
            alt="Dashboard"
            style={styles.logoImg}
          />
        </div>
        
        <div style={styles.container}>
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
