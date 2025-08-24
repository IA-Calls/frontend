import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

export const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Función para agregar un nuevo log
  const addLog = (message, type = 'info', duration = 5000) => {
    const newLog = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date(),
      duration
    };

    setLogs(prev => [newLog, ...prev.slice(0, 4)]); // Mantener solo los últimos 5 logs
    setIsVisible(true);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      removeLog(newLog.id);
    }, duration);
  };

  // Función para remover un log
  const removeLog = (id) => {
    setLogs(prev => prev.filter(log => log.id !== id));
    if (logs.length <= 1) {
      setIsVisible(false);
    }
  };

  // Exponer la función addLog globalmente
  useEffect(() => {
    window.addActivityLog = addLog;
    return () => {
      delete window.addActivityLog;
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  if (!isVisible || logs.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm"
      style={{ zIndex: 9999 }}
    >
      {logs.map((log) => (
        <div
          key={log.id}
          className={`${getBgColor(log.type)} border rounded-lg p-3 shadow-lg transition-all duration-300 ease-in-out transform translate-x-0`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              {getIcon(log.type)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getTextColor(log.type)}`}>
                  {log.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {log.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeLog(log.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
