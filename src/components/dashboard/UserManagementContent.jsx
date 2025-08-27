import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useUsers } from '../../hooks/useUsers';
import { UserModal } from './user-management/UserModal';
import { PasswordModal } from './user-management/PasswordModal';
import { UserStats } from './user-management/UserStats';
import { Pagination } from './user-management/Pagination';

export const UserManagementContent = ({ user: currentUser }) => {
  const {
    users,
    stats,
    loading,
    error,
    pagination,
    filters,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    changeUserPassword,
    updateFilters,
    changePage,
    changeLimit,
    loadUsers,
    loadStats,
    clearError
  } = useUsers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Debounce para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchTerm });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, updateFilters]);

  // Refresh stats when users change (for admin users)
  useEffect(() => {
    if (isAdmin) {
      // Try to load stats from API first
      loadStats();
    }
  }, [users.length, isAdmin, loadStats]);

  const handleCreateUser = async (userData) => {
    await createUser(userData);
    // Refresh stats after creating a user
    if (isAdmin) {
      loadStats();
    }
  };

  const handleUpdateUser = async (userData) => {
    await updateUser(selectedUser.id, userData);
    setSelectedUser(null);
    // Refresh stats after updating a user
    if (isAdmin) {
      loadStats();
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      await deleteUser(userId);
      // Refresh stats after deleting a user
      if (isAdmin) {
        loadStats();
      }
    }
  };

  const handleActivateUser = async (userId) => {
    await activateUser(userId);
    // Refresh stats after activating a user
    if (isAdmin) {
      loadStats();
    }
  };

  const handleChangePassword = async (passwordData) => {
    await changeUserPassword(selectedUser.id, passwordData);
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  const handleRoleFilterChange = (role) => {
    updateFilters({ role: role === 'all' ? '' : role });
  };

  const handleStatusFilterChange = (status) => {
    updateFilters({ status: status === 'all' ? '' : status });
  };

  // Calculate stats from users list as fallback
  const calculateStatsFromUsers = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const pendingUsers = users.filter(user => user.status === 'pending').length;
    
    // Calculate new users this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsersThisMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = new Date(user.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      newUsersThisMonth,
      totalUsersChange: 0,
      activeUsersChange: 0,
      pendingUsersChange: 0,
      newUsersThisMonthChange: 0
    };
  };

  // Use API stats if available, otherwise calculate from users
  const displayStats = stats || calculateStatsFromUsers();

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'moderator': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'user': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'moderator': return 'Moderador';
      case 'user': return 'Usuario';
      default: return role;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  // Función para formatear deadline y calcular tiempo restante
  const formatDeadline = (deadlineString) => {
    if (!deadlineString) return { text: 'Sin expiración', isExpired: false, timeLeft: null };
    
    const deadline = new Date(deadlineString);
    const now = new Date();
    const isExpired = deadline < now;
    
    if (isExpired) {
      return { text: 'Expirado', isExpired: true, timeLeft: null };
    }
    
    const timeLeft = deadline - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeLeftText = '';
    if (days > 0) {
      timeLeftText = `${days}d ${hours}h`;
    } else if (hours > 0) {
      timeLeftText = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      timeLeftText = `${minutes}m`;
    } else {
      timeLeftText = 'Menos de 1m';
    }
    
    return {
      text: `${deadline.toLocaleDateString('es-ES')} ${deadline.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      isExpired: false,
      timeLeft: timeLeftText
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Usuarios</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Administra usuarios, roles y permisos de la plataforma.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreateModal(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {isAdmin && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas de Usuarios</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadStats}
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </Button>
          </div>
          <UserStats stats={displayStats} loading={loading} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={clearError}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="search"
              />
            </div>
            
            <div>
              <select
                value={filters.role || 'all'}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="moderator">Moderadores</option>
                <option value="user">Usuarios</option>
              </select>
            </div>

            <div>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>

            <div>
              <select
                value={filters.deadline || 'all'}
                onChange={(e) => updateFilters({ deadline: e.target.value === 'all' ? '' : e.target.value })}
                className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los deadlines</option>
                <option value="expired">Expirados</option>
                <option value="active">Activos (no expirados)</option>
                <option value="no-expiration">Sin expiración</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {pagination.total} usuario(s) encontrado(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {userItem.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{userItem.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{userItem.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                      {getRoleLabel(userItem.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userItem.status)}`}>
                      {getStatusLabel(userItem.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const deadlineInfo = formatDeadline(userItem.time);
                      const isExpiringSoon = userItem.time && !deadlineInfo.isExpired && 
                        (new Date(userItem.time) - new Date()) <= 24 * 60 * 60 * 1000;
                      
                      return (
                        <div className="flex flex-col space-y-1">
                          <span className={`font-medium ${deadlineInfo.isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {deadlineInfo.text}
                          </span>
                          {deadlineInfo.timeLeft && (
                            <span className={`text-xs font-medium ${
                              isExpiringSoon ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {deadlineInfo.timeLeft} restante
                              {isExpiringSoon && ' ⚠️'}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            deadlineInfo.isExpired 
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' 
                              : isExpiringSoon
                              ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
                              : userItem.time 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {deadlineInfo.isExpired 
                              ? 'Expirado' 
                              : isExpiringSoon
                              ? 'Próximo a expirar'
                              : userItem.time 
                                ? 'Activo' 
                                : 'Sin expiración'
                            }
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {userItem.lastLogin || 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditUser(userItem)}
                        title="Editar usuario"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>

                      {isAdmin && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenPasswordModal(userItem)}
                          title="Cambiar contraseña"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </Button>
                      )}

                      {isAdmin && userItem.status === 'inactive' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleActivateUser(userItem.id)}
                          title="Activar usuario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </Button>
                      )}

                      {isAdmin && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(userItem.id)}
                          title="Eliminar usuario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          ) : (
            <>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={changePage}
                onLimitChange={changeLimit}
              />
            </>
          )}
        </div>
      </div>

      {/* Modales */}
      <UserModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSave={handleCreateUser}
        loading={loading}
      />

      <UserModal
        isOpen={showEditModal}
        onClose={closeModals}
        onSave={handleUpdateUser}
        user={selectedUser}
        loading={loading}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={closeModals}
        onSave={handleChangePassword}
        user={selectedUser}
        loading={loading}
      />
    </div>
  );
};
