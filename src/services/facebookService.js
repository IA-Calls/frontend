// Servicio de Facebook - Autenticación OAuth con Meta
import config from '../config/environment.js';
import { authService } from './authService.js';

export class FacebookService {
  constructor() {
    this.apiUrl = config.BACKEND_URL;
  }

  /**
   * Iniciar el flujo de autenticación OAuth con Facebook
   * Obtiene la URL de redirección del backend y redirige al usuario
   * @returns {Promise<void>}
   */
  async startOAuthFlow() {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${this.apiUrl}/api/auth/facebook/start`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar autenticación con Facebook');
      }

      // Redirigir al usuario a la URL de Meta para autenticación
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No se recibió URL de redirección');
      }
    } catch (error) {
      console.error('Error starting Facebook OAuth:', error);
      throw error;
    }
  }

  /**
   * Almacenar el token de la página seleccionada en el backend
   * @param {Object} pageData - Datos de la página seleccionada
   * @param {string} pageData.pageId - ID de la página de Facebook
   * @param {string} pageData.pageAccessToken - Token de acceso de la página
   * @param {string} pageData.pageName - Nombre de la página
   * @returns {Promise<Object>} Respuesta del backend
   */
  async storePageToken(pageData) {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${this.apiUrl}/api/auth/facebook/storePageToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          pageId: pageData.pageId,
          pageAccessToken: pageData.pageAccessToken,
          pageName: pageData.pageName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar el token de la página');
      }

      return {
        success: true,
        message: data.message || 'Página conectada exitosamente',
        data: data.data
      };
    } catch (error) {
      console.error('Error storing page token:', error);
      throw error;
    }
  }

  /**
   * Obtener las páginas conectadas del usuario
   * @returns {Promise<Array>} Lista de páginas conectadas
   */
  async getConnectedPages() {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${this.apiUrl}/api/auth/facebook/pages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener páginas conectadas');
      }

      return data.data?.pages || [];
    } catch (error) {
      console.error('Error getting connected pages:', error);
      throw error;
    }
  }

  /**
   * Desconectar una página de Facebook
   * @param {string} pageId - ID de la página a desconectar
   * @returns {Promise<Object>} Respuesta del backend
   */
  async disconnectPage(pageId) {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${this.apiUrl}/api/auth/facebook/disconnect/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al desconectar la página');
      }

      return {
        success: true,
        message: data.message || 'Página desconectada exitosamente'
      };
    } catch (error) {
      console.error('Error disconnecting page:', error);
      throw error;
    }
  }

  /**
   * Parsear los parámetros de la URL después del callback de OAuth
   * @returns {Object|null} Datos parseados de la URL o null si no hay datos
   */
  parseCallbackParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Verificar si hay datos del callback
    const pagesParam = urlParams.get('pages');
    const userAccessToken = urlParams.get('userAccessToken');
    const error = urlParams.get('error');
    
    if (error) {
      return {
        success: false,
        error: error,
        errorDescription: urlParams.get('error_description') || 'Error en la autenticación'
      };
    }

    if (!pagesParam && !userAccessToken) {
      return null;
    }

    try {
      // Decodificar y parsear las páginas
      const pages = pagesParam ? JSON.parse(decodeURIComponent(pagesParam)) : [];
      
      return {
        success: true,
        pages: pages,
        userAccessToken: userAccessToken
      };
    } catch (parseError) {
      console.error('Error parsing callback params:', parseError);
      return {
        success: false,
        error: 'parse_error',
        errorDescription: 'Error al procesar los datos de la respuesta'
      };
    }
  }

  /**
   * Limpiar los parámetros de la URL sin recargar la página
   */
  clearCallbackParams() {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, document.title, url.pathname);
  }
}

// Instancia singleton del servicio
export const facebookService = new FacebookService();


