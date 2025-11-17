import React, { useState } from 'react';

const EmployeeForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    phone: '', 
    address: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    }); 
    
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email est invalide';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Le département est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Générer un ID pour le nouvel employé
      const newEmployee = {
        id: Math.random().toString(36).substr(2, 9),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        role: 'user', // Rôle par défaut
        phone: formData.phone,
        address: formData.address,
        avatarUrl: `https://i.pravatar.cc/150?u=${formData.email}`,
        projectsAssigned: [],
        tasksAssigned: []
      };
      
      onSubmit(newEmployee);
    }
  };

  return (
    <div className="employee-form-container" style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '8px',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.25)',
      border: '1px solid var(--border-color)',
      width: '500px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '25px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000
    }}>
        <div className="form-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>Ajouter un employé</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                Prénom*
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: errors.firstName ? '1px solid #f44336' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
              {errors.firstName && ( 
                <div className="error-message" style={{
                  color: '#f44336',
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  {errors.firstName}
                </div>
              )}
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                Nom*
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: errors.lastName ? '1px solid #f44336' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
              {errors.lastName && (
                <div className="error-message" style={{
                  color: '#f44336',
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: errors.email ? '1px solid #f44336' : '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
            {errors.email && (
              <div className="error-message" style={{
                color: '#f44336',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              Département*
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: errors.department ? '1px solid #f44336' : '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
            {errors.department && (
              <div className="error-message" style={{
                color: '#f44336',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                {errors.department}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px'
            }}>
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-actions" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                cursor: 'pointer', 
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Ajouter
            </button>
          </div>
        </form>
    </div>
  );
};

export default EmployeeForm;
