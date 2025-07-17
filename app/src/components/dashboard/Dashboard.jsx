import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { CallManagementContent } from './CallManagementContent';
import { MassUploadsContent } from './MassUploadsContent';
import ExcelMapper from "./excelmap"
import CallDashboard from './call-twilio/page'
import { UserManagementContent } from './UserManagementContent';


export const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent user={user} />;
      case 'call-management':
        return <CallManagementContent user={user} />;
      case 'mass-uploads':
        return <ExcelMapper user={user} />;
      case 'user-management':
        return <UserManagementContent user={user} />;
      case 'twilio-call':
        return <CallDashboard user={user}/>
      default:
        return <DashboardContent user={user} />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Panel de Control';
      case 'call-management':
        return 'Gestor de Llamadas';
      case 'mass-uploads':
        return 'Cargas Masivas';
      case 'user-management':
        return 'Gestión de Usuarios';
      case 'twilio-call':
        return 'Gestion llamadas twilio'
      default:
        return 'Panel de Control';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
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
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name || 'Usuario'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}; 