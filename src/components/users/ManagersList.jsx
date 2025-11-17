import React, { useEffect, useState } from 'react';
import './EmployeesList.css';
import { BiSearch } from "react-icons/bi";
import { MdFilterList } from "react-icons/md";
import TaskService from '../../services/taskService'; 
import AuthService from '../../services/auth';

const ManagersList = ({ userRole, onDeleteManager })  => {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  

  useEffect(() => {
    TaskService.getManagersStats() 
      .then(data => setManagers(data))
      .catch(err => console.error("Erreur lors du chargement des managers:", err))
      .finally(() => setIsLoading(false)); // Ajout ici
  }, []);

  const confirmDelete = (manager) => { 
    setManagerToDelete(manager);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setManagerToDelete(null);
  };

 const handleDelete = async () => { 
  if (managerToDelete && managerToDelete.id) {
    try {
      await AuthService.deleteUser(managerToDelete.id);
      setManagers(prev => prev.filter(m => m.id !== managerToDelete.id));
      setShowDeleteConfirm(false);
      setManagerToDelete(null);
    } catch (error) { 
      console.error('Erreur lors de la suppression du manager :', error.message);
    }
  }
}; 

  const allDepartments = ['all', ...new Set(managers.map(manager => manager.departement))];

  const filteredManagers = managers.filter(manager => {
    const searchMatch = searchTerm === '' ||
      manager.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase());

    const departmentMatch = filterDepartment === 'all' || manager.departement === filterDepartment;

    return searchMatch && departmentMatch;
  });

  return (
    <div className="users-list fade-in" style={{ position: 'relative' }}>
      <div className="page-header">
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="fade-in">Gestion des Managers</h1> 
            <p className="page-subtitle slide-in">Gérez les managers de votre organisation</p>
          </div>
        </div>
      </div>

      <div className="search-panel" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '25px',
        padding: '15px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)'
      }}>
        <div className="search-input-container" style={{
          flex: '1',
          minWidth: '250px',
          position: 'relative'
        }}>
          <BiSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '20px'
          }} />
          <input
            type="text"
            placeholder="Rechercher un manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }} 
          />
        </div>
  
        <div className="filter-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <MdFilterList style={{ color: 'var(--text-secondary)', fontSize: '20px' }} />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {allDepartments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'Tous les départements' : dept}
              </option>
            ))}
          </select>
        </div>

        <div className="search-results" style={{ width: '100%', color: 'var(--text-secondary)', fontSize: '14px' }}>
          {filteredManagers.length} manager{filteredManagers.length !== 1 ? 's' : ''} trouvé{filteredManagers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Chargement des Managers...</div>
      ) : (
      <table className="data-table">
        <thead>
          <tr>
            <th>Manager</th>
            <th>Email</th>
            <th>Département</th>
            <th>Projets</th>
            <th>Équipe</th>
            {userRole === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredManagers.length > 0 ? filteredManagers.map(manager => (
            <tr key={manager.id}>
              <td className="user-cell">
                <img
                src={`https://archive.org/download/instagram-plain-round/instagram%20dip%20in%20hair.jpg`}
                  // src={manager.avatarUrl || '/default-avatar.png'}
                  alt={`${manager.first_name} ${manager.last_name}`}
                  className="user-avatar"
                /> 
                <span>{manager.first_name} {manager.last_name}</span>
              </td>
              <td>{manager.email}</td>
              <td>{manager.departement}</td>
              <td>{manager.projects_count}</td>
              <td>{manager.team_members_count} employés</td>
              {userRole === 'admin' && (
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => confirmDelete(manager)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={userRole === 'admin' ? 6 : 5} style={{ textAlign: 'center', padding: '20px' }}>
                Aucun manager ne correspond à votre recherche
              </td>
            </tr> 
          )}
        </tbody>
      </table>
      )}
      {showDeleteConfirm && managerToDelete && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backgroundColor: 'transparent'
        }}>
          <div className="confirm-dialog" style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '25px',
            width: '450px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h3 style={{ marginTop: 0 }}>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer le manager {managerToDelete.first_name} {managerToDelete.last_name} ?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={cancelDelete}
                style={{
                  backgroundColor: 'var(--button-secondary-bg)',
                  color: 'var(--button-secondary-text)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagersList;
