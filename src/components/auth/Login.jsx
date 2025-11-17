import { useState, useEffect, useRef } from 'react';
import { RiUserSharedFill, RiUserSettingsFill } from "react-icons/ri";
import { PiPasswordDuotone } from "react-icons/pi";
import { BiError } from "react-icons/bi";
import { AiTwotoneMail } from "react-icons/ai";

import logoDark from '../../assets/images/dashboard logo.png';
import logoLight from '../../assets/images/dashboard logo white.png';
import './Captcha.css';

function Login({ onLogin, onForgotPassword, onRegister, error }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [activeInput, setActiveInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Styles pour la nouvelle mise en page plein écran
  const styles = {
    authContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0'
    },
    authCard: {
      width: '90%',
      maxWidth: '1200px',
      minHeight: '80vh',
      margin: '0 auto',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',  
      borderRadius: '12px',
      overflow: 'hidden'
    },
    authContentWrapper: {
      display: 'flex',
      width: '100%',
      height: '100%',
      minHeight: '80vh'
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
      background: 'linear-gradient(135deg,rgb(192, 190, 237) 0%, #c7d2fe 50%, white 100%)',
      backdropFilter: 'blur(10px)',
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
      width: '180px',
      height: 'auto'
    },
    authWelcomeText: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      marginTop: '1.5rem',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    noAccountText: {
      fontSize: '1rem',
      color: 'var(--text-secondary)',
      marginTop: '2rem',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    createAccountBtn: {
      padding: '10px 20px',
      backgroundColor: 'var(--primary-color)',
      color: 'var(--button-text)',
      border: 'none',
      borderRadius: '5px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: 'var(--shadow-sm)'
    },
    authRightColumn: {
      width: '60%',
      padding: '3rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    authSubmitBtn: {
      // backgroundColor: 'var(--primary-color)',
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
      marginTop: '-1rem',

      // padding: '12px 24px',
      background: 'linear-gradient(135deg , #4f46e5 0%, rgb(192, 190, 237) 100%, #c7d2fe 50%)',
      // // background: 'linear-gradient(135deg,  #4f46e5 100%, rgb(192, 190, 237) 0%, #c7d2fe 50%)',
      // color: 'white',
      // border: 'none',
      // borderRadius: '5px',
      // fontSize: '1rem',
      // fontWeight: 'bold',
      // cursor: 'pointer',
      // transition: 'all 0.3s ease',
      // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      // width: '100%',
      // marginTop: '1.5rem'
    },
    
    authSubmitBtnHover: { 

      backgroundColor: 'var(--primary-dark)',
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)'
      // background: 'linear-gradient(135deg, rgb(192, 190, 237) 0%, #c7d2fe 50%, #4f46e5 100%)',
      // opacity: 0,
      // transition: 'opacity 0.3s ease',
      // zIndex: -1
    }

  };
  
  
  // Calculer les variables RGB à partir des couleurs du thème
  useEffect(() => {
    // Convertir les couleurs hex en RGB pour les utiliser avec rgba()
    const convertHexToRGB = (hex) => {
      // Enlever le # si présent
      hex = hex.replace('#', '');
      // Convertir en RGB
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    };
    
    // Obtenir la couleur primaire du thème et la convertir en RGB
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4f46e5';
    const rgb = convertHexToRGB(primaryColor);
    
    // Définir la variable CSS personnalisée --primary-rgb
    document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  }, []); 
  
  // Détecter le thème initial et les changements
  useEffect(() => {
    // Récupérer le thème initial
    const initialTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    setTheme(initialTheme);
    
    // Observer les changements de thème
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
          setTheme(newTheme);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation basique
    if (!credentials.email || !credentials.password) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setFormError('Veuillez saisir une adresse email valide');
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Appeler la fonction de connexion du parent
      await onLogin({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (error) {
      setFormError(error.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={styles.authContainer}>
      {/* Formes décoratives d'arrière-plan */}
      <div className="auth-background">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
        <div className="auth-shape auth-shape-4"></div>
      </div>
  
      <div className="auth-card modern-card" style={styles.authCard}>
        {/* Nouvelle disposition avec deux colonnes */}
        <div className="auth-content-wrapper" style={styles.authContentWrapper}>
          {/* Colonne de gauche avec logo et message de bienvenue */}
          <div className="auth-left-column" style={styles.authLeftColumn}>
            <div className="auth-left-bg" style={styles.authLeftBg}></div>
  
            <div className="auth-left-content" style={styles.authLeftContent}>
              <div className="auth-logo" style={styles.authLogo}>
                <img 
                  src={logoDark} 
                  alt="Dashboard" 
                  className="auth-logo-img" 
                  style={styles.authLogoImg}
                />
              </div>
              <h2 className="auth-welcome-text" style={styles.authWelcomeText}>Bienvenue</h2>
              <p className="no-account-text" style={styles.noAccountText}>Vous n'avez pas de compte ?</p>
              <button 
                onClick={onRegister} 
                className="create-account-btn" 
                style={styles.createAccountBtn}
              >
                <RiUserSettingsFill style={{marginRight: '8px'}} /> Créer un compte
              </button>
            </div>
          </div>
  
          {/* Colonne de droite avec le formulaire */}
          <div className="auth-right-column" style={styles.authRightColumn}>
            <div className="auth-header" style={{marginTop: '30px'}}>
              <h2 className="auth-title" style={{fontSize: '2rem', marginBottom: '1rem'}}>Connectez-vous</h2>
              <p className="auth-subtitle" style={{fontSize: '1.1rem', marginBottom: '2rem'}}>Accédez à votre tableau de bord</p>
            </div>
  
            {formError && (
              <div className="auth-error">
                <span className="auth-error-icon"><BiError /></span>
                {formError}
              </div>
            )}
  
            <form onSubmit={handleSubmit} className="auth-form">
              <div className={`auth-form-group ${activeInput === 'email' ? 'active' : ''} ${credentials.email ? 'filled' : ''}`}>
                <label htmlFor="email">Email</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><AiTwotoneMail /></span>
                  <input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    onFocus={() => setActiveInput('email')}
                    onBlur={() => setActiveInput(null)}
                    placeholder="exemple@domaine.com"
                    autoComplete="email"
                  />
                </div>
              </div>
  
              <div className={`auth-form-group ${activeInput === 'password' ? 'active' : ''} ${credentials.password ? 'filled' : ''}`}>
                <label htmlFor="password">Mot de passe</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><PiPasswordDuotone /></span>
                  <input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    onFocus={() => setActiveInput('password')}
                    onBlur={() => setActiveInput(null)}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                  />
                </div>
              </div>
  
              <div className="auth-options">
                <label className="auth-checkbox">
                  <input type="checkbox" />
                  <span className="auth-checkbox-mark"></span>
                  <span className="auth-checkbox-text">Se souvenir de moi</span>
                </label>
                <a 
                  onClick={onForgotPassword} 
                  className="auth-link" 
                  style={{ cursor: 'pointer' }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
  
              <button 
                type="submit" 
                className="auth-submit-btn" 
                style={styles.authSubmitBtn}
                disabled={isSubmitting} 
              >
                {isSubmitting ? 'Connexion...' : <><RiUserSharedFill style={{marginRight: '8px'}} /> Se connecter</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );   
} 

export default Login;
