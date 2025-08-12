import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    deadline: ''
  });
  // Cargar usuarios
  const loadUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        search: params.search !== undefined ? params.search : filters.search,
        role: params.role !== undefined ? params.role : filters.role,
        status: params.status !== undefined ? params.status : filters.status,
        deadline: params.deadline !== undefined ? params.deadline : filters.deadline
      };

      // Limpiar parámetros vacíos
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key] && queryParams[key] !== 0) {
          delete queryParams[key];
        }
      });

      const response = await userService.getUsers(queryParams);
      
      setUsers(response.users || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      });
    } catch (err) {
      setError(err.message);
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.search, filters.role, filters.status, filters.deadline]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      console.log('useUsers - Loading stats...');
      const response = await userService.getUserStats();
      console.log('useUsers - Stats loaded:', response);
      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
      // Set default stats to prevent UI issues
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        newUsersThisMonth: 0,
        totalUsersChange: 0,
        activeUsersChange: 0,
        pendingUsersChange: 0,
        newUsersThisMonthChange: 0
      });
    }
  }, []);

  // Crear usuario
  const createUser = async (userData) => {
    setLoading(true);
    try {
      const newUser = await userService.createUser(userData);
      await loadUsers(); // Recargar lista
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar usuario
  const updateUser = async (id, userData) => {
    setLoading(true);
    try {
      const updatedUser = await userService.updateUser(id, userData);
      await loadUsers(); // Recargar lista
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await userService.deleteUser(id);
      await loadUsers(); // Recargar lista
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Activar usuario
  const activateUser = async (id) => {
    setLoading(true);
    try {
      await userService.activateUser(id);
      await loadUsers(); // Recargar lista
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const changeUserPassword = async (id, passwordData) => {
    setLoading(true);
    try {
      await userService.changeUserPassword(id, passwordData);
      // No necesitamos recargar la lista para cambio de contraseña
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener actividad del usuario
  const getUserActivity = async (id, params = {}) => {
    try {
      return await userService.getUserActivity(id, params);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Cambiar página
  const changePage = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Cambiar límite por página
  const changeLimit = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1 // Resetear a la primera página
    }));
  };

  // Efectos
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    // Estado
    users,
    stats,
    loading,
    error,
    pagination,
    filters,
    
    // Acciones
    loadUsers,
    loadStats,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    changeUserPassword,
    getUserActivity,
    updateFilters,
    changePage,
    changeLimit,
    
    // Utilidades
    clearError: () => setError(null)
  };
}; 