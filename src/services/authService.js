// Servicio de autenticación - Capa de Infraestructura
import config from '../config/environment.js';

export class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.clientIdKey = 'client_id';
    this.apiUrl = config.AUTH_API_URL;
  }

  /**
   * Iniciar sesión con email y contraseña
   * @param {Object} credentials - Credenciales de usuario
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async login(credentials) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al iniciar sesión');
      }

      // Extraer los datos de la respuesta (puede venir directamente o envuelto en 'data')
      const data = responseData.data || responseData;

      // Almacenar el token
      if (data.token) {
        console.log('AuthService - Storing token:', data.token.substring(0, 20) + '...');
        this.setToken(data.token);
      } else {
        console.error('AuthService - No token found in response:', data);
      }

      // Almacenar el clientID (user.id)
      if (data.user && data.user.id) {
        console.log('AuthService - Storing clientID:', data.user.id);
        this.setClientId(data.user.id);
      } else {
        console.error('AuthService - No user ID found in response:', data);
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message || responseData.message || 'Login exitoso'
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Manejar errores de red
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
      }
      
      throw new Error(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this.removeToken();
    this.removeClientId();
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} Estado de autenticación
   */
  isAuthenticated() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }

  /**
   * Obtener token almacenado
   * @returns {string|null} Token de autenticación
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Almacenar token
   * @param {string} token - Token de autenticación
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Eliminar token almacenado
   */
  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Obtener clientID almacenado
   * @returns {string|null} ClientID del usuario
   */
  getClientId() {
    return localStorage.getItem(this.clientIdKey);
  }

  /**
   * Almacenar clientID
   * @param {string|number} clientId - ID del cliente/usuario
   */
  setClientId(clientId) {
    localStorage.setItem(this.clientIdKey, clientId.toString());
  }

  /**
   * Eliminar clientID almacenado
   */
  removeClientId() {
    localStorage.removeItem(this.clientIdKey);
  }

  /**
   * Verificar si el token ha expirado
   * @param {string} token - Token a verificar
   * @returns {boolean} True si el token ha expirado
   */
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return currentTime > payload.exp;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtener datos del usuario desde el token
   * @returns {Object|null} Datos del usuario
   */
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('AuthService - Token payload:', payload);
      
      return {
        id: payload.id,
        name: payload.name || payload.username || `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        email: payload.email,
        role: payload.role,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName
      };
    } catch (error) {
      console.error('AuthService - Error parsing token:', error);
      return null;
    }
  }

  /**
   * Obtener headers de autorización para las peticiones
   * @returns {Object} Headers con token de autorización
   */
  getAuthHeaders() {
    const token = this.getToken();
    console.log('AuthService - Token for headers:', token ? 'Token present' : 'No token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Hacer petición autenticada
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<Response>} Respuesta de la petición
   */
  async authenticatedFetch(url, options = {}) {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Si el token ha expirado, hacer logout
    if (response.status === 401) {
      this.logout();
    }

    return response;
  }
}

// Instancia singleton del servicio
export const authService = new AuthService(); 