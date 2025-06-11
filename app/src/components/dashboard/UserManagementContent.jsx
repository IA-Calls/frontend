import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const UserManagementContent = ({ user }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Ana García',
      email: 'ana.garcia@plataforma.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      createdAt: '2023-06-15'
    },
    {
      id: 2,
      name: 'Carlos López',
      email: 'carlos.lopez@plataforma.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-14 09:15',
      createdAt: '2023-08-22'
    },
    {
      id: 3,
      name: 'María Rodriguez',
      email: 'maria.rodriguez@plataforma.com',
      role: 'moderator',
      status: 'inactive',
      lastLogin: '2024-01-10 16:45',
      createdAt: '2023-09-10'
    },
    {
      id: 4,
      name: 'Juan Martínez',
      email: 'juan.martinez@plataforma.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-13 11:20',
      createdAt: '2023-11-05'
    },
    {
      id: 5,
      name: 'Laura Sánchez',
      email: 'laura.sanchez@plataforma.com',
      role: 'user',
      status: 'pending',
      lastLogin: 'Nunca',
      createdAt: '2024-01-15'
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    if (newUser.name && newUser.email) {
      const newUserData = {
        id: users.length + 1,
        ...newUser,
        lastLogin: 'Nunca',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUserData]);
      setNewUser({ name: '', email: '', role: 'user', status: 'active' });
      setShowCreateModal(false);
    }
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
            <p className="text-gray-600">
              Administra usuarios, roles y permisos de la plataforma.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="moderator">Moderadores</option>
                <option value="user">Usuarios</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {filteredUsers.length} usuario(s) encontrado(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {userItem.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                        <div className="text-sm text-gray-500">{userItem.email}</div>
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
                    {userItem.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userItem.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(userItem)}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Editar
                      </button>
                      
                      {userItem.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(userItem.id, 'inactive')}
                          className="text-yellow-600 hover:text-yellow-500"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(userItem.id, 'active')}
                          className="text-green-600 hover:text-green-500"
                        >
                          Activar
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Crear Nuevo Usuario
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Nombre Completo"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ingresa el nombre completo"
                  required
                />
                
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="usuario@ejemplo.com"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">Usuario</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <Button
                  onClick={handleCreateUser}
                  className="flex-1"
                  disabled={!newUser.name || !newUser.email}
                >
                  Crear Usuario
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ name: '', email: '', role: 'user', status: 'active' });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
