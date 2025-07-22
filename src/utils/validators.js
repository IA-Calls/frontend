// Utilidades de validación - Capa de Aplicación

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida fortaleza de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} Objeto con resultado de validación
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: [],
    strength: 'weak'
  };

  if (!password || password.length < 6) {
    result.isValid = false;
    result.errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (password.length < 8) {
    result.errors.push('Para mayor seguridad, usa al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    result.errors.push('Incluye al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    result.errors.push('Incluye al menos una minúscula');
  }

  if (!/\d/.test(password)) {
    result.errors.push('Incluye al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.errors.push('Incluye al menos un carácter especial');
  }

  // Calcular fortaleza
  let strengthScore = 0;
  if (password.length >= 8) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/\d/.test(password)) strengthScore++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++;

  if (strengthScore >= 4) {
    result.strength = 'strong';
  } else if (strengthScore >= 2) {
    result.strength = 'medium';
  }

  return result;
};

/**
 * Valida campos requeridos
 * @param {Object} data - Datos a validar
 * @param {Array} requiredFields - Campos requeridos
 * @returns {Object} Errores de validación
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};

  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = `${field} es requerido`;
    }
  });

  return errors;
};

/**
 * Valida formulario de login
 * @param {Object} credentials - Credenciales a validar
 * @returns {Object} Errores de validación
 */
export const validateLoginForm = (credentials) => {
  const errors = {};

  // Validar email
  if (!credentials.email) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(credentials.email)) {
    errors.email = 'El formato del email no es válido';
  }

  // Validar contraseña
  if (!credentials.password) {
    errors.password = 'La contraseña es requerida';
  } else if (credentials.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
};

/**
 * Sanitiza string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valida longitud de string
 * @param {string} str - String a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {boolean} True si es válido
 */
export const validateLength = (str, min = 0, max = Infinity) => {
  if (typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
}; 