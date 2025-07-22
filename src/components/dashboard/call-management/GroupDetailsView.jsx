import React, { useState } from 'react';
import { Button } from '../../common/Button';
import { CallDetailsModal } from './CallDetailsModal';

export const GroupDetailsView = ({ group, onBack, user }) => {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(group?.phoneNumber || '');
  const [selectedCall, setSelectedCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data para las llamadas
  const [calls] = useState([
    {
      id: 1,
      name: 'Ana García Rodríguez',
      phoneNumber: '+52-555-1234',
      email: 'ana.garcia@email.com',
      city: 'Ciudad de México, MX',
      aiSummary: 'Cliente interesado en producto premium. Solicitar seguimiento en 3 días.',
      status: 'completed',
      duration: '4:32',
      callDate: '2024-01-15 10:30:00',
      sentiment: 'positive',
      transcription: 'Buenos días Ana, llamamos para ofrecerle nuestro nuevo producto...',
      leadScore: 85,
      nextAction: 'Seguimiento comercial',
      tags: ['interesado', 'premium', 'calificado']
    },
    {
      id: 2,
      name: 'Carlos López Martín',
      phoneNumber: '+52-555-5678',
      email: 'carlos.lopez@empresa.com',
      city: 'Guadalajara, MX',
      aiSummary: 'No disponible en este momento. Reagendar para próxima semana.',
      status: 'pending',
      duration: '1:15',
      callDate: '2024-01-15 11:15:00',
      sentiment: 'neutral',
      transcription: 'Disculpe, estoy en una reunión. ¿Puede llamar la próxima semana?',
      leadScore: 45,
      nextAction: 'Reagendar llamada',
      tags: ['ocupado', 'reagendar']
    },
    {
      id: 3,
      name: 'María Fernández Silva',
      phoneNumber: '+52-555-9012',
      email: 'maria.fernandez@email.com',
      city: 'Monterrey, MX',
      aiSummary: 'Cliente satisfecha con servicio actual. No interesada por ahora.',
      status: 'failed',
      duration: '2:45',
      callDate: '2024-01-15 12:00:00',
      sentiment: 'negative',
      transcription: 'Gracias, pero estoy satisfecha con mi proveedor actual...',
      leadScore: 15,
      nextAction: 'Seguimiento en 6 meses',
      tags: ['no-interesado', 'competencia']
    },
    {
      id: 4,
      name: 'Roberto Jiménez Torres',
      phoneNumber: '+52-555-3456',
      email: 'roberto.jimenez@startup.mx',
      city: 'Puebla, MX',
      aiSummary: 'Entrepreneur joven interesado en planes empresariales. Alta conversión.',
      status: 'completed',
      duration: '8:21',
      callDate: '2024-01-15 14:30:00',
      sentiment: 'very_positive',
      transcription: 'Me interesa mucho su propuesta empresarial. ¿Cuándo podemos reunirnos?',
      leadScore: 95,
      nextAction: 'Agendar reunión comercial',
      tags: ['empresarial', 'reunion', 'alta-conversion']
    },
    {
      id: 5,
      name: 'Lucía Morales Vega',
      phoneNumber: '+52-555-7890',
      email: 'lucia.morales@email.com',
      city: 'Tijuana, MX',
      aiSummary: 'Interesada pero necesita consultar con su esposo. Llamar en 2 días.',
      status: 'pending',
      duration: '3:18',
      callDate: '2024-01-15 16:00:00',
      sentiment: 'positive',
      transcription: 'Me parece interesante, pero necesito consultarlo con mi esposo...',
      leadScore: 65,
      nextAction: 'Seguimiento en 2 días',
      tags: ['consulta-familiar', 'interesada']
    }
  ]);

  const availablePhoneNumbers = [
    group?.phoneNumber,
    '+52-555-0001',
    '+52-555-0002',
    '+52-555-0003'
  ].filter(Boolean);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.phoneNumber.includes(searchTerm) ||
                         call.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCallClick = (call) => {
    setSelectedCall(call);
    setShowCallModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Phone Number Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Número de Teléfono</h3>
            <p className="text-sm text-gray-600">Selecciona el número desde el cual se realizaron las llamadas</p>
          </div>
          <div className="min-w-64">
            <select
              value={selectedPhoneNumber}
              onChange={(e) => setSelectedPhoneNumber(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availablePhoneNumbers.map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono, email o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidas</option>
            </select>
            
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ minHeight: '80vh' }}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Llamadas Realizadas ({filteredCalls.length})
            </h3>
            <div className="text-sm text-gray-500">
              Número seleccionado: <span className="font-medium">{selectedPhoneNumber}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resumen IA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron llamadas</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Prueba ajustando los filtros de búsqueda'
                        : 'Este grupo aún no tiene llamadas registradas'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr 
                    key={call.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCallClick(call)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {call.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{call.name}</div>
                          <div className="text-sm text-gray-500">Score: {call.leadScore}/100</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{call.phoneNumber}</div>
                      <div className="text-sm text-gray-500">{call.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{call.city}</div>
                      <div className="text-sm text-gray-500">{call.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{call.aiSummary}</div>
                      <div className="text-sm text-gray-500 mt-1">{call.nextAction}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(call.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                          {call.status === 'completed' ? 'Completada' : 
                           call.status === 'pending' ? 'Pendiente' : 'Fallida'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallClick(call);
                        }}
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredCalls.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filteredCalls.length}</span> llamadas
              </div>
              <div className="text-sm text-gray-500">
                Total de llamadas en este grupo: <span className="font-medium">{calls.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call Details Modal */}
      {showCallModal && selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          isOpen={showCallModal}
          onClose={() => {
            setShowCallModal(false);
            setSelectedCall(null);
          }}
        />
      )}
    </div>
  );
}; 