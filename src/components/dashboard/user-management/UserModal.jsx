import React, { useState, useEffect } from 'react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { isValidEmail } from '../../../utils/validators';

export const UserModal = ({ isOpen, onClose, onSave, user, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: '',
    deadline: 'no-expiration'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDeadline, setCalculatedDeadline] = useState(null);

  const isEditing = !!user;

  // Función para calcular la fecha de deadline
  const calculateDeadline = (deadlineType) => {
    if (deadlineType === 'no-expiration') {
      return null;
    }

    const now = new Date();
    let deadline;

    switch (deadlineType) {
      case '1-minute':
        deadline = new Date(now.getTime() + 1 * 60 * 1000); // 1 minuto
        break;
      case '1-day':
        deadline = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 día
        break;
      case '1-week':
        deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 semana
        break;
      case '1-month':
        deadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 mes (aproximado)
        break;
      default:
        deadline = null;
    }

    return deadline;
  };

  // Función para verificar si un deadline está próximo a expirar
  const isDeadlineExpiringSoon = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const timeLeft = deadline - now;
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    return hoursLeft <= 24 && hoursLeft > 0; // Próximo a expirar en 24 horas
  };

  // Función para obtener el color del deadline
  const getDeadlineColor = (deadline) => {
    if (!deadline) return 'text-gray-600';
    if (deadline < new Date()) return 'text-red-600';
    if (isDeadlineExpiringSoon(deadline)) return 'text-orange-600';
    return 'text-green-600';
  };

  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Modo edición
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'user',
          status: user.status || 'active',
          password: '',
          confirmPassword: '',
          deadline: user.time ? 'custom' : 'no-expiration'
        });
        
        // Si el usuario ya tiene un deadline, mostrarlo
        if (user.time) {
          setCalculatedDeadline(new Date(user.time));
        } else {
          setCalculatedDeadline(null);
        }
      } else {
        // Modo creación
        setFormData({
          name: '',
          email: '',
          role: 'user',
          status: 'active',
          password: '',
          confirmPassword: '',
          deadline: 'no-expiration'
        });
        setCalculatedDeadline(null);
      }
      setErrors({});
    }
  }, [isOpen, user]);

  // Calcular deadline cuando cambie el tipo
  useEffect(() => {
    if (formData.deadline === 'custom' && user?.time) {
      // Si es modo edición y el usuario ya tiene deadline, mantener el existente
      setCalculatedDeadline(new Date(user.time));
    } else {
      // Calcular nuevo deadline basado en el tipo seleccionado
      const deadline = calculateDeadline(formData.deadline);
      setCalculatedDeadline(deadline);
    }
  }, [formData.deadline, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!isEditing) {
      // Validar contraseña solo en modo creación
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status
      };

      // Agregar deadline si se seleccionó uno
      if (formData.deadline !== 'no-expiration') {
        if (formData.deadline === 'custom' && user?.time) {
          // Mantener el deadline existente del usuario
          userData.time = user.time;
        } else if (calculatedDeadline) {
          // Usar el nuevo deadline calculado
          userData.time = calculatedDeadline.toISOString();
        }
      } else {
        // Sin expiración - enviar null explícitamente
        userData.time = null;
      }

      if (!isEditing) {
        userData.password = formData.password;
      }

      await onSave(userData);
      onClose();
    } catch (error) {
      setErrors({
        submit: error.message || 'Error al guardar el usuario'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const formatDeadline = (date) => {
    if (!date) return 'Sin expiración';
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Nombre completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Ej: Juan Pérez"
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="juan@ejemplo.com"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline de la cuenta
              </label>
              <select
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="no-expiration">Sin expiración</option>
                <option value="1-minute">1 minuto</option>
                <option value="1-day">1 día</option>
                <option value="1-week">1 semana</option>
                <option value="1-month">1 mes</option>
                {isEditing && user?.time && (
                  <option value="custom">Personalizado (actual)</option>
                )}
              </select>
              
              {calculatedDeadline && (
                <div className={`mt-2 p-2 border rounded-lg ${
                  calculatedDeadline < new Date() 
                    ? 'bg-red-50 border-red-200' 
                    : isDeadlineExpiringSoon(calculatedDeadline)
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm ${getDeadlineColor(calculatedDeadline)}`}>
                    <span className="font-medium">Deadline calculado:</span><br />
                    {formatDeadline(calculatedDeadline)}
                    {isDeadlineExpiringSoon(calculatedDeadline) && (
                      <span className="block mt-1 text-orange-700 font-medium">
                        ⚠️ Próximo a expirar
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {!isEditing && (
              <>
                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  required
                />
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 