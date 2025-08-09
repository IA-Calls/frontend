import { authService } from './authService';
import config from '../config/environment.js';

export class UserService {
  constructor() {
    this.apiUrl = `${config.BACKEND_URL}/api/users`;
  }

  /**
   * Obtener lista de usuarios con paginación y filtros
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite por página
   * @param {string} params.search - Término de búsqueda
   * @param {string} params.role - Filtro por rol
   * @param {string} params.status - Filtro por estado
   * @returns {Promise<Object>} Lista de usuarios paginada
   */
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);

      const url = `${this.apiUrl}?${queryParams.toString()}`;
      console.log('UserService - Making request to:', url);
      
      const response = await authService.authenticatedFetch(url);
      console.log('UserService - Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('UserService - Error response:', errorData);
        throw new Error(errorData.message || 'Error al obtener usuarios');
      }

      const responseData = await response.json();
      console.log('UserService - Response data:', responseData);
      
      // Extraer datos de la respuesta
      const data = responseData.data || responseData;
      
      // Mapear usuarios para que coincidan con la estructura esperada del frontend
      const mappedUsers = data.users?.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',
        lastLogin: user.last_login || null,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })) || [];

      return {
        users: mappedUsers,
        pagination: data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        filters: data.filters || {},
        message: responseData.message
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  }

  /**
   * Obtener estadísticas de usuarios (solo admins)
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  async getUserStats() {
    try {
      console.log('UserService - Fetching stats from:', `${this.apiUrl}/stats`);
      const response = await authService.authenticatedFetch(`${this.apiUrl}/stats`);
      
      console.log('UserService - Stats response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('UserService - Stats error response:', errorData);
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      const responseData = await response.json();
      console.log('UserService - Stats response data:', responseData);
      
      // Ensure we return a properly structured stats object
      const stats = responseData.data || responseData;
      
      // Provide default values if stats are missing
      return {
        totalUsers: stats.totalUsers || stats.total_users || 0,
        activeUsers: stats.activeUsers || stats.active_users || 0,
        pendingUsers: stats.pendingUsers || stats.pending_users || 0,
        newUsersThisMonth: stats.newUsersThisMonth || stats.new_users_this_month || 0,
        totalUsersChange: stats.totalUsersChange || stats.total_users_change || 0,
        activeUsersChange: stats.activeUsersChange || stats.active_users_change || 0,
        pendingUsersChange: stats.pendingUsersChange || stats.pending_users_change || 0,
        newUsersThisMonthChange: stats.newUsersThisMonthChange || stats.new_users_this_month_change || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      // Return default stats instead of throwing error to prevent UI issues
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        newUsersThisMonth: 0,
        totalUsersChange: 0,
        activeUsersChange: 0,
        pendingUsersChange: 0,
        newUsersThisMonthChange: 0
      };
    }
  }

  /**
   * Obtener usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUserById(id) {
    try {
      const response = await authService.authenticatedFetch(`${this.apiUrl}/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener usuario');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;
      
      // Mapear usuario del backend al formato del frontend
      if (data.id) {
        return {
          id: data.id,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
          email: data.email,
          username: data.username,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role,
          status: data.is_active ? 'active' : 'inactive',
          lastLogin: data.last_login || null,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error(error.message || 'Error al obtener usuario');
    }
  }

  /**
   * Crear nuevo usuario (solo admins)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async createUser(userData) {
    try {
      // Mapear datos del frontend al formato del backend
      const backendData = {
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName || userData.name?.split(' ')[0] || '',
        last_name: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        role: userData.role,
        is_active: userData.status === 'active'
      };

      const response = await authService.authenticatedFetch(this.apiUrl, {
        method: 'POST',
        body: JSON.stringify(backendData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear usuario');
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Error al crear usuario');
    }
  }

  /**
   * Actualizar usuario (admins/propietario)
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos actualizados
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(id, userData) {
    try {
      // Mapear datos del frontend al formato del backend
      const backendData = {
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        first_name: userData.firstName || userData.name?.split(' ')[0] || '',
        last_name: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        role: userData.role,
        is_active: userData.status === 'active'
      };

      const response = await authService.authenticatedFetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar usuario');
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Error al actualizar usuario');
    }
  }

  /**
   * Eliminar usuario - soft delete (solo admins)
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteUser(id) {
    try {
      const response = await authService.authenticatedFetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar usuario');
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error.message || 'Error al eliminar usuario');
    }
  }

  /**
   * Obtener logs de actividad del usuario (admin/propietario)
   * @param {number} id - ID del usuario
   * @param {Object} params - Parámetros de paginación
   * @returns {Promise<Object>} Logs de actividad
   */
  async getUserActivity(id, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `${this.apiUrl}/${id}/activity?${queryParams.toString()}`;
      const response = await authService.authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener actividad del usuario');
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw new Error(error.message || 'Error al obtener actividad del usuario');
    }
  }

  /**
   * Cambiar contraseña de usuario (solo admins)
   * @param {number} id - ID del usuario
   * @param {Object} passwordData - Nueva contraseña
   * @param {string} passwordData.newPassword - Nueva contraseña
   * @returns {Promise<Object>} Confirmación de cambio
   */
  async changeUserPassword(id, passwordData) {
    try {
      const response = await authService.authenticatedFetch(`${this.apiUrl}/${id}/password`, {
        method: 'PUT',
        body: JSON.stringify(passwordData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar contraseña');
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error changing user password:', error);
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  }

  /**
   * Activar usuario desactivado (solo admins)
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Usuario activado
   */
  async activateUser(id) {
    try {
      const response = await authService.authenticatedFetch(`${this.apiUrl}/${id}/activate`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al activar usuario');
      }

      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error activating user:', error);
      throw new Error(error.message || 'Error al activar usuario');
    }
  }
}

// Instancia singleton del servicio
export const userService = new UserService(); 