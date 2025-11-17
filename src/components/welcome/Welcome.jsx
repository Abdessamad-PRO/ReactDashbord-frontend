import React, { useState } from 'react';
import logoDark from '../../assets/images/dashboard logo.png';
import logoLight from '../../assets/images/dashboard logo white.png';
import DemoCarousel from './DemoCarousel';
import '../../welcome.css';

const Welcome = ({ onLogin, onRegister, theme }) => {
  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    message: ''
  });
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Dans une application réelle, envoyez ces données à votre API
    console.log('Formulaire de contact soumis:', contactForm);
    
    // Afficher le message de confirmation
    setShowSuccessMessage(true);
    
    // Réinitialiser le formulaire
    setContactForm({ nom: '', email: '', message: '' });
    
    // Masquer le message après 3 secondes
    setTimeout(() => { 
      setShowSuccessMessage(false);
    }, 3000);
  };

  const scrollToAbout = () => {
    const aboutSection = document.querySelector('.site-presentation-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.querySelector('.footer-contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="welcome-container">
      <nav className="welcome-navbar">
        <div className="navbar-container">
          <div className="navbar-links">
            <button onClick={scrollToAbout} className="navbar-link">À propos</button>
            <button onClick={scrollToContact} className="navbar-link">Contactez-nous</button>
          </div>
          <div className="navbar-buttons">
            <button 
              className="navbar-btn login-btn-small"
              onClick={onLogin}
            >
              Se connecter
            </button>
            <button 
              className="navbar-btn register-btn-small"
              onClick={onRegister}
            >
              Créer un compte
            </button>
          </div>
        </div>
      </nav>

      <div className="auth-background">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
        <div className="auth-shape auth-shape-4"></div>
      </div>
      
      <div className="welcome-content">
        <div className="welcome-header">
          <div className="welcome-logo-container">
            <img 
              src={logoDark} 
              alt="Taskaura Logo" 
              className="welcome-logo auth-logo-img"
            />
          </div>
          <h1 className="welcome-title">Bienvenue sur Taskaura</h1>
          <p className="welcome-subtitle">Votre plateforme complète de gestion de projets</p>
        </div>
        
        <div className="welcome-main-section">
          {/* Carousel de démonstration */}
          <div className="demo-section">
            <h2 className="section-title">Découvrez notre plateforme</h2>
            <DemoCarousel />
          </div>

          <div className="welcome-two-columns">

            <div className="features-column">
              <h2 className="features-heading">Gérez vos tâches avec facilité</h2>
              <div className="features-container">
                <div className="feature-card">
                  <div className="feature-check">✓</div>
                  <h3>Gestion de projets</h3>
                  <p>Planifiez et suivez facilement vos projets.</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-check">✓</div>
                  <h3>Tâches personnalisées</h3>
                  <p>Créez et gérez des tâches adaptées à vos besoins.</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-check">✓</div>
                  <h3>Rôles et permissions</h3>
                  <p>Attribuez des rôles et gérez les permissions de chaque utilisateur.</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-check">✓</div>
                  <h3>Export de données</h3>
                  <p>Générez et exportez les données pour une meilleure documentation.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="welcome-actions">
            <button 
              className="btn login-btn"
              onClick={onLogin}
            >
              Se connecter
            </button>
            <button 
              className="btn register-btn"
              onClick={onRegister}
            >
              Créer un compte manager
            </button>
          </div>
          
          {/* Section de présentation générale avec arrière-plan */}
          <div className="site-presentation-section">
            <div className="presentation-overlay"></div>
            <div className="presentation-content">
              <h2>À propos de Taskaura</h2>
              <p>
                Taskaura est une solution de gestion de projets complète et intuitive, conçue pour aider les équipes à collaborer efficacement et à atteindre leurs objectifs.
              </p>
              <p>
                Notre plateforme centralise toutes les informations essentielles et vous offre une visibilité totale sur l'avancement de vos projets, les tâches assignées et les performances de votre équipe.
              </p>
              <div className="presentation-features">
                <div className="presentation-feature-item">
                  <div className="presentation-icon">📈</div>
                  <span>Suivi de performance</span>
                </div>
                <div className="presentation-feature-item">
                  <div className="presentation-icon">🔔</div>
                  <span>Notifications en temps réel</span>
                </div>
                <div className="presentation-feature-item">
                  <div className="presentation-icon">👥</div>
                  <span>Gestion d'équipe</span>
                </div>
                <div className="presentation-feature-item">
                  <div className="presentation-icon">📊</div>
                  <span>Rapports de données</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer section */}
      <footer className="welcome-footer">
        <div className="footer-content">
          <div className="footer-logo-section">
            <img 
              src={logoLight} 
              alt="Taskaura Logo" 
              className="footer-logo"
            />
            {/* Texte Taskaura supprimé à la demande du client */}
          </div>
          
          <div className="footer-about">
            <h4>À propos de nous</h4>
            <p>
              Taskaura est une solution complète de gestion de projets conçue pour optimiser votre productivité. 
              Notre plateforme a été développée par une équipe d'experts en gestion de projets et en développement logiciel, 
              avec l'objectif de simplifier la gestion de vos projets tout en offrant des outils puissants d'analyse et de suivi.
            </p>
          </div>
          
          <div className="footer-contact">
            <h4>Contactez-nous</h4>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              {showSuccessMessage && (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <span>Message envoyé avec succès!</span>
                </div>
              )}
              <div className="form-group">
                <input 
                  type="text" 
                  name="nom" 
                  placeholder="Votre nom" 
                  value={contactForm.nom}
                  onChange={handleContactChange}
                  required 
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Votre email" 
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required 
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <textarea 
                  name="message" 
                  placeholder="Votre message" 
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required 
                  className="form-input form-textarea"
                ></textarea>
              </div>
              <button type="submit" className="btn submit-btn">Envoyer</button>
            </form>
          </div>
        </div>
        
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} Taskaura. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
