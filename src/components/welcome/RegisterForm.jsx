import React, { useState, useEffect, useRef } from 'react';
import '../../welcome.css';
import logoDark from '../../assets/images/dashboard logo.png';
import './RegisterForm.css';
import AuthService from '../../services/auth';
import { PiInfoDuotone } from "react-icons/pi";
import { GrReturn } from "react-icons/gr";
import { PiUserCircleCheckBold } from "react-icons/pi";
import { TbCodeVariable } from "react-icons/tb";
import { TbReload } from "react-icons/tb";
import { MdOutlineContactPhone } from "react-icons/md";
import { PiUsersDuotone } from "react-icons/pi";
import { PiUserSquareDuotone } from "react-icons/pi";
import { AiTwotoneMail } from "react-icons/ai";
import { PiUserCheckDuotone } from "react-icons/pi";

const RegisterForm = ({ onBack, onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    phone: '',
    captcha: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaExpiry, setCaptchaExpiry] = useState(0);
  
  // Référence pour le canvas et le conteneur du formulaire
  const captchaCanvasRef = useRef(null);
  const formContainerRef = useRef(null);
  
  // Styles pour le formulaire de création de compte
  const styles = {
    authContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)'
    },
    authContentWrapper: {
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      overflow: 'hidden'
    },
    authLeftColumn: {
      width: '40%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      borderRight: '1px solid var(--border-color)',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--text-primary)'
    },
    authLeftBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgb(192, 190, 237) 0%, #c7d2fe 50%, white 100%)',
      backdropFilter: 'blur(12px)',
      opacity: 0.75,
      zIndex: 1
    },
    authLeftContent: {
      position: 'relative',
      zIndex: 2,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    authLogo: {
      marginBottom: '2rem'
    },
    authLogoImg: {
      height: '85px',
      width: 'auto'
    },
    authWelcomeText: {
      fontSize: '2rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: 'var(--text-primary)',
      fontFamily: '"Poppins", sans-serif'
    },
    authWelcomeDescription: {
      marginBottom: '2rem', 
      textAlign: 'center',
      lineHeight: '1.6',
      fontSize: '1.1rem',
      fontFamily: '"Poppins", sans-serif',
      color: 'var(--text-secondary)'
    },
    authRightColumn: {
      width: '60%',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 3.5rem',
      justifyContent: 'center'
    },
    authFormTitle: {
      fontSize: '1.75rem',
      fontWeight: '600',
      marginBottom: '2rem',
      color: 'var(--text-primary)'
    },
    formRow: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '0.75rem'
    },
    formGroup: {
      marginBottom: '1rem',
      width: '100%'
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.4rem',
      fontWeight: '500',
      fontSize: '0.95rem'
    },
    formInput: {
      width: '100%',
      padding: '0.65rem 0.85rem 0.65rem 2.3rem',
      borderRadius: '0.5rem',
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--input-bg)',
      color: 'var(--text-primary)',
      fontSize: '0.95rem',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      outline: 'none'
    },
    formInputFocus: {
      borderColor: 'var(--primary-color)',
      boxShadow: '0 0 0 2px var(--primary-light)'
    },
    inputWithIcon: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-secondary)'
    },
    captchaWrapper: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    captchaCanvas: {
      marginRight: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid var(--border-color)',
      background: 'var(--input-bg)'
    },
    captchaRefreshBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.25rem'
    },
    formError: {
      color: 'var(--error-color)',
      fontSize: '0.875rem',
      marginTop: '0.5rem'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '1.5rem',
      marginBottom: '0.5rem',
      marginLeft: '-0.2rem',
      marginRight: '-0.2rem'
    },
    backBtn: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      padding: '0.75rem 1.4rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      marginTop: '-1rem'
    },
    submitBtn: {
      backgroundColor: 'var(--primary-color)',
      color: 'var(--button-text)',
      border: 'none',
      padding: '0.75rem 1.4rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '-1rem'
    },
    submitBtnHover: {
      backgroundColor: 'var(--primary-dark)',
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)'
    },
    notification: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success-text)',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: 'var(--shadow-md)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      maxWidth: '350px',
      animation: 'slideIn 0.3s ease-out forwards'
    },
    notificationIcon: {
      marginRight: '0.75rem',
      fontSize: '1.5rem'
    },
    notificationText: {
      fontSize: '14px',
      lineHeight: '1.4'
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Valider prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    // Valider nom
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    // Valider email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Valider rôle
    if (!formData.role.trim()) {
      newErrors.role = 'Le rôle est requis';
    }
    
    // Valider CAPTCHA
    if (!formData.captcha.trim()) {
      newErrors.captcha = 'Le CAPTCHA est requis';
    } else if (formData.captcha !== captchaText) { 
      console.log('Captcha saisi:', formData.captcha);
      console.log('Captcha attendu:', captchaText);
      newErrors.captcha = 'CAPTCHA incorrect';
      // Générer un nouveau CAPTCHA si la réponse est incorrecte
      generateCaptcha();
    } else if (Date.now() > captchaExpiry) {
      newErrors.captcha = 'CAPTCHA expiré, veuillez essayer à nouveau';
      // Générer un nouveau CAPTCHA si celui-ci a expiré
      generateCaptcha();
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Préparer les données à envoyer
        const registrationData = {
          name: formData.lastName,
          prenom: formData.firstName,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || null
        };
        
        // Log pour débogage
        console.log('Données d\'inscription envoyées:', registrationData);
        
        // Vérifier que les champs obligatoires sont bien remplis
        if (!registrationData.name || !registrationData.prenom || !registrationData.email) {
          alert("Veuillez remplir tous les champs obligatoires (nom, prénom, email)");
          return;
        }
        
        // Envoyer la demande d'inscription à l'API
        const response = await AuthService.requestRegistration(registrationData);
        
        // Afficher la notification de succès
        setShowNotification(true);
        
        // Rediriger vers la page d'authentification après un court délai
        setTimeout(() => {
          setShowNotification(false);
          onBack(); // Revenir à la page d'accueil
          setTimeout(() => {
            onRegister(); // Rediriger vers la page d'authentification
          }, 300);
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de la demande d\'inscription:', error);
        
        // Gérer les erreurs de validation du serveur
        if (error.response?.data?.errors) {
          const serverErrors = {};
          Object.entries(error.response.data.errors).forEach(([key, value]) => {
            // Convertir les clés du serveur en clés du formulaire
            const formKey = key === 'first_name' ? 'firstName' : 
                           key === 'last_name' ? 'lastName' : key;
            serverErrors[formKey] = value[0]; // Prendre le premier message d'erreur
          });
          setErrors(serverErrors);
        } else {
          // Afficher une erreur générale
          alert('Une erreur est survenue lors de la demande d\'inscription. Veuillez réessayer plus tard.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Générer un texte CAPTCHA aléatoire (uniquement des chiffres pour plus de simplicité)
  const generateCaptcha = () => {
    // Utiliser uniquement des chiffres pour éviter tout problème de casse ou de confusion visuelle
    const digits = '0123456789';
    let text = '';
    for (let i = 0; i < 4; i++) { // Réduire à 4 chiffres pour plus de simplicité
      text += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    setCaptchaText(text);
    setCaptchaExpiry(Date.now() + 10 * 60 * 1000); // Expire après 10 minutes
    
    // Réinitialiser le champ captcha
    setFormData(prev => ({ ...prev, captcha: '' }));
    
    // Dessiner le CAPTCHA au prochain render
    setTimeout(drawCaptcha, 50);
    
    // Log pour le débogage
    console.log('Nouveau CAPTCHA généré:', text);
  };
  
  // Dessiner le texte CAPTCHA sur le canvas
  const drawCaptcha = () => {
    if (captchaCanvasRef.current && captchaText) {
      const canvas = captchaCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Arrière-plan
      ctx.fillStyle = '#f0f2f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner des lignes de bruit (réduites pour plus de lisibilité)
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, 0.3)`;
        ctx.lineWidth = Math.random() * 1.5;
        ctx.stroke();
      }
      
      // Configurer le texte (plus grand et plus lisible)
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Dessiner chaque caractère avec une légère rotation
      for (let i = 0; i < captchaText.length; i++) {
        ctx.save();
        ctx.translate(40 + i * 30, canvas.height / 2);
        ctx.rotate((Math.random() - 0.5) * 0.2); // Rotation réduite pour plus de lisibilité
        ctx.fillStyle = `rgb(${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)})`;
        ctx.fillText(captchaText[i], 0, 0);
        ctx.restore();
      }
      
      // Dessiner des points de bruit (réduits pour plus de lisibilité)
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }
    }
  };
  
  // Générer un nouveau CAPTCHA au chargement
  useEffect(() => {
    generateCaptcha();
  }, []);
  
  // Redessiner le CAPTCHA lorsque le texte change
  useEffect(() => {
    if (captchaText) {
      drawCaptcha();
    }
  }, [captchaText]);
  
  return (
    <div className="auth-container animate-fadeIn" style={styles.authContainer}>
      {showNotification && (
        <div className="notification" style={styles.notification}>
        <span style={styles.notificationIcon}><PiUserCheckDuotone /></span>
        <div style={styles.notificationText}>
          <strong>Demande envoyée avec succès!</strong>
          <p>Votre demande d'inscription a été transmise à l'administrateur pour validation. Vous recevrez un email dès que votre compte sera activé.</p>
        </div>
      </div>
      )} 
      
      <div className="auth-content-wrapper animate-fadeIn" style={styles.authContentWrapper}>
        {/* Colonne de gauche avec logo et message */}
        <div className="auth-left-column" style={styles.authLeftColumn}>
          {/* Fond flou */}
          <div className="auth-left-bg" style={styles.authLeftBg}></div>
          
          {/* Contenu par-dessus le fond flou */}
          <div className="auth-left-content" style={styles.authLeftContent}>
            <div className="auth-logo animate-fadeInUp" style={{...styles.authLogo, animationDelay: '0.1s'}}>
              <img 
                src={logoDark} 
                alt="Dashboard" 
                className="auth-logo-img" 
                style={styles.authLogoImg}
              />
            </div>
            <h2 className="auth-welcome-text animate-fadeInUp" style={{...styles.authWelcomeText, animationDelay: '0.2s'}}>Rejoignez-nous</h2>
            <p className="auth-welcome-description animate-fadeInUp" style={{...styles.authWelcomeDescription, animationDelay: '0.3s'}}>
              Créez votre compte pour accéder à toutes les fonctionnalités de notre plateforme
            </p>
          </div>
        </div>
        
        {/* Colonne de droite avec formulaire */}
        <div className="auth-right-column" style={styles.authRightColumn}>
          <h2 className="auth-form-title animate-fadeInUp" style={{...styles.authFormTitle, animationDelay: '0.2s'}}>Créer un compte</h2>
          
          <div ref={formContainerRef} className="form-container animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <form onSubmit={handleSubmit} className="animate-fadeIn" style={{transitionDelay: '0.4s'}}>
              <div className="form-row" style={styles.formRow}>
                <div className="form-group" style={styles.formGroup}>
                  <label className="form-label" style={styles.formLabel} htmlFor="firstName">Prénom</label>
                  <div className="input-with-icon" style={styles.inputWithIcon}>
                    <i className="input-icon" style={styles.inputIcon}><PiUserSquareDuotone /></i>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-input"
                      style={styles.formInput}
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.firstName && <div className="form-error" style={styles.formError}>{errors.firstName}</div>}
                </div>
                
                <div className="form-group" style={styles.formGroup}>
                  <label className="form-label" style={styles.formLabel} htmlFor="lastName">Nom</label>
                  <div className="input-with-icon" style={styles.inputWithIcon}>
                    <i className="input-icon" style={styles.inputIcon}><PiUserSquareDuotone /></i>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-input"
                      style={styles.formInput}
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.lastName && <div className="form-error" style={styles.formError}>{errors.lastName}</div>}
                </div>
              </div>
              
              <div className="form-group" style={styles.formGroup}>
                <label className="form-label" style={styles.formLabel} htmlFor="email">Email</label>
                <div className="input-with-icon" style={styles.inputWithIcon}>
                  <i className="input-icon" style={styles.inputIcon}><AiTwotoneMail /></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    style={styles.formInput}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre.email@entreprise.com"
                  />
                </div>
                {errors.email && <div className="form-error" style={styles.formError}>{errors.email}</div>}
              </div>
              
              <div className="form-group" style={styles.formGroup}>
                <label className="form-label" style={styles.formLabel} htmlFor="role">Rôle</label>
                <div className="input-with-icon" style={styles.inputWithIcon}>
                  <i className="input-icon" style={styles.inputIcon}><PiUsersDuotone /></i>
                  <select
                    id="role"
                    name="role"
                    className="form-input"
                    style={{...styles.formInput, paddingLeft: '2.5rem', appearance: 'auto'}}
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="user">Employé</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                {errors.role && <div className="form-error" style={styles.formError}>{errors.role}</div>}
              </div>
              
              <div className="form-group" style={styles.formGroup}>
                <label className="form-label" style={styles.formLabel} htmlFor="phone">Téléphone (optionnel)</label>
                <div className="input-with-icon" style={styles.inputWithIcon}>
                  <i className="input-icon" style={styles.inputIcon}><MdOutlineContactPhone /></i>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    style={styles.formInput}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+212 6 XX XX XX XX"
                  />
                </div>
              </div>
              
              <div className="form-group captcha-container" style={styles.formGroup}>
                <label className="form-label" style={styles.formLabel}>Vérification que vous êtes humain</label>
                <div className="captcha-wrapper" style={styles.captchaWrapper}>
                  <canvas 
                    ref={captchaCanvasRef} 
                    width="160" 
                    height="42" 
                    className="captcha-canvas"
                    style={styles.captchaCanvas}
                  ></canvas>
                  <button 
                    type="button" 
                    className="captcha-refresh-btn" 
                    style={styles.captchaRefreshBtn}
                    onClick={generateCaptcha}
                    title="Générer un nouveau CAPTCHA"
                  >
                    <TbReload />
                  </button>
                </div>
                <div className="input-with-icon" style={styles.inputWithIcon}>
                  <i className="input-icon" style={styles.inputIcon}><TbCodeVariable /></i>
                  <input
                    type="text"
                    name="captcha"
                    className="form-input"
                    style={styles.formInput}
                    value={formData.captcha}
                    onChange={handleChange}
                    placeholder="Entrez le texte ci-dessus"
                  />
                </div>
                {errors.captcha && <div className="form-error" style={styles.formError}>{errors.captcha}</div>}
              </div>
              
              <div className="form-info-message" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                <i className="info-icon" style={{marginRight: '0.5rem'}}><PiInfoDuotone /></i>
                <span>Tous vos données personnelles sont sécurisées et ne seront pas partagées.</span>
              </div>
              
              <div className="form-actions" style={styles.formActions}>
                <button 
                  type="button" 
                  className="btn back-btn" 
                  style={styles.backBtn} 
                  onClick={onBack} 
                  disabled={isSubmitting}
                >
                  <span className="btn-icon" style={{marginRight: '0.5rem'}}><GrReturn /></span> Retour
                </button>
                <button 
                  type="submit" 
                  className="btn submit-btn" 
                  style={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loader" style={{display: 'inline-block', marginRight: '0.5rem', width: '1rem', height: '1rem', border: '2px solid currentColor', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite'}}></span> 
                      Création en cours...
                    </>
                  ) : (
                    <>Créer le compte <span className="btn-icon" style={{marginLeft: '0.5rem'}}><PiUserCircleCheckBold /></span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
