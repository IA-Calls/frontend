import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';  
import ExcelMapper from "./excelmap"
import CallDashboard from './call-twilio/page'
import { UserManagementContent } from './UserManagementContent';
import { GroupDocumentsContent } from './GroupDocumentsContent';
import { AgentsContent } from './AgentsContent';
import { Chats } from './chats/Chats';
import { KnowledgeBaseContent } from './knowledge-base/KnowledgeBaseContent';
import { KnowledgeItemsContent } from './knowledge-items/KnowledgeItemsContent';
import { SocialConnectionsContent } from './social-connections/SocialConnectionsContent';


export const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Oculto por defecto

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent user={user} />;
      case 'chats':
        return <Chats />;
      case 'groups':
        return <CallDashboard user={user} />;
      case 'interested-clients':
        return <CallDashboard user={user} initialView="interested-clients" />;
      case 'templates':
        return <CallDashboard user={user} initialView="templates" />;
      case 'mass-uploads':
        return <ExcelMapper user={user} />;
      case 'user-management':
        return <UserManagementContent user={user} />;
      case 'twilio-call':
        return <CallDashboard user={user}/>
      case 'agentes':
        return <AgentsContent user={user} />;
      case 'group-documents':
        return <GroupDocumentsContent user={user} />;
      case 'knowledge-base':
        return <KnowledgeBaseContent />;
      case 'knowledge-items':
        return <KnowledgeItemsContent />;
      case 'social-connections':
        return <SocialConnectionsContent user={user} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Panel de Control';
      case 'chats':
        return 'Chats WhatsApp';
      case 'groups':
        return 'Gestión de Grupos';
      case 'interested-clients':
        return 'Clientes Interesados';
      case 'templates':
        return 'Plantillas de WhatsApp';
      case 'mass-uploads':
        return 'Cargas Masivas';
      case 'user-management':
        return 'Gestión de Usuarios';
      case 'twilio-call':
        return 'Gestion de llamadas'
      case 'agentes':
        return 'Gestión de Agentes'
      case 'group-documents':
        return 'Documentos de Grupos'
      case 'knowledge-base':
        return 'Bases de Conocimiento'
      case 'knowledge-items':
        return 'Retroalimentación Inteligente'
      case 'social-connections':
        return 'Conexión de Redes Sociales'
      default:
        return 'Panel de Control';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
      {/* Sidebar - Oculto por defecto, aparece como overlay en móvil */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${
        sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      } lg:relative lg:translate-x-0`}>
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={false}
          onToggleCollapse={() => setSidebarCollapsed(true)}
          user={user}
          onLogout={onLogout}
        />
      </div>

      {/* Overlay para móvil cuando el sidebar está abierto */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
                {getSectionTitle()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name || 'Usuario'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}; 