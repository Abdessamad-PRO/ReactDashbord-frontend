/**
 * Utilitaires pour l'application
 */

/**
 * Formate le rôle technique en libellé affichable
 * @param {string} role - Le rôle technique (user, manager, admin)
 * @returns {string} - Le libellé du rôle pour l'affichage
 */
export const formatRole = (role) => {
  switch (role) {
    case 'user':
      return 'Employé';
    case 'manager':
      return 'Manager';
    case 'admin':
      return 'Administrateur';
    default:
      return role;
  }
};

/**
 * Formate une date en chaîne lisible
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée
 */
export const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
};
