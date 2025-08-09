"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { Phone, Users, Play, Square, RefreshCw, Zap, Target, Download, Search, Filter, Plus, Edit, Trash2, FolderOpen, UserPlus } from "lucide-react"
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
import { Badge } from "./components/ui/badge.tsx"
import { useToast } from "./use-toast.ts"
import config from "../../../config/environment.js"

// Usar configuración de entorno
const EXTERNAL_OUTBOUND_CALL_API_URL = config.TWILIO_CALL_URL
const CLIENTS_PENDING_API_URL = config.CLIENTS_PENDING_API_URL
const GROUPS_API_URL = config.GROUPS_API_URL
const EXTRACT_EXCEL_API_URL = config.EXTRACT_EXCEL_API_URL
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

  const { toast } = useToast()
  // Obtener todos los grupos desde clients/pending
  const fetchGroups = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${CLIENTS_PENDING_API_URL}`)

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
      setError(`No se pudieron cargar los grupos: ${error.message}`)
      toast({
        title: "❌ Error al cargar grupos",
        description: "Verifica la conexión con la API.",
        variant: "destructive",
      })
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
      
      // If file is provided and this is a new group, create group first then extract clients
      if (file && filename && !editingGroup) {
        try {
          console.log('Creating group first, then extracting clients from Excel')
          
          // Step 1: Create the group using the regular endpoint
          const createGroupResponse = await fetch(GROUPS_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(groupData),
          })

          if (!createGroupResponse.ok) {
            const errorData = await createGroupResponse.json().catch(() => ({}))
            throw new Error(errorData.message || `Error ${createGroupResponse.status}: ${createGroupResponse.statusText}`)
          }

          result = await createGroupResponse.json()
          console.log('Group created successfully:', result)
          
          // Step 2: Extract clients from Excel using the created group ID
          if (result.id) {
            console.log('Extracting clients for group ID:', result.id)
            
            // Convert base64 back to file for FormData
            const byteCharacters = atob(file)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const fileObject = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            
            // Create FormData for client extraction
            const formData = new FormData()
            formData.append("file", fileObject)
            formData.append("groupId", result.id.toString())
            
            const extractResponse = await fetch(EXTRACT_EXCEL_API_URL, {
              method: 'POST',
              body: formData,
            })

            console.log('Extract response status:', extractResponse.status)
            
            if (!extractResponse.ok) {
              const extractErrorData = await extractResponse.json().catch(() => ({}))
              console.error('File extraction failed:', extractErrorData)
              toast({
                title: "⚠️ Error al extraer clientes",
                description: `El grupo se creó correctamente, pero no se pudieron extraer los clientes: ${extractErrorData.message || `Error ${extractResponse.status}`}`,
                variant: "destructive",
              })
            } else {
              const extractResult = await extractResponse.json().catch(() => ({}))
              console.log('Extraction successful:', extractResult)
              
              if (extractResult.success) {
                const clientCount = extractResult.data?.successfullyProcessed || 0
                const totalExtracted = extractResult.data?.totalExtracted || 0
                const errors = extractResult.data?.processingErrors || 0
                
                let message = `El grupo "${groupData.name}" se creó correctamente.`
                
                if (clientCount > 0) {
                  message += ` Se procesaron ${clientCount} clientes exitosamente.`
                }
                
                if (errors > 0) {
                  message += ` ${errors} filas tuvieron errores.`
                }
                
                toast({
                  title: "✅ Grupo creado con clientes",
                  description: message,
                })
              } else {
                toast({
                  title: "⚠️ Error en la extracción",
                  description: extractResult.message || "Error desconocido al procesar el archivo",
                  variant: "destructive",
                })
              }
            }
          }
          
        } catch (error) {
          console.error('Error creating group or extracting clients:', error)
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

    setIsCallingState(true)
    stopCallingRef.current = false
    const usersToCall = selectedGroup 
      ? filteredUsers.filter((user) => selectedUsers.has(user.id))
      : allUsers.filter((user) => selectedUsers.has(user.id))
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
    toast({
      title: "⏹️ Llamadas detenidas",
      description: "Se ha detenido el proceso de llamadas.",
    })
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        
        {/* Header Principal */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Gestión de Llamadas por Grupos
                </h1>
                <p className="text-gray-600">
                  Organiza y gestiona llamadas masivas por grupos de clientes
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="border-gray-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button
                  onClick={handleExportReport}
                  disabled={allUsers.length === 0}
                  variant="outline"
                  size="sm"
                  className="border-gray-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>


          </div>
        </div>

        {/* Gestión de Grupos */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Grupos de Clientes</h2>
              <Button 
                                onClick={() => {
                  setEditingGroup(null)
                  setGroupForm({ name: '', description: '', prompt: '', color: '#3B82F6', favorite: false })
                  setIsGroupDialogOpen(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Grupo
              </Button>
              
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Opción "Todos los grupos" */}
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  !selectedGroup 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedGroup(null)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-400 rounded"></div>
                      <h3 className="font-semibold text-gray-900">Todos los Grupos</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Ver todos los clientes de todos los grupos</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {allUsers.length} clientes
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Grupos existentes */}
              {groups.map((group) => (
                <Card 
                  key={group.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedGroup?.id === group.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: group.color }}
                        ></div>
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
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
                        >
                          <Edit className="h-3 w-3" />
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                                         <div className="flex items-center justify-between">
                       <Badge variant="secondary">
                         {group.clients ? group.clients.length : 0} clientes
                       </Badge>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCallGroup(group)
                        }}
                                                 disabled={isCallingState || !group.clients || group.clients.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Llamar Grupo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Controles de Acción */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Controles de Llamadas
              {selectedGroup && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  - Grupo: {selectedGroup.name}
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleCallSelected}
                disabled={isCallingState || selectedUsers.size === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCallingState ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Llamando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Llamar Seleccionados ({selectedUsers.size})
                  </>
                )}
              </Button>

              {isCallingState && (
                <Button
                  onClick={handleStopCalls}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Detener Llamadas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <strong>Error de conexión:</strong> {error}
            </div>
          </div>
        )}

        {/* Stats Cards Detalladas */}
        <StatsCards
          totalUsers={selectedGroup ? filteredUsers.length : allUsers.length}
          selectedUsers={selectedUsers.size}
          callStatuses={callStatuses}
          isCallInProgress={isCallingState}
        />

        {/* Contenido Principal */}
        <Tabs defaultValue="users" className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg max-w-md">
                <TabsTrigger
                  value="users"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestión de Usuarios
                </TabsTrigger>
                <TabsTrigger
                  value="monitor"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Monitor de Llamadas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="users" className="p-6 space-y-6">
              <UserList
                users={selectedGroup ? filteredUsers : allUsers}
                selectedUsers={selectedUsers}
                callStatuses={callStatuses}
                onUserSelection={handleUserSelection}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                isLoading={isLoading}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterCallStatus={filterCallStatus}
                setFilterCallStatus={setFilterCallStatus}
                uniqueCategories={uniqueCategories}
                possibleCallStatuses={possibleCallStatuses}
              />
            </TabsContent>

            <TabsContent value="monitor" className="p-6">
              <CallMonitor 
                users={selectedGroup ? filteredUsers : allUsers} 
                callStatuses={callStatuses} 
                totalUsers={selectedGroup ? filteredUsers.length : allUsers.length} 
              />
            </TabsContent>
          </div>   
        </Tabs>

        {/* Modal de Confirmación para Eliminar Grupo */}
        <DeleteGroupModal
          isOpen={deleteConfirmDialog.open}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          groupName={deleteConfirmDialog.groupName}
          isLoading={isDeletingGroup}
        />
      </div>
    </div>
  )
}
