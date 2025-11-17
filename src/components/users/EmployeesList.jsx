import React, { useState, useEffect } from 'react';
import './EmployeesList.css';
import { BiSearch } from "react-icons/bi";
import { MdFilterList } from "react-icons/md";
import TaskService from '../../services/taskService'; 
import AuthService from '../../services/auth';

const EmployeesList = ({ userRole, onDeleteEmployee }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    TaskService.getEmployeesStats()
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des employés:", error);
        setIsLoading(false);
      });
  }, []); 

  const confirmDelete = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const handleDelete = async () => {
  if (employeeToDelete && employeeToDelete.id) {
    try { 
      await AuthService.deleteUser(employeeToDelete.id);
      setUsers(prev => prev.filter(user => user.id !== employeeToDelete.id));
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Erreur suppression utilisateur :", error);
      alert("Échec de la suppression de l'utilisateur.");
    }
  }
};


  const allDepartments = ['all', ...new Set(users.map(user => user.department))];

  const filteredUsers = users.filter(user => {
    const searchMatch = searchTerm === '' ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const departmentMatch = filterDepartment === 'all' || user.department === filterDepartment;

    return searchMatch && departmentMatch;
  });

  return (
    <div className="users-list fade-in" style={{ position: 'relative' }}>
      <div className="page-header">
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="fade-in">Gestion des Employés</h1>
            <p className="page-subtitle slide-in">Gérez les employés et leurs permissions</p>
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
            placeholder="Rechercher un employé..."
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

        <div className="filter-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          {filteredUsers.length} employé{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Chargement des employés...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Email</th>
              <th>Département</th>
              <th>Projets</th>
              <th>Tâches assignées</th>
              {userRole === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="user-cell">
                  {/* <img src={user.avatarUrl} alt={`${user.name} ${user.prenom}`} className="user-avatar" /> */}
                  <img src={`https://archive.org/download/instagram-plain-round/instagram%20dip%20in%20hair.jpg`} alt={`${user.name} ${user.prenom}`} className="user-avatar" />
                  <span>{user.prenom} {user.name}</span>
                </td>
                <td>{user.email}</td>
                <td>{user.departement}</td>
                <td>{user.project_count}</td>
                <td>{user.task_count}</td> 
                {userRole === 'admin' && (
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => confirmDelete(user)}
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
                  Aucun employé ne correspond à votre recherche
                </td>
              </tr> 
            )}
          </tbody>
        </table>
      )}

      {showDeleteConfirm && employeeToDelete && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            <p>Êtes-vous sûr de vouloir supprimer l'employé {employeeToDelete.prenom} {employeeToDelete.name} ?</p>
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

export default EmployeesList;
