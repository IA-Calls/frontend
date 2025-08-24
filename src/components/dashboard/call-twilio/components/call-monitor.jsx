"use client"

import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import { Phone, Clock, CheckCircle, XCircle, AlertCircle, Users, Wifi, WifiOff, RefreshCw, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Progress } from "./ui/progress.tsx"
import { Badge } from "./ui/badge.tsx"
import { ScrollArea } from "./ui/scroll-area.tsx"
import { Button } from "./ui/button.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog.tsx"
import { authService } from "../../../../services/authService.js"
import config from "../../../../config/environment.js"

const GROUPS_API_URL = config.GROUPS_API_URL

export function CallMonitor({ users, callStatuses, totalUsers = 0, groupId = null }) {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);

  // Construir URL del endpoint de estado del batch
  const batchStatusUrl = groupId ? `${GROUPS_API_URL}/${groupId}/batch-status?userId=${authService.getClientId()}` : null;

  // Estados para el polling del batch
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const pollingIntervalRef = useRef(null);

  // Función para obtener el estado del batch
  const fetchBatchStatus = useCallback(async () => {
    if (!batchStatusUrl) return;

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
         
         console.log('Datos recibidos:', { batchCall, group });
         
         setBatchData(batchCall || group?.batchMetadata);
         setRecipients(batchCall?.recipients || group?.batchMetadata?.recipients || []);
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
           
           if (window.addActivityLog) {
             window.addActivityLog('✅ Batch de llamadas completado', 'success', 8000);
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
    }
  }, [batchStatusUrl]);

  // Iniciar polling cuando hay groupId
  useEffect(() => {
    if (groupId) {
      // Primera consulta inmediata
      fetchBatchStatus();
      
      // Mostrar log de conexión
      if (window.addActivityLog) {
        window.addActivityLog('📡 Conectado al monitor en tiempo real', 'info', 5000);
      }

      // Configurar polling cada 3 segundos
      pollingIntervalRef.current = setInterval(fetchBatchStatus, 3000);

      // Cleanup al desmontar o cambiar groupId
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [groupId, fetchBatchStatus]);

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

  const recentCalls = useMemo(() => {
    if (recipients.length > 0) {
      // Usar datos de recipients del batch
      return recipients
        .map((recipient) => ({
          recipient,
          user: {
            id: recipient.id,
            name: `Cliente ${recipient.phone_number}`,
            phone: recipient.phone_number
          },
          status: {
            status: recipient.status,
            timestamp: new Date(recipient.updated_at_unix * 1000),
            callId: recipient.conversation_id,
            duration: recipient.duration_secs,
            message: recipient.summary
          }
        }))
        .sort((a, b) => b.status.timestamp.getTime() - a.status.timestamp.getTime())
        .slice(0, 20);
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
  }, [recipients, users, callStatuses]);

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
        return "bg-yellow-100 text-yellow-800"
      case "initiated":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "busy":
        return "bg-orange-100 text-orange-800"
      case "no-answer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
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
  }

  const progressPercentage = stats.total > 0 ? (stats.called / stats.total) * 100 : 0

  return (
    <div className="space-y-6">
   

      {/* Barra de progreso */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Progreso General</CardTitle>
        </CardHeader>    
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
         <Card className="bg-white border border-gray-200">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-gray-600">Total Llamadas</p>
                 <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
               </div>
               <div className="p-3 bg-blue-100 rounded-lg">
                 <Phone className="h-6 w-6 text-blue-600" />
               </div>
             </div>
           </CardContent>
         </Card>

         <Card className="bg-white border border-gray-200">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-gray-600">Completadas</p>
                 <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
               </div>
               <div className="p-3 bg-green-100 rounded-lg">
                 <CheckCircle className="h-6 w-6 text-green-600" />
               </div>
             </div>
           </CardContent>
         </Card>

         <Card className="bg-white border border-gray-200">
           <CardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                 <p className="text-2xl font-bold text-gray-900">{stats.successRate !== undefined ? `${stats.successRate.toFixed(1)}%` : 'N/A'}</p>
               </div>
               <div className="p-3 bg-green-100 rounded-lg">
                 <CheckCircle className="h-6 w-6 text-green-600" />
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Llamadas realizadas</span>
              <span className="font-medium text-gray-900">
                {stats.called} de {stats.total}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-gray-500">{progressPercentage.toFixed(1)}% completado</p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de llamadas recientes */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {recentCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Phone className="h-12 w-12 mb-4 text-gray-400" />
                <p>No hay actividad de llamadas aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                                 {recentCalls.map(({ user, status, recipient }) => (
                   <div
                     key={`${user?.id}-${status.timestamp.getTime()}`}
                     className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                   >
                     <div className="flex items-center gap-3">
                       {getStatusIcon(status.status)}
                       <div className="flex-1">
                         <p className="font-medium text-gray-900">{user?.name}</p>
                         <p className="text-sm text-gray-600">{user?.phone}</p>
                         {recipient?.summary && (
                           <p className="text-xs text-gray-700 mt-1 overflow-hidden" style={{
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical'
                           }}>
                             {recipient.summary}
                           </p>
                         )}
                         {recipient?.duration_secs && (
                           <p className="text-xs text-blue-600 mt-1">
                             Duración: {Math.floor(recipient.duration_secs / 60)}:{(recipient.duration_secs % 60).toString().padStart(2, '0')}
                           </p>
                         )}
                       </div>
                     </div>

                     <div className="text-right flex flex-col items-end gap-2">
                       <Badge variant="secondary" className={`${getStatusColor(status.status)}`}>
                         {getStatusText(status.status)}
                       </Badge>
                       <p className="text-xs text-gray-500">{status.timestamp.toLocaleTimeString()}</p>
                       {recipient && recipient.transcript && (
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={(e) => {
                             e.stopPropagation();
                             showCallDetails({ user, status, recipient });
                           }}
                           className="text-xs h-7 px-2"
                         >
                           Más información
                         </Button>
                       )}
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </ScrollArea>
                 </CardContent>
       </Card>

       {/* Modal de Detalles de Llamada */}
       {console.log('Estado del modal:', { isCallDetailsOpen, selectedCall })}
       
       {isCallDetailsOpen && selectedCall && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           {/* Overlay */}
           <div 
             className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
             onClick={closeCallDetails}
           />
           
           {/* Modal Content */}
           <div className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b">
               <div className="flex items-center gap-2">
                 <Phone className="h-6 w-6 text-blue-600" />
                 <h2 className="text-xl font-semibold">Detalles de la Llamada</h2>
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={closeCallDetails}
                 className="h-8 w-8 p-0 hover:bg-gray-100"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             <p className="px-6 pb-4 text-gray-600 text-sm">
               Información completa de la conversación y audio de la llamada
             </p>

             {/* Content */}
             <div className="flex gap-6 p-6 h-[calc(90vh-140px)]">
               {/* Panel izquierdo - Información básica y resumen */}
               <div className="w-1/3 space-y-4 overflow-y-auto">
                 {/* Información básica */}
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <h3 className="font-semibold text-gray-900 mb-3">Información del Cliente</h3>
                   <div className="space-y-2">
                     <div>
                       <p className="text-sm font-medium text-gray-600">Nombre</p>
                       <p className="text-gray-900">{selectedCall.user.name}</p>
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-600">Teléfono</p>
                       <p className="text-gray-900">{selectedCall.user.phone}</p>
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-600">Estado</p>
                       <Badge variant="secondary" className={`${getStatusColor(selectedCall.status.status)}`}>
                         {getStatusText(selectedCall.status.status)}
                       </Badge>
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-600">Duración</p>
                       <p className="text-gray-900">
                         {Math.floor(selectedCall.recipient.duration_secs / 60)}:{(selectedCall.recipient.duration_secs % 60).toString().padStart(2, '0')}
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Resumen de la conversación */}
                 {selectedCall.recipient.summary && (
                   <div className="bg-blue-50 p-4 rounded-lg">
                     <h3 className="font-semibold text-gray-900 mb-3">Resumen de la Conversación</h3>
                     <p className="text-sm text-gray-800 leading-relaxed">{selectedCall.recipient.summary}</p>
                   </div>
                 )}

                 {/* Audio de la llamada */}
                 {selectedCall.recipient.audio_url && (
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <h3 className="font-semibold text-gray-900 mb-3">Audio de la Llamada</h3>
                     <audio controls className="w-full mb-2">
                       <source src={selectedCall.recipient.audio_url} type="audio/mpeg" />
                       Tu navegador no soporta el elemento de audio.
                     </audio>
                     <p className="text-xs text-gray-500">
                       Tamaño: {(selectedCall.recipient.audio_size / 1024 / 1024).toFixed(2)} MB
                     </p>
                   </div>
                 )}
               </div>

               {/* Panel derecho - Transcripción */}
               <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                 <h3 className="font-semibold text-gray-900 mb-4">Transcripción de la Conversación</h3>
                 {selectedCall.recipient.transcript && selectedCall.recipient.transcript.length > 0 ? (
                   <div className="space-y-4">
                     {selectedCall.recipient.transcript.map((message, index) => (
                       <div
                         key={index}
                         className={`flex gap-3 ${
                           message.role === 'user' ? 'justify-end' : 'justify-start'
                         }`}
                       >
                         <div
                           className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                             message.role === 'user'
                               ? 'bg-blue-600 text-white'
                               : 'bg-white text-gray-900 border border-gray-200'
                           }`}
                         >
                           <p className="text-xs font-medium mb-1 opacity-75">
                             {message.role === 'user' ? 'Cliente' : 'Agente'}
                           </p>
                           <p className="text-sm leading-relaxed">{message.message}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center text-gray-500 py-8">
                     <p>No hay transcripción disponible</p>
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
