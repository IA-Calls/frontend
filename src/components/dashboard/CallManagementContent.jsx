import React, { useState } from 'react';
import { Button } from '../common/Button';
import { GroupsOverview } from './call-management/GroupsOverview';
import { GroupDetailsView } from './call-management/GroupDetailsView';

export const CallManagementContent = ({ user }) => {
  const [currentView, setCurrentView] = useState('overview'); // 'overview' | 'group-details'
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Campaña Ventas Q1 2024',
      description: 'Llamadas de seguimiento para clientes potenciales del primer trimestre',
      phoneNumber: '+1-555-0123',
      totalCalls: 245,
      successfulCalls: 189,
      pendingCalls: 23,
      failedCalls: 33,
      createdAt: '2024-01-15',
      status: 'active',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Encuesta Satisfacción',
      description: 'Llamadas automatizadas para evaluar la satisfacción del cliente',
      phoneNumber: '+1-555-0456',
      totalCalls: 156,
      successfulCalls: 134,
      pendingCalls: 8,
      failedCalls: 14,
      createdAt: '2024-01-20',
      status: 'active',
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Recordatorios Médicos',
      description: 'Sistema de recordatorios para citas médicas',
      phoneNumber: '+1-555-0789',
      totalCalls: 89,
      successfulCalls: 76,
      pendingCalls: 5,
      failedCalls: 8,
      createdAt: '2024-01-25',
      status: 'paused',
      color: 'bg-purple-500'
    }
  ]);

  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: groups.length + 1,
      ...groupData,
      totalCalls: 0,
      successfulCalls: 0,
      pendingCalls: 0,
      failedCalls: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      color: groupData.color || getRandomColor()
    };
    setGroups([...groups, newGroup]);
  };

  const handleUpdateGroup = (groupId, groupData) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, ...groupData }
        : group
    ));
  };

  const handleDeleteGroup = (groupId) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setCurrentView('group-details');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedGroup(null);
  };

  const getRandomColor = () => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <button 
                onClick={handleBackToOverview}
                className={`hover:text-gray-700 ${currentView === 'overview' ? 'text-blue-600 font-medium' : ''}`}
              >
                Gestor de Llamadas
              </button>
              {currentView === 'group-details' && selectedGroup && (
                <>
                  <span>/</span>
                  <span className="text-blue-600 font-medium">{selectedGroup.name}</span>
                </>
              )}
            </nav>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentView === 'overview' ? 'Gestor de Llamadas' : selectedGroup?.name}
            </h2>
            <p className="text-gray-600">
              {currentView === 'overview' 
                ? 'Gestiona tus campañas de llamadas automáticas con IA'
                : selectedGroup?.description
              }
            </p>
          </div>
          
          {currentView === 'group-details' && (
            <Button
              variant="outline"
              onClick={handleBackToOverview}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a Grupos</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {currentView === 'overview' ? (
        <GroupsOverview
          groups={groups}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
          user={user}
        />
      ) : (
        <GroupDetailsView
          group={selectedGroup}
          onBack={handleBackToOverview}
          user={user}
        />
      )}
    </div>
  );
}; 