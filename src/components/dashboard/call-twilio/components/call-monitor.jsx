"use client"

import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import { Phone, Clock, CheckCircle, XCircle, AlertCircle, Users, Wifi, WifiOff, RefreshCw, X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Progress } from "./ui/progress.tsx"
import { Badge } from "./ui/badge.tsx"
import { ScrollArea } from "./ui/scroll-area.tsx"
import { Button } from "./ui/button.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog.tsx"
import { authService } from "../../../../services/authService.js"
import config from "../../../../config/environment.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import * as XLSX from "xlsx"

const GROUPS_API_URL = config.GROUPS_API_URL

export function CallMonitor({ users, callStatuses, totalUsers = 0, groupId = null }) {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Función para guardar preferencias en localStorage
  const savePreferences = useCallback((limit, statusFilter) => {
    try {
      localStorage.setItem('callMonitor_limit', limit.toString());
      localStorage.setItem('callMonitor_statusFilter', statusFilter);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, []);

  // Estados de paginación - inicializar con preferencias guardadas usando función inicializadora
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => {
    try {
      const savedLimit = localStorage.getItem('callMonitor_limit');
      return savedLimit ? parseInt(savedLimit) : 10;
    } catch {
      return 10;
    }
  });
  const [pagination, setPagination] = useState(null);
  
  // Estado para el filtro - inicializar con preferencias guardadas usando función inicializadora
  const [statusFilter, setStatusFilter] = useState(() => {
    try {
      return localStorage.getItem('callMonitor_statusFilter') || 'all';
    } catch {
      return 'all';
    }
  }); // 'all', 'completed', 'failed', 'initiated'

  // Construir URL del endpoint de estado del batch con paginación
  const batchStatusUrl = useMemo(() => {
    if (!groupId) return null;
    return `${GROUPS_API_URL}/${groupId}/batch-status?userId=${authService.getClientId()}&page=${page}&limit=${limit}`;
  }, [groupId, page, limit]);

  // Estados para el polling del batch
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const pollingIntervalRef = useRef(null);

  // Función para obtener el estado del batch
  const fetchBatchStatus = useCallback(async () => {
    if (!batchStatusUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch(batchStatusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authService.getToken() && { 'Authorization': `Bearer ${authService.getToken()}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Extraer datos de la nueva estructura
        const batchCall = result.data.batchCall;
        const group = result.data.group;
        
        console.log('Datos recibidos:', { batchCall, group, pagination: result.pagination });
        
        setBatchData(batchCall || group?.batchMetadata);
        setRecipients(batchCall?.recipients || group?.batchMetadata?.recipients || []);
        
        // Guardar información de paginación
        if (result.pagination) {
          setPagination(result.pagination);
        }
        
        setLastUpdate(new Date());
        setIsConnected(true);
        setError(null);

        // Si el batch está completado, detener el polling
        const status = batchCall?.status || group?.batchStatus;
        if (status === 'completed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } else {
        throw new Error(result.message || 'Error al obtener estado del batch');
      }
    } catch (err) {
      console.error('Error fetching batch status:', err);
      setError(err.message);
      setIsConnected(false);
      
      if (window.addActivityLog) {
        window.addActivityLog('❌ Error en conexión del monitor', 'error', 6000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [batchStatusUrl]);

  // Iniciar polling cuando hay groupId, limit o statusFilter cambian (NO cuando cambia page)
  useEffect(() => {
    if (groupId) {
      // Primera consulta inmediata
      fetchBatchStatus();
      


      // Configurar polling cada 3 segundos
      pollingIntervalRef.current = setInterval(fetchBatchStatus, 3000);

      // Cleanup al desmontar o cambiar groupId, limit o statusFilter
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [groupId, limit, statusFilter, fetchBatchStatus]);

  // Guardar preferencias cuando cambian limit o statusFilter
  useEffect(() => {
    savePreferences(limit, statusFilter);
  }, [limit, statusFilter, savePreferences]);

  // Resetear a página 1 cuando cambia el límite o el filtro
  useEffect(() => {
    setPage(1);
  }, [limit, statusFilter]);

  // Actualizar datos cuando cambia la página (hacer petición inmediata sin reiniciar polling)
  useEffect(() => {
    if (groupId && batchStatusUrl) {
      // Hacer una petición inmediata cuando cambia la página
      // El polling continuará con la nueva página automáticamente porque batchStatusUrl se actualiza
      fetchBatchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    fetchBatchStatus();
  }, [fetchBatchStatus]);

  // Función para mostrar detalles de la llamada
  const showCallDetails = useCallback((call) => {
    console.log('Abriendo modal con datos:', call);
    setSelectedCall(call);
    setIsCallDetailsOpen(true);
  }, []);

  // Función para cerrar detalles de la llamada
  const closeCallDetails = useCallback(() => {
    console.log('Cerrando modal');
    setIsCallDetailsOpen(false);
    setSelectedCall(null);
  }, []);

     // Calcular estadísticas del batch
   const stats = useMemo(() => {
     if (batchData) {
       // Usar datos del batchCall o batchMetadata
       const total = batchData.total_calls_scheduled || recipients.length;
       const called = batchData.total_calls_dispatched || 0;
       const completed = recipients.filter(r => r.status === 'completed').length;
       const failed = recipients.filter(r => r.status === 'failed').length;
       const inProgress = recipients.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
       const successRate = total > 0 ? (completed / total) * 100 : 0;

       const statsResult = { total, called, completed, failed, inProgress, successRate };
       console.log('Estadísticas calculadas:', statsResult);
       return statsResult;
     }
     
     // Estadísticas locales (fallback)
     const total = totalUsers || users.length;
     const called = callStatuses.size;
     const completed = Array.from(callStatuses.values()).filter((s) => s.status === "completed").length;
     const failed = Array.from(callStatuses.values()).filter((s) => s.status === "failed").length;
     const inProgress = Array.from(callStatuses.values()).filter(
       (s) => s.status === "pending" || s.status === "initiated",
     ).length;

     return { total, called, completed, failed, inProgress };
   }, [batchData, recipients, totalUsers, users.length, callStatuses]);

  // Función para extraer el nombre del cliente
  const getClientName = useCallback((recipient) => {
    // Intentar obtener el nombre de dynamic_variables
    const dynamicVars = recipient?.conversation_initiation_client_data?.dynamic_variables;
    if (dynamicVars?.name) {
      return dynamicVars.name;
    }
    
    // Fallback al número de teléfono
    return recipient?.phone_number || 'Cliente desconocido';
  }, []);

  const recentCalls = useMemo(() => {
    if (recipients.length > 0) {
      // Usar datos de recipients del batch - ya vienen paginados del backend
      let filtered = recipients
        .map((recipient) => {
          const clientName = getClientName(recipient);
          return {
            recipient,
            user: {
              id: recipient.id,
              name: clientName,
              phone: recipient.phone_number
            },
            status: {
              status: recipient.status,
              timestamp: new Date(recipient.updated_at_unix * 1000),
              callId: recipient.conversation_id,
              duration: recipient.duration_secs,
              message: recipient.summary
            }
          };
        })
        .sort((a, b) => b.status.timestamp.getTime() - a.status.timestamp.getTime());

      // Aplicar filtro de estado
      if (statusFilter !== 'all') {
        filtered = filtered.filter((item) => {
          const status = item.status.status;
          if (statusFilter === 'completed') {
            return status === 'completed';
          } else if (statusFilter === 'failed') {
            return status === 'failed' || status === 'no-answer' || status === 'busy';
          } else if (statusFilter === 'initiated') {
            return status === 'pending' || status === 'initiated' || status === 'in-progress';
          }
          return true;
        });
      }

      return filtered;
    }
    
    // Fallback a datos locales
    return Array.from(callStatuses.entries())
      .map(([userId, status]) => ({
        user: users.find((u) => u.id === userId),
        status,
      }))
      .filter((item) => item.user)
      .sort((a, b) => b.status.timestamp.getTime() - a.status.timestamp.getTime())
      .slice(0, 20);
  }, [recipients, users, callStatuses, getClientName, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
      case "no-answer":
      case "busy":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "initiated":
        return <Phone className="h-4 w-4 text-blue-600 animate-pulse" />
      default: // pending
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
      case "initiated":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
      case "failed":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
      case "busy":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400"
      case "no-answer":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
    }
  }

  const getStatusText = useCallback((status) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "initiated":
        return "Iniciada"
      case "completed":
        return "Completada"
      case "failed":
        return "Falló"
      case "busy":
        return "Ocupado"
      case "no-answer":
        return "Sin respuesta"
      default:
        return "Desconocido"
    }
  }, [])

  // Función para exportar a Excel los datos visibles
  const handleExportToExcel = useCallback(() => {
    try {
      if (recentCalls.length === 0) {
        if (window.addActivityLog) {
          window.addActivityLog('⚠️ No hay datos para exportar', 'warning', 4000);
        }
        return;
      }

      // Preparar los datos para Excel
      const excelData = recentCalls.map(({ user, status, recipient }) => {
        const duration = recipient?.duration_secs 
          ? `${Math.floor(recipient.duration_secs / 60)}:${(recipient.duration_secs % 60).toString().padStart(2, '0')}`
          : 'N/A';
        
        return {
          'Nombre': user?.name || 'N/A',
          'Número de Teléfono': user?.phone || 'N/A',
          'Estado de Llamada': getStatusText(status.status),
          'Duración de la Llamada': duration,
          'Resumen': recipient?.summary || 'N/A',
          'Fecha y Hora': status.timestamp.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        };
      });

      // Crear workbook y worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Llamadas');

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 30 }, // Nombre
        { wch: 18 }, // Número
        { wch: 18 }, // Estado
        { wch: 18 }, // Duración
        { wch: 50 }, // Resumen
        { wch: 20 }  // Fecha y Hora
      ];
      worksheet['!cols'] = columnWidths;

      // Generar el archivo Excel
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const filterText = statusFilter !== 'all' ? `_${statusFilter}` : '';
      const filename = `reporte_llamadas_monitor${filterText}_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

      if (window.addActivityLog) {
        window.addActivityLog('✅ Reporte Excel exportado exitosamente', 'success', 5000);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      if (window.addActivityLog) {
        window.addActivityLog('❌ Error al exportar Excel', 'error', 6000);
      }
    }
  }, [recentCalls, statusFilter, getStatusText]);

  const progressPercentage = stats.total > 0 ? (stats.called / stats.total) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Estadísticas y Controles */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3 sm:p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-5">
          {/* Estadísticas */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Total:</span>
              <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Completadas:</span>
              <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{stats.completed}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Progreso:</span>
              <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{progressPercentage.toFixed(0)}%</span>
            </div>
          </div>

          {/* Controles: Filtros y Exportar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 md:gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-0">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0">Estado:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] sm:w-[130px] md:w-[140px] h-8 text-xs sm:text-sm flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="failed">Fallidas</SelectItem>
                  <SelectItem value="initiated">Iniciadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-0">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0">Por página:</label>
              <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                <SelectTrigger className="w-[85px] sm:w-[90px] md:w-[100px] h-8 text-xs sm:text-sm flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              disabled={recentCalls.length === 0 || isLoading}
              className="h-8 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 px-3 sm:px-4"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Exportar Excel</span>
              <span className="sm:hidden">Excel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de llamadas recientes */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="relative">
          <ScrollArea className="h-[500px]">
            {isLoading && recipients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p>Cargando datos...</p>
              </div>
            ) : recentCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Phone className="h-12 w-12 mb-4 text-gray-400 dark:text-gray-500" />
                <p>No hay actividad de llamadas {statusFilter !== 'all' ? 'con este filtro' : 'aún'}</p>
              </div>
            ) : (
              <div className="space-y-2 relative">
                {isLoading && recipients.length > 0 && (
                  <div className="sticky top-0 z-10 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-2 text-center mb-2 rounded-t-lg">
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-xs">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span>Actualizando datos...</span>
                    </div>
                  </div>
                )}
                {recentCalls.map(({ user, status, recipient }) => (
                  <div
                    key={`${user?.id}-${status.timestamp.getTime()}`}
                    onClick={() => {
                      if (recipient && recipient.transcript) {
                        showCallDetails({ user, status, recipient });
                      }
                    }}
                    className={`flex items-center justify-between p-2 sm:p-3 border border-gray-100 dark:border-gray-700 rounded-lg transition-colors ${
                      recipient && recipient.transcript 
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' 
                        : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getStatusIcon(status.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <Badge variant="secondary" className={`${getStatusColor(status.status)} text-xs px-1.5 py-0.5 flex-shrink-0`}>
                            {getStatusText(status.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                          <p className="truncate">{user?.phone}</p>
                          {recipient?.duration_secs && (
                            <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              • {Math.floor(recipient.duration_secs / 60)}:{(recipient.duration_secs % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                          <span className="text-gray-500 dark:text-gray-500 whitespace-nowrap">
                            • {status.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {recipient?.summary && (
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 overflow-hidden line-clamp-1">
                            {recipient.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {recipient && recipient.transcript && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap flex items-center gap-1">
                          <span className="hidden sm:inline">Ver detalles</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Controles de paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage || page === 1}
                  className="h-8 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNextPage || page >= pagination.totalPages}
                  className="h-8 px-3"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

       {/* Modal de Detalles de Llamada */}
       {console.log('Estado del modal:', { isCallDetailsOpen, selectedCall })}
       
       {isCallDetailsOpen && selectedCall && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
           {/* Overlay */}
           <div 
             className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
             onClick={closeCallDetails}
           />
           
           {/* Modal Content */}
           <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
             {/* Header */}
             <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
               <div className="flex items-center gap-2 min-w-0">
                 <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                 <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">Detalles de la Llamada</h2>
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={closeCallDetails}
                 className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             <p className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex-shrink-0">
               Información completa de la conversación y audio de la llamada
             </p>

             {/* Content */}
             <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 flex-1 overflow-hidden min-h-0">
               {/* Panel izquierdo - Información básica y resumen */}
               <div className="w-full lg:w-1/3 space-y-3 sm:space-y-4 overflow-y-auto flex-shrink-0 lg:flex-shrink">
                 {/* Información básica */}
                 <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                   <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Información del Cliente</h3>
                   <div className="space-y-2">
                     <div>
                       <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</p>
                       <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{selectedCall.user.name}</p>
                     </div>
                     <div>
                       <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono</p>
                       <p className="text-sm sm:text-base text-gray-900 dark:text-white break-words">{selectedCall.user.phone}</p>
                     </div>
                     <div>
                       <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
                       <Badge variant="secondary" className={`${getStatusColor(selectedCall.status.status)} text-xs`}>
                         {getStatusText(selectedCall.status.status)}
                       </Badge>
                     </div>
                     <div>
                       <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Duración</p>
                       <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                         {Math.floor(selectedCall.recipient.duration_secs / 60)}:{(selectedCall.recipient.duration_secs % 60).toString().padStart(2, '0')}
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Resumen de la conversación */}
                 {selectedCall.recipient.summary && (
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                     <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Resumen de la Conversación</h3>
                     <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed break-words">{selectedCall.recipient.summary}</p>
                   </div>
                 )}

                 {/* Audio de la llamada */}
                 {selectedCall.recipient.audio_url && (
                   <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                     <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Audio de la Llamada</h3>
                     <audio controls className="w-full mb-2">
                       <source src={selectedCall.recipient.audio_url} type="audio/mpeg" />
                       Tu navegador no soporta el elemento de audio.
                     </audio>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                       Tamaño: {(selectedCall.recipient.audio_size / 1024 / 1024).toFixed(2)} MB
                     </p>
                   </div>
                 )}
               </div>

               {/* Panel derecho - Transcripción */}
               <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 overflow-y-auto min-h-0">
                 <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Transcripción de la Conversación</h3>
                 {selectedCall.recipient.transcript && selectedCall.recipient.transcript.length > 0 ? (
                   <div className="space-y-3 sm:space-y-4">
                     {selectedCall.recipient.transcript.map((message, index) => (
                       <div
                         key={index}
                         className={`flex gap-2 sm:gap-3 ${
                           message.role === 'user' ? 'justify-end' : 'justify-start'
                         }`}
                       >
                         <div
                           className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg shadow-sm ${
                             message.role === 'user'
                               ? 'bg-blue-600 text-white'
                               : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                           }`}
                         >
                           <p className="text-xs font-medium mb-1 opacity-75">
                             {message.role === 'user' ? 'Cliente' : 'Agente'}
                           </p>
                           <p className="text-xs sm:text-sm leading-relaxed break-words">{message.message}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8">
                     <p className="text-sm">No hay transcripción disponible</p>
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }
