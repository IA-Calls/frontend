"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { Phone, Users, Play, Square, RefreshCw, Zap, Target, Download, Search, Filter, Plus, Edit, Trash2, FolderOpen, UserPlus, FileText, CheckCircle, ArrowLeft, XCircle, X } from "lucide-react"
import { Button } from "./components/ui/button.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs.tsx"
import { UserList } from "./components/user-list.jsx"
import { CallMonitor } from "./components/call-monitor.jsx"
import { Pagination } from "./components/pagination.jsx"
import { StatsCards } from "./components/stats-cards.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card.tsx"
import { Input } from "./components/ui/input.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./components/ui/dialog.tsx"
import { GroupModal } from "./components/GroupModal.jsx"
import { DeleteGroupModal } from "./components/DeleteGroupModal.jsx"
import { GroupDocuments } from "./components/GroupDocuments.jsx"
import { TestCallModal } from "./components/TestCallModal.jsx"
import { Badge } from "./components/ui/badge.tsx"
import { useToast } from "./use-toast.ts"
import { ActivityLog } from "./components/ActivityLog.jsx"
import config from "../../../config/environment.js"
import { authService } from "../../../services/authService.js"

// Usar configuración de entorno
const EXTERNAL_OUTBOUND_CALL_API_URL = config.TWILIO_CALL_URL
const CLIENTS_PENDING_API_URL = config.CLIENTS_PENDING_API_URL
const GROUPS_API_URL = config.GROUPS_API_URL
const OUTBOUND_CALL_PROXY_API_URL = config.OUTBOUND_CALL_PROXY_API_URL

export default function CallDashboard() {
  // Estados principales
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [callStatuses, setCallStatuses] = useState(new Map())
  const [isCallingState, setIsCallingState] = useState(false)
  const stopCallingRef = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estado para navegación de vistas
  const [currentView, setCurrentView] = useState('groups') // 'groups' | 'group-detail'

  // Estados para gestión de grupos
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    prompt: '',
    color: '#3B82F6',
    favorite: false
  })
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, groupId: null, groupName: '' })
  const [isDeletingGroup, setIsDeletingGroup] = useState(false)

  // Estados para modal de prueba de llamada
  const [isTestCallModalOpen, setIsTestCallModalOpen] = useState(false)

  // Estados para preparación de agente
  const [agentPreparationStatus, setAgentPreparationStatus] = useState(new Map()) // Map<groupId, boolean>
  const [isPreparingAgent, setIsPreparingAgent] = useState(false)

  // Estados para monitor de batch
  const [currentBatchId, setCurrentBatchId] = useState(null)



  // Estados para paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalGroups: 0,
    totalClients: 0,
    limit: 10,
  })

  // Estados para filtros
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterCallStatus, setFilterCallStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const { toast } = useToast()
  // Limpiar batchId cuando cambie el grupo seleccionado
  useEffect(() => {
    if (selectedGroup && currentBatchId) {
      // Solo limpiar si el batchId no corresponde al grupo actual
      // Esto se puede mejorar cuando tengas más información sobre qué batch pertenece a qué grupo
      // Por ahora, lo mantenemos simple
    }
  }, [selectedGroup, currentBatchId])

  // Obtener todos los grupos desde clients/pending
  const fetchGroups = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true)
    setError(null)
    try {
      // Obtener el clientID del usuario autenticado
      const clientId = authService.getClientId()

      // Construir la URL con o sin clientID
      const url = clientId
        ? `${CLIENTS_PENDING_API_URL}/${clientId}`
        : CLIENTS_PENDING_API_URL

      console.log('Fetching groups from URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authService.getToken() && { 'Authorization': `Bearer ${authService.getToken()}` })
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // La API ahora devuelve un array directo de grupos o un objeto con data
      const groupsArray = Array.isArray(data) ? data : (data.data || [])
      setGroups(groupsArray)

      setPagination({
        currentPage: 1, // El endpoint no maneja paginación por ahora
        totalPages: 1,
        totalGroups: groupsArray.length,
        totalClients: data.totalClients || 0,
        limit: limit,
      })

      toast({
        title: "✅ Grupos cargados",
        description: `Se cargaron ${groupsArray.length} grupos con ${data.totalClients || 0} clientes.`,
      })
    } catch (error) {
      console.error("Error fetching groups:", error)

      // Manejar error específico de autenticación
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
        toast({
          title: "❌ Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        })
      } else {
        setError(`No se pudieron cargar los grupos: ${error.message}`)
        toast({
          title: "❌ Error al cargar grupos",
          description: "Verifica la conexión con la API.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Crear o actualizar grupo
  const saveGroup = useCallback(async (formData = null) => {
    const dataToSave = formData || groupForm

    if (!dataToSave.name.trim()) {
      toast({
        title: "⚠️ Campo requerido",
        description: "El nombre del grupo es obligatorio.",
        variant: "destructive",
      })
      return
    }

    try {
      // Extract file data if present (for new group creation)
      const { file, filename, ...groupData } = dataToSave

      let result

      // If file is provided and this is a new group, create group with Excel processing
      if (file && filename && !editingGroup) {
        try {
          console.log('Creating group with Excel processing')

          // Create group with Excel data in the new format
          const groupDataWithExcel = {
            ...groupData,
            base64: file,
            document_name: filename
          }

          console.log('Creating group with data:', {
            ...groupDataWithExcel,
            base64: groupDataWithExcel.base64 ? `${groupDataWithExcel.base64.substring(0, 50)}...` : 'No base64'
          })

          const createGroupResponse = await fetch(GROUPS_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(groupDataWithExcel),
          })

          if (!createGroupResponse.ok) {
            const errorData = await createGroupResponse.json().catch(() => ({}))
            throw new Error(errorData.message || `Error ${createGroupResponse.status}: ${createGroupResponse.statusText}`)
          }

          result = await createGroupResponse.json()
          console.log('Group created successfully with Excel processing:', result)

          // Show success message for group creation with Excel
          let message = `El grupo "${groupData.name}" se creó correctamente.`

          if (result.data?.successfullyProcessed) {
            message += ` Se procesaron ${result.data.successfullyProcessed} clientes exitosamente.`
          }

          if (result.data?.processingErrors && result.data.processingErrors > 0) {
            message += ` ${result.data.processingErrors} filas tuvieron errores.`
          }

          // Mostrar log de éxito
          if (window.addActivityLog) {
            window.addActivityLog(`✅ Grupo "${groupData.name}" creado exitosamente con ${result.data?.successfullyProcessed || 0} clientes`, 'success', 8000)
          }

          toast({
            title: "✅ Grupo creado con clientes",
            description: message,
          })

        } catch (error) {
          console.error('Error creating group with Excel:', error)
          toast({
            title: "❌ Error",
            description: `No se pudo crear el grupo: ${error.message}`,
            variant: "destructive",
          })
          return
        }
      } else {
        // Regular group creation/update without file
        const url = editingGroup
          ? `${GROUPS_API_URL}/${editingGroup.id}`
          : GROUPS_API_URL

        console.log('Creating/updating group with data:', groupData)

        const response = await fetch(url, {
          method: editingGroup ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(groupData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        result = await response.json()

        // Mostrar log de éxito
        if (window.addActivityLog) {
          window.addActivityLog(`✅ Grupo "${groupData.name}" ${editingGroup ? 'actualizado' : 'creado'} exitosamente`, 'success', 8000)
        }

        // Show success message for regular group creation/update
        toast({
          title: editingGroup ? "✅ Grupo actualizado" : "✅ Grupo creado",
          description: `El grupo "${groupData.name}" se ${editingGroup ? 'actualizó' : 'creó'} correctamente.`,
        })
      }

      setIsGroupDialogOpen(false)
      setEditingGroup(null)
      setGroupForm({ name: '', description: '', prompt: '', color: '#3B82F6', favorite: false })

      // Refresh groups to show the new clients
      setTimeout(() => {
        fetchGroups()
      }, 1000)

    } catch (error) {
      console.error('Error saving group:', error)
      toast({
        title: "❌ Error",
        description: `No se pudo ${editingGroup ? 'actualizar' : 'crear'} el grupo: ${error.message}`,
        variant: "destructive",
      })
    }
  }, [groupForm, editingGroup, fetchGroups, toast])

  // Eliminar grupo
  const deleteGroup = useCallback(async (groupId) => {
    setIsDeletingGroup(true)
    try {
      const response = await fetch(`${GROUPS_API_URL}/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      // Mostrar log de éxito
      if (window.addActivityLog) {
        window.addActivityLog('✅ Grupo eliminado exitosamente', 'success', 8000)
      }

      toast({
        title: "✅ Grupo eliminado",
        description: "El grupo se eliminó correctamente.",
      })

      setDeleteConfirmDialog({ open: false, groupId: null, groupName: '' })
      fetchGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
      toast({
        title: "❌ Error",
        description: `No se pudo eliminar el grupo: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDeletingGroup(false)
    }
  }, [fetchGroups, toast])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])



  // Obtener todos los usuarios de todos los grupos
  const allUsers = useMemo(() => {
    const users = []
    const seenUsers = new Set() // Para evitar duplicados

    groups.forEach(group => {
      // Verificar si el grupo tiene clientes
      if (group.clients && Array.isArray(group.clients)) {
        group.clients.forEach(client => {
          // Crear un ID único combinando client.id y group.id
          const uniqueId = `${client.id}-${group.id}`

          // Solo agregar si no hemos visto este usuario en este grupo antes
          if (!seenUsers.has(uniqueId)) {
            seenUsers.add(uniqueId)
            users.push({
              id: uniqueId, // Usar ID único
              clientId: client.id, // Mantener el ID original del cliente
              name: client.name,
              phone: client.phone,
              email: client.email || client.metadata?.mail,
              category: client.category,
              address: client.address || client.metadata?.adress,
              website: client.metadata?.web,
              review: client.review,
              totalCalls: client.metadata?.total_calls || 0,
              groupId: group.id,
              groupName: group.name,
              groupColor: group.color
            })
          }
        })
      }
    })
    return users
  }, [groups])

  // Usuarios filtrados por grupo seleccionado
  const filteredUsers = useMemo(() => {
    if (!selectedGroup) return allUsers
    return allUsers.filter(user => user.groupId === selectedGroup.id)
  }, [allUsers, selectedGroup])

  const handleUserSelection = useCallback((userId, selected) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    const usersToSelect = selectedGroup ? filteredUsers : allUsers
    setSelectedUsers(new Set(usersToSelect.map((user) => user.id)))
  }, [selectedGroup, filteredUsers, allUsers])

  const handleDeselectAll = useCallback(() => {
    setSelectedUsers(new Set())
  }, [])

  const makeCall = useCallback(
    async (user) => {
      console.log(`[makeCall] Attempting to make call for user: ${user.name} with phone: ${user.phone}`)

      try {
        setCallStatuses(
          (prev) =>
            new Map(
              prev.set(user.id, {
                userId: user.id,
                status: "pending",
                timestamp: new Date(),
              }),
            ),
        )

        const response = await fetch(OUTBOUND_CALL_PROXY_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: user.phone,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.Success === true && result["Call-sid"]) {
          const callId = result["Call-sid"]
          // Mostrar log de llamada exitosa
          if (window.addActivityLog) {
            window.addActivityLog(`📞 Llamada iniciada a ${user.name}`, 'success', 4000)
          }

          toast({
            title: "📞 Llamada iniciada",
            description: `Llamando a ${user.name} (${user.phone}). SID: ${callId.slice(-8)}`,
            duration: 2000,
          })

          setCallStatuses(
            (prev) =>
              new Map(
                prev.set(user.id, {
                  userId: user.id,
                  callId: callId,
                  status: "initiated",
                  timestamp: new Date(),
                }),
              ),
          )
        } else {
          setCallStatuses(
            (prev) =>
              new Map(
                prev.set(user.id, {
                  userId: user.id,
                  status: "failed",
                  timestamp: new Date(),
                }),
              ),
          )
          // Mostrar log de error en llamada
          if (window.addActivityLog) {
            window.addActivityLog(`❌ Error al llamar a ${user.name}`, 'error', 6000)
          }

          toast({
            title: "❌ Error en llamada",
            description: `No se pudo llamar a ${user.name}`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[makeCall] Error:", error)
        setCallStatuses(
          (prev) =>
            new Map(
              prev.set(user.id, {
                userId: user.id,
                status: "failed",
                timestamp: new Date(),
              }),
            ),
        )
        // Mostrar log de error en llamada
        if (window.addActivityLog) {
          window.addActivityLog(`❌ Error de conexión al llamar a ${user.name}`, 'error', 6000)
        }

        toast({
          title: "❌ Error en llamada",
          description: `No se pudo llamar a ${user.name}: ${error.message}`,
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleCallSelected = useCallback(async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "⚠️ Sin selección",
        description: "Por favor selecciona al menos un usuario para llamar.",
        variant: "destructive",
      })
      return
    }

    // Verificar si el agente está preparado cuando hay un grupo seleccionado
    if (selectedGroup && !isAgentPrepared(selectedGroup.id)) {
      toast({
        title: "⚠️ Agente no preparado",
        description: "Debes preparar el agente antes de hacer llamadas.",
        variant: "destructive",
      })

      // Mostrar log de advertencia
      if (window.addActivityLog) {
        window.addActivityLog(`⚠️ No se pueden hacer llamadas: agente no preparado para el grupo "${selectedGroup.name}"`, 'warning', 8000)
      }
      return
    }

    setIsCallingState(true)
    stopCallingRef.current = false
    const usersToCall = selectedGroup
      ? filteredUsers.filter((user) => selectedUsers.has(user.id))
      : allUsers.filter((user) => selectedUsers.has(user.id))
    // Mostrar log de inicio de llamadas masivas
    if (window.addActivityLog) {
      window.addActivityLog(`🚀 Iniciando ${usersToCall.length} llamadas masivas`, 'info', 5000)
    }

    toast({
      title: "🚀 Iniciando llamadas",
      description: `Iniciando ${usersToCall.length} llamadas...`,
    })

    for (let i = 0; i < usersToCall.length; i++) {
      if (stopCallingRef.current) break
      await makeCall(usersToCall[i])
      if (i < usersToCall.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setIsCallingState(false)
  }, [selectedUsers, selectedGroup, filteredUsers, allUsers, makeCall, toast])

  const handleCallGroup = useCallback(async (group) => {
    if (!group.clients || !Array.isArray(group.clients) || group.clients.length === 0) {
      toast({
        title: "⚠️ Grupo vacío",
        description: "Este grupo no tiene clientes para llamar.",
        variant: "destructive",
      })
      return
    }

    // Verificar si el agente está preparado para este grupo
    if (!isAgentPrepared(group.id)) {
      toast({
        title: "⚠️ Agente no preparado",
        description: "Debes preparar el agente antes de hacer llamadas a este grupo.",
        variant: "destructive",
      })

      // Mostrar log de advertencia
      if (window.addActivityLog) {
        window.addActivityLog(`⚠️ No se pueden hacer llamadas: agente no preparado para el grupo "${group.name}"`, 'warning', 8000)
      }
      return
    }

    setIsCallingState(true)
    stopCallingRef.current = false

    const groupUsers = group.clients.map(client => ({
      id: `${client.id}-${group.id}`, // ID único
      clientId: client.id, // ID original del cliente
      name: client.name,
      phone: client.phone,
      email: client.email || client.metadata?.mail,
      category: client.category,
      address: client.address || client.metadata?.adress,
      website: client.metadata?.web,
      review: client.review,
      totalCalls: client.metadata?.total_calls || 0,
      groupId: group.id,
      groupName: group.name,
      groupColor: group.color
    }))

    // Mostrar log de inicio de llamadas de grupo
    if (window.addActivityLog) {
      window.addActivityLog(`🚀 Iniciando llamadas al grupo "${group.name}" (${groupUsers.length} clientes)`, 'info', 5000)
    }

    toast({
      title: "🚀 Iniciando llamadas de grupo",
      description: `Llamando a ${groupUsers.length} clientes del grupo "${group.name}"`,
    })

    for (let i = 0; i < groupUsers.length; i++) {
      if (stopCallingRef.current) break
      await makeCall(groupUsers[i])
      if (i < groupUsers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setIsCallingState(false)
  }, [makeCall, toast])

  const handleStopCalls = useCallback(() => {
    stopCallingRef.current = true
    setIsCallingState(false)

    // Mostrar log de detención de llamadas
    if (window.addActivityLog) {
      window.addActivityLog('⏹️ Proceso de llamadas detenido', 'warning', 5000)
    }

    toast({
      title: "⏹️ Llamadas detenidas",
      description: "Se ha detenido el proceso de llamadas.",
    })
  }, [toast])

  // Función para manejar llamada de prueba
  const handleTestCall = useCallback(async (callData) => {
    try {
      // Aquí iría la lógica real para iniciar la llamada de prueba
      // Por ahora simulamos una llamada
      console.log('Iniciando llamada de prueba:', callData)

      // Simular delay de la llamada
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: "✅ Llamada de prueba completada",
        description: `Llamada a ${callData.name} finalizada exitosamente.`,
      })

      setIsTestCallModalOpen(false)
    } catch (error) {
      console.error('Error en llamada de prueba:', error)
      throw error
    }
  }, [toast])

  const handleConfirmDelete = useCallback(() => {
    deleteGroup(deleteConfirmDialog.groupId)
  }, [deleteGroup, deleteConfirmDialog.groupId])

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteConfirmDialog({ open: false, groupId: null, groupName: '' })
  }, [])

  const handleRefresh = useCallback(() => {
    fetchGroups()
  }, [fetchGroups])

  // Funciones de navegación
  const handleGroupSelect = useCallback((group) => {
    setSelectedGroup(group)
    setCurrentView('group-detail')
  }, [])

  const handleBackToGroups = useCallback(() => {
    setCurrentView('groups')
    setSelectedGroup(null)
    setSelectedUsers(new Set())
  }, [])

  // Actualizar cliente
  const handleUpdateClient = useCallback(async (groupId, clientId, clientData) => {
    try {
      const response = await fetch(`${GROUPS_API_URL}/${groupId}/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Mostrar log de éxito
      if (window.addActivityLog) {
        window.addActivityLog(`✅ Cliente "${clientData.name}" actualizado exitosamente`, 'success', 6000)
      }

      toast({
        title: "✅ Cliente actualizado",
        description: `El cliente "${clientData.name}" se actualizó correctamente.`,
      })

      // Refresh groups to show updated data
      setTimeout(() => {
        fetchGroups()
      }, 500)

      return result
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "❌ Error",
        description: `No se pudo actualizar el cliente: ${error.message}`,
        variant: "destructive",
      })
      throw error
    }
  }, [fetchGroups, toast])

  // Función para preparar agente
  const prepareAgent = useCallback(async (groupId) => {
    if (!groupId) {
      toast({
        title: "❌ Error",
        description: "ID de grupo no válido.",
        variant: "destructive",
      })
      return
    }

    // Obtener el ID del usuario logueado
    const userId = authService.getClientId()
    if (!userId) {
      toast({
        title: "❌ Error",
        description: "No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    setIsPreparingAgent(true)

    try {
      const response = await fetch(`${GROUPS_API_URL}/${groupId}/prepare-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
      })

      const result = await response.json()

      if (result.success) {
        // Marcar el agente como preparado para este grupo
        setAgentPreparationStatus(prev => new Map(prev.set(groupId, true)))

        // Mostrar log de éxito
        if (window.addActivityLog) {
          window.addActivityLog(`✅ ${result.message}`, 'success', 8000)
        }

        toast({
          title: "✅ Agente preparado",
          description: result.message,
        })
      } else {
        // Mostrar log de error
        if (window.addActivityLog) {
          window.addActivityLog(`❌ ${result.message}`, 'error', 8000)
        }

        toast({
          title: "❌ Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error preparing agent:', error)

      // Mostrar log de error
      if (window.addActivityLog) {
        window.addActivityLog('❌ Error de conexión al preparar agente', 'error', 8000)
      }

      toast({
        title: "❌ Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    } finally {
      setIsPreparingAgent(false)
    }
  }, [toast])

  // Función para verificar si el agente está preparado
  const isAgentPrepared = useCallback((groupId) => {
    return agentPreparationStatus.get(groupId) || false
  }, [agentPreparationStatus])

  // Función para limpiar batchId cuando se complete
  const clearBatchId = useCallback(() => {
    setCurrentBatchId(null);
  }, [])

  // Función para iniciar llamadas de grupo
  const startGroupCall = useCallback(async (groupId) => {
    // Obtener el ID del usuario logueado
    const userId = authService.getClientId()
    if (!userId) {
      toast({
        title: "❌ Error",
        description: "No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    // Phone number ID quemado como especificaste
    const phoneNumberId = "phnum_4301k3d047vdfq682hvy29kr5r2g"

    try {
      const response = await fetch(`${GROUPS_API_URL}/${groupId}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          agentPhoneNumberId: phoneNumberId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Mostrar log de éxito
        if (window.addActivityLog) {
          window.addActivityLog(`✅ ${result.message}`, 'success', 8000)
        }

        toast({
          title: "✅ Llamadas iniciadas",
          description: result.message,
        })

        // Guardar el batchId para el monitor
        if (result.data?.batchId) {
          setCurrentBatchId(result.data.batchId);
          console.log('Batch iniciado:', result.data.batchId);
        }
      } else {
        // Mostrar log de error
        if (window.addActivityLog) {
          window.addActivityLog(`❌ ${result.message}`, 'error', 8000)
        }

        toast({
          title: "❌ Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error starting group call:', error)

      // Mostrar log de error
      if (window.addActivityLog) {
        window.addActivityLog('❌ Error de conexión al iniciar llamadas de grupo', 'error', 8000)
      }

      toast({
        title: "❌ Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Eliminar cliente
  const handleDeleteClient = useCallback(async (groupId, clientId) => {
    try {
      const response = await fetch(`${GROUPS_API_URL}/${groupId}/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      // Mostrar log de éxito
      if (window.addActivityLog) {
        window.addActivityLog('✅ Cliente eliminado exitosamente', 'success', 6000)
      }

      toast({
        title: "✅ Cliente eliminado",
        description: "El cliente se eliminó correctamente.",
      })

      // Refresh groups to show updated data
      setTimeout(() => {
        fetchGroups()
      }, 500)

    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: "❌ Error",
        description: `No se pudo eliminar el cliente: ${error.message}`,
        variant: "destructive",
      })
      throw error
    }
  }, [fetchGroups, toast])

  const handleExportReport = useCallback(() => {
    try {
      const csvData = []

      const headers = [
        "ID",
        "Nombre",
        "Telefono",
        "Email",
        "Categoria",
        "Direccion",
        "Sitio Web",
        "Grupo",
        "Estado Llamada",
        "ID Llamada",
        "Ultima Actualizacion"
      ]
      csvData.push(headers)

      allUsers.forEach((user) => {
        const status = callStatuses.get(user.id)
        const row = [
          user.id || "N/A",
          user.name || "N/A",
          user.phone || "N/A",
          user.email || "N/A",
          user.category || "N/A",
          user.address || "N/A",
          user.website || "N/A",
          user.groupName || "N/A",
          status ? status.status : "No Llamado",
          status?.callId || "N/A",
          status ? status.timestamp.toLocaleString() : "N/A"
        ]
        csvData.push(row)
      })

      const csvContent = csvData
        .map(row =>
          row.map(field => {
            const escapedField = String(field).replace(/"/g, '""')
            return `"${escapedField}"`
          }).join(';')
        )
        .join('\n')

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;'
      })

      const now = new Date()
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `reporte_llamadas_${timestamp}.csv`

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "📄 Reporte Exportado",
        description: `El reporte se ha descargado como ${filename}`,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: "❌ Error en exportación",
        description: "No se pudo generar el reporte CSV.",
        variant: "destructive",
      })
    }
  }, [allUsers, callStatuses, toast])

  const handleExportGroupReport = useCallback((group) => {
    try {
      const csvData = []

      const headers = [
        "ID",
        "Nombre",
        "Telefono",
        "Email",
        "Categoria",
        "Direccion",
        "Sitio Web",
        "Estado Llamada",
        "ID Llamada",
        "Ultima Actualizacion"
      ]
      csvData.push(headers)

      // Filtrar usuarios del grupo específico
      const groupUsers = allUsers.filter(user => user.groupId === group.id)

      groupUsers.forEach((user) => {
        const status = callStatuses.get(user.id)
        const row = [
          user.id || "N/A",
          user.name || "N/A",
          user.phone || "N/A",
          user.email || "N/A",
          user.category || "N/A",
          user.address || "N/A",
          user.website || "N/A",
          status ? status.status : "No Llamado",
          status?.callId || "N/A",
          status ? status.timestamp.toLocaleString() : "N/A"
        ]
        csvData.push(row)
      })

      const csvContent = csvData
        .map(row =>
          row.map(field => {
            const escapedField = String(field).replace(/"/g, '""')
            return `"${escapedField}"`
          }).join(';')
        )
        .join('\n')

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;'
      })

      const now = new Date()
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `reporte_${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "📄 Reporte Exportado",
        description: `Reporte del grupo "${group.name}" descargado como ${filename}`,
      })
    } catch (error) {
      console.error('Error exporting group CSV:', error)
      toast({
        title: "❌ Error en exportación",
        description: "No se pudo generar el reporte del grupo.",
        variant: "destructive",
      })
    }
  }, [allUsers, callStatuses, toast])
  // Filtrar grupos por búsqueda
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups

    return groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [groups, searchTerm])

  const uniqueCategories = useMemo(() => {
    const categories = new Set()
    allUsers.forEach((user) => {
      if (user.category) categories.add(user.category)
    })
    return ["all", ...Array.from(categories)]
  }, [allUsers])

  const possibleCallStatuses = useMemo(() => {
    return [
      "all",
      "pending",
      "initiated",
      "ringing",
      "in-progress",
      "answered",
      "completed",
      "failed",
      "no-answer",
      "canceled",
      "busy",
    ]
  }, [])

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-screen w-full overflow-hidden">
      <div className="p-6 w-full h-full flex flex-col">

        <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>



        {/* Vista de Grupos */}
        {currentView === 'groups' && (
          <div className="w-full flex-1 flex flex-col">
            {/* Header de Grupos - Estático */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full flex-shrink-0">
              <div className="p-8 w-full">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Grupos de Clientes</h1>
                    <p className="text-gray-600">Gestiona y organiza tus campañas de llamadas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Buscador */}
                    <div className="mb-6">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Buscar grupos por nombre o descripción..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {searchTerm && (
                        <p className="text-sm text-gray-600 mt-2">
                          {filteredGroups.length} grupo{filteredGroups.length !== 1 ? 's' : ''} encontrado{filteredGroups.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="border-gray-300 px-4 py-2"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      Actualizar
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingGroup(null)
                        setGroupForm({ name: '', description: '', prompt: '', color: '#3B82F6', favorite: false })
                        setIsGroupDialogOpen(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Crear Grupo
                    </Button>
                  </div>
                </div>


                {/* Contenedor con Scroll Interno */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {/* Opción "Todos los grupos" */}
                    <Card
                      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 border-gray-100 hover:border-blue-200"
                      onClick={() => handleGroupSelect(null)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">Todos los Grupos</h3>
                            <p className="text-sm text-gray-500">Vista general</p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">Ver todos los clientes de todos los grupos en una vista unificada</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExportReport()
                              }}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-1 text-xs font-medium"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Ver detalles →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Grupos existentes */}
                    {filteredGroups.map((group) => (
                      <Card
                        key={group.id}
                        className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 border-gray-100 hover:border-blue-200"
                        onClick={() => handleGroupSelect(group)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: group.color }}
                              >
                                <FolderOpen className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
                                <p className="text-sm text-gray-500">{group.clients ? group.clients.length : 0} clientes</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingGroup(group)
                                  setGroupForm({
                                    name: group.name,
                                    description: group.description,
                                    prompt: group.prompt || '',
                                    color: group.color,
                                    favorite: group.favorite || false
                                  })
                                  setIsGroupDialogOpen(true)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirmDialog({
                                    open: true,
                                    groupId: group.id,
                                    groupName: group.name
                                  })
                                }}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  prepareAgent(group.id)
                                }}
                                disabled={isPreparingAgent || isAgentPrepared(group.id)}
                                className={`${isAgentPrepared(group.id)
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                  } rounded-lg px-3 py-1 text-xs font-medium`}
                              >
                                {isPreparingAgent ? (
                                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                ) : isAgentPrepared(group.id) ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Zap className="h-3 w-3 mr-1" />
                                )}
                                {isAgentPrepared(group.id) ? 'Preparado' : 'Preparar'}
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCallGroup(group)
                                }}
                                disabled={isCallingState || !group.clients || group.clients.length === 0 || !isAgentPrepared(group.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 text-xs font-medium"
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                Llamar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleExportGroupReport(group)
                                }}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-1 text-xs font-medium"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Exportar
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Ver detalles →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <GroupModal
              isOpen={isGroupDialogOpen}
              onClose={() => {
                setIsGroupDialogOpen(false)
                setEditingGroup(null)
                setGroupForm({ name: '', description: '', prompt: '', color: '#3B82F6', favorite: false })
              }}
              onSave={async (formData) => {
                setGroupForm(formData)
                await saveGroup(formData)
              }}
              editingGroup={editingGroup}
              groupForm={groupForm}
              setGroupForm={setGroupForm}
            />
          </div>
        )}

        {/* Vista de Detalle del Grupo */}
        {currentView === 'group-detail' && selectedGroup && (
          <div className="space-y-6">
            {/* Header del Grupo */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleBackToGroups}
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Volver
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{selectedGroup.name}</h1>
                      <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                    </div>
                  </div>

                  {/* Estadísticas Rápidas */}
                  <div className="flex gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Total Llamadas</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {filteredUsers.length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Exitosas</p>
                          <p className="text-2xl font-bold text-green-900">
                            {Array.from(callStatuses.values()).filter(s => s.status === "completed").length}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm text-red-600 font-medium">Fallidas</p>
                          <p className="text-2xl font-bold text-red-900">
                            {Array.from(callStatuses.values()).filter(s => s.status === "failed").length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controles de Acción */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={isAgentPrepared(selectedGroup.id) ?
                      () => startGroupCall(selectedGroup.id) :
                      () => prepareAgent(selectedGroup.id)
                    }
                    disabled={isCallingState || isPreparingAgent}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm"
                  >
                    {isCallingState ? (
                      <>
                        <Square className="h-5 w-5 mr-2" />
                        Llamando...
                      </>
                    ) : isAgentPrepared(selectedGroup.id) ? (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Llamar Grupo
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Preparar Agente
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setIsTestCallModalOpen(true)}
                    disabled={isCallingState}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-sm"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Probar Llamada
                  </Button>

                  {isCallingState && (
                    <Button
                      onClick={handleStopCalls}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg shadow-sm"
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Detener Llamadas
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de Usuarios */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Clientes del Grupo</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSelectAll}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Seleccionar Todos
                    </Button>
                    <Button
                      onClick={handleDeselectAll}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Deseleccionar
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Nombre</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Teléfono</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Estado</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const status = callStatuses.get(user.id)
                        return (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.has(user.id)}
                                  onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-gray-900">{user.phone}</p>
                            </td>
                            <td className="py-4 px-6">
                              {status ? (
                                <Badge
                                  variant="secondary"
                                  className={
                                    status.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : status.status === 'failed'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                  }
                                >
                                  {status.status === 'completed' ? 'Completado' :
                                    status.status === 'failed' ? 'Fallido' :
                                      status.status === 'pending' ? 'Pendiente' :
                                        status.status === 'initiated' ? 'Iniciada' :
                                          status.status}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                  No Llamado
                                </Badge>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Lógica para editar cliente
                                  }}
                                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Lógica para eliminar cliente
                                  }}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Eliminar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => makeCall(user)}
                                  disabled={isCallingState}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  Llamar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <strong>Error de conexión:</strong> {error}
            </div>
          </div>
        )}



        {/* Contenido Principal - Solo visible en vista de detalle */}
        {currentView === 'group-detail' && (
          <Tabs defaultValue="monitor" className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg max-w-md">
                  <TabsTrigger
                    value="monitor"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Monitor de Llamadas
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Documentos
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monitor" className="p-6">
                <CallMonitor
                  users={filteredUsers}
                  callStatuses={callStatuses}
                  totalUsers={filteredUsers.length}
                  groupId={selectedGroup?.id}
                />
              </TabsContent>

              <TabsContent value="documents" className="p-6">
                <GroupDocuments />
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* Modal de Confirmación para Eliminar Grupo */}
        <DeleteGroupModal
          isOpen={deleteConfirmDialog.open}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          groupName={deleteConfirmDialog.groupName}
          isLoading={isDeletingGroup}
        />

        {/* Modal de Prueba de Llamada */}
        <TestCallModal
          isOpen={isTestCallModalOpen}
          onClose={() => setIsTestCallModalOpen(false)}
          onStartCall={handleTestCall}
        />

        {/* Componente de Logs de Actividad */}
        <ActivityLog />
      </div>
    </div>
  )
}
