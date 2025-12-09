import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  Sun,
  Moon,
  FolderOpen,
  Brain,
  Heart,
  X,
  MessageSquare,
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronRight,
  Database,
  Sparkles,
  Zap
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import logoNegro from '../../images/logo-negro.png';
import logoBlanco from '../../images/logo-blanco.png';

const menuSections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    items: null // No tiene subitems, es un item directo
  },
  {
    id: 'llamadas',
    label: 'Área de Llamadas',
    icon: Phone,
    items: [
      { id: 'groups', label: 'Grupos', icon: FolderOpen },
      { id: 'interested-clients', label: 'Clientes Interesados', icon: Heart },
      { id: 'group-documents', label: 'Documentos Grupos', icon: FileText },
    ]
  },
  {
    id: 'mensajeria',
    label: 'Área de Mensajería',
    icon: MessageSquare,
    items: [
      { id: 'chats', label: 'Chats', icon: MessageCircle },
      { id: 'templates', label: 'Plantillas', icon: MessageSquare },
    ]
  },
  {
    id: 'configuracion-ia',
    label: 'Configuración IA',
    icon: Sparkles,
    items: [
      { id: 'agentes', label: 'Agentes', icon: Brain },
      { id: 'knowledge-base', label: 'Bases de Conocimiento', icon: Database },
      { id: 'knowledge-items', label: 'Retroalimentación', icon: Zap },
    ]
  },
  {
    id: 'administracion',
    label: 'Administración',
    icon: Settings,
    items: [
      { id: 'user-management', label: 'Gestión de Usuarios', icon: Users },
      { id: 'settings', label: 'Configuración', icon: Settings },
    ]
  }
];

export const Sidebar = ({ 
  activeSection, 
  onSectionChange, 
  collapsed, 
  onToggleCollapse, 
  user, 
  onLogout 
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    llamadas: true,
    mensajeria: true,
    'configuracion-ia': true,
    administracion: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Auto-expandir secciones cuando hay un item activo
  useEffect(() => {
    setExpandedSections(prev => {
      const newState = { ...prev };
      let changed = false;
      
      menuSections.forEach(section => {
        if (section.items) {
          const hasActiveItem = section.items.some(item => activeSection === item.id);
          if (hasActiveItem && !prev[section.id]) {
            newState[section.id] = true;
            changed = true;
          }
        }
      });
      
      return changed ? newState : prev;
    });
  }, [activeSection]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64 lg:w-64 shadow-lg lg:shadow-none">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <img 
              src={isDarkMode ? logoBlanco : logoNegro} 
              alt="NextVoice" 
              className="h-6 sm:h-8 w-auto flex-shrink-0"
            />
            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
              NextVoice
            </span>
          </div>
          
          <button
            onClick={onToggleCollapse}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        {menuSections.map((section) => {
          const SectionIcon = section.icon;
          
          // Si no tiene items, es un item directo (como Dashboard)
          if (!section.items) {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id);
                  if (window.innerWidth < 1024) {
                    onToggleCollapse();
                  }
                }}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <SectionIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium truncate">{section.label}</span>
              </button>
            );
          }

          // Si tiene items, es un menú desplegable
          const isExpanded = expandedSections[section.id];
          const hasActiveItem = section.items.some(item => activeSection === item.id);

          return (
            <div key={section.id} className="space-y-1">
              {/* Header del menú desplegable */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
                  hasActiveItem
                    ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <SectionIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="font-medium truncate">{section.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
              </button>

              {/* Items del menú desplegable */}
              {isExpanded && (
                <div className="ml-4 sm:ml-6 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2 sm:pl-3">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id);
                          if (window.innerWidth < 1024) {
                            onToggleCollapse();
                          }
                        }}
                        className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <ItemIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
        
      {/* Dark Mode Toggle */}
      <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          ) : (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          )}
          <span className="font-medium truncate">
            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </span>
        </button>
      </div>

      {/* User Profile & Logout */}
      <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs sm:text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'usuario@ejemplo.com'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="font-medium truncate">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}; 