// Servicio de autenticación - Capa de Infraestructura
export class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    // Credenciales quemadas para desarrollo
    this.validCredentials = [
      {
        email: 'admin@plataforma.com',
        password: 'admin123',
        user: {
          id: 1,
          name: 'Administrador',
          email: 'admin@plataforma.com',
          role: 'admin'
        }
      },
      {
        email: 'usuario@plataforma.com',
        password: 'usuario123',
        user: {
          id: 2,
          name: 'Usuario Demo',
          email: 'usuario@plataforma.com',
          role: 'user'
        }
      },
      {
        email: 'demo@plataforma.com',
        password: 'demo123',
        user: {
          id: 3,
          name: 'Usuario Demo',
          email: 'demo@plataforma.com',
          role: 'user'
        }
      }
    ];
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
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Buscar credenciales válidas
      const validUser = this.validCredentials.find(
        cred => cred.email === credentials.email && cred.password === credentials.password
      );

      if (!validUser) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token simulado
      const token = this.generateMockToken(validUser.user);
      this.setToken(token);

      return {
        success: true,
        token,
        user: validUser.user,
        message: 'Login exitoso'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  }

  /**
   * Generar token JWT simulado
   * @param {Object} user - Datos del usuario
   * @returns {string} Token simulado
   */
  generateMockToken(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      ...user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this.removeToken();
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
      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtener credenciales de ejemplo para mostrar en la UI
   * @returns {Array} Lista de credenciales de ejemplo
   */
  getExampleCredentials() {
    return this.validCredentials.map(cred => ({
      email: cred.email,
      password: cred.password,
      role: cred.user.role
    }));
  }
}

// Instancia singleton del servicio
export const authService = new AuthService(); 