"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { Phone, Users, Play, Square, RefreshCw, Zap, Target, Download } from "lucide-react"
import { Button } from "./components/ui/button.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs.tsx"
import { UserList } from "./components/user-list.jsx"
import { CallMonitor } from "./components/call-monitor.jsx"
import { Pagination } from "./components/pagination.jsx"
import { StatsCards } from "./components/stats-cards.jsx"
import { useToast } from "./use-toast.ts"
const EXTERNAL_OUTBOUND_CALL_API_URL = "https://twilio-call-754698887417.us-central1.run.app/outbound-call"
const EXTERNAL_CLIENTS_API_URL = "http://localhost:5000/clients/pending"

// URLs de los proxies internos
const OUTBOUND_CALL_PROXY_API_URL = "http://localhost:5000/calls/outbound"
const CLIENTS_PROXY_API_URL = "/api/clients/pending"

export default function CallDashboard() {
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [callStatuses, setCallStatuses] = useState(new Map())
  const [isCallingState, setIsCallingState] = useState(false)
  const stopCallingRef = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 5,
  })

  // Estados para los filtros avanzados
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterCallStatus, setFilterCallStatus] = useState("all")

  const { toast } = useToast()

  const fetchUsers = useCallback(
    async (page = 1, limit = 5) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`${EXTERNAL_CLIENTS_API_URL}?page=1&limit=5`)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data = await response.json()

        const transformedUsers =
          data.clients?.map((client) => ({
            id: client._id || `user-${Date.now()}-${Math.random()}`,
            name: client.name || "Sin nombre",
            phone: client.phone || "",
            review: client.review,
            category: client.category,
            address: client.adress,
            website: client.web,
            email: client.mail,
            latitude: client.latitude ? Number.parseFloat(client.latitude) : undefined,
            longitude: client.length ? Number.parseFloat(client.length) : undefined,
            location: client.ubication,
            state: client.state,
            totalCalls: client.total_calls || 0,
          })) || []

        const totalPages = Math.ceil((data.total || 0) / (data.size || limit))

        setUsers(transformedUsers)
        setPagination({
          currentPage: data.page || page,
          totalPages,
          totalUsers: data.total || 0,
          limit: data.size || limit,
        })

        toast({
          title: "✅ Usuarios cargados",
          description: `Se cargaron ${transformedUsers.length} usuarios de la página ${page}.`,
        })
      } catch (error) {
        console.error("Error fetching users:", error)
        setError(`No se pudieron cargar los usuarios: ${error.message || "Error desconocido"}`)
        toast({
          title: "❌ Error al cargar usuarios",
          description: "Verifica la conexión con la API de usuarios o el proxy.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const fetchAllUsers = useCallback(async () => {
    const allUsers = []
    let currentPage = 1
    let totalPages = 1

    try {
      do {
        const response = await fetch(`${CLIENTS_PROXY_API_URL}?page=${currentPage}&size=100`)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data = await response.json()

        const transformedUsers =
          data.clients?.map((client) => ({
            id: client._id || `user-${Date.now()}-${Math.random()}`,
            name: client.name || "Sin nombre",
            phone: client.phone || "",
            review: client.review,
            category: client.category,
            address: client.adress,
            website: client.web,
            email: client.mail,
            latitude: client.latitude ? Number.parseFloat(client.latitude) : undefined,
            longitude: client.length ? Number.parseFloat(client.length) : undefined,
            location: client.ubication,
            state: client.state,
            totalCalls: client.total_calls || 0,
          })) || []

        allUsers.push(...transformedUsers)
        totalPages = Math.ceil((data.total || 0) / (data.size || 100))
        currentPage++
      } while (currentPage <= totalPages)

      return allUsers
    } catch (error) {
      console.error("Error fetching all users:", error)
      throw error
    }
  }, [])

  useEffect(() => {
    fetchUsers(1, 5)
  }, [fetchUsers])

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
    setSelectedUsers(new Set(users.map((user) => user.id)))
  }, [users])

  const handleDeselectAll = useCallback(() => {
    setSelectedUsers(new Set())
  }, [])

  const handlePageChange = useCallback(
    (page) => {
      fetchUsers(page, pagination.limit)
      setSelectedUsers(new Set()) // Limpiar selección al cambiar página
    },
    [fetchUsers, pagination.limit],
  )

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
        console.log(`[makeCall] Call status for ${user.name} set to pending.`)

        const response = await fetch(OUTBOUND_CALL_PROXY_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: user.phone,
          }),
        })

        console.log(`[makeCall] Fetch response received for ${user.name}. Status: ${response.status}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(
            `[makeCall] API call failed for ${user.name}. Status: ${response.status}, Message: ${errorText}`,
          )
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const result = await response.json()
        console.log(`[makeCall] API call successful for ${user.name}. Result:`, result)

        if (result.sucess === true && result.callSid) {
          const callId = result.callSid
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
                  status: "initiated", // La llamada se inició correctamente
                  timestamp: new Date(),
                }),
              ),
          )
          console.log(`[makeCall] Call status for ${user.name} set to initiated with SID: ${callId}.`)
        } else {
          // API respondió OK, pero Success es false o falta Call-sid
          const errorMessage = result.Message || "La API indicó un fallo en la llamada."
          console.error(`[makeCall] API call failed for ${user.name}. Reason: ${errorMessage}`)
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
            description: `No se pudo llamar a ${user.name}: ${errorMessage}`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[makeCall] Caught error in makeCall:", error)
        setCallStatuses(
          (prev) =>
            new Map(
              prev.set(user.id, {
                userId: user.id,
                status: "failed", // La llamada falló
                timestamp: new Date(),
              }),
            ),
        )

        toast({
          title: "❌ Error en llamada",
          description: `No se pudo llamar a ${user.name}: ${error.message || "Error desconocido"}`,
          variant: "destructive",
        })
      }
    },
    [setCallStatuses, toast],
  )

  const handleCallSelected = useCallback(async () => {
    console.log("[handleCallSelected] Triggered.")
    if (selectedUsers.size === 0) {
      toast({
        title: "⚠️ Sin selección",
        description: "Por favor selecciona al menos un usuario para llamar.",
        variant: "destructive",
      })
      return
    }

    setIsCallingState(true) // Activar estado de UI
    stopCallingRef.current = false // Asegurar que el bucle no se detenga
    const selectedUsersList = users.filter((user) => selectedUsers.has(user.id))

    toast({
      title: "🚀 Iniciando llamadas",
      description: `Iniciando ${selectedUsersList.length} llamadas...`,
    })

    for (let i = 0; i < selectedUsersList.length; i++) {
      if (stopCallingRef.current) {
        console.log("[handleCallSelected] Call process stopped by user or state change (ref).")
        break
      }
      console.log(`[handleCallSelected] Calling makeCall for user ${selectedUsersList[i].name} (index ${i}).`)
      await makeCall(selectedUsersList[i])
      if (i < selectedUsersList.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setIsCallingState(false) // Desactivar estado de UI
    console.log("[handleCallSelected] Finished.")
  }, [selectedUsers, users, makeCall, toast])

  const handleCallAll = useCallback(async () => {
    console.log("[handleCallAll] Triggered.")
    setIsCallingState(true) // Activar estado de UI
    stopCallingRef.current = false // Asegurar que el bucle no se detenga

    try {
      toast({
        title: "📊 Cargando todos los usuarios",
        description: "Obteniendo usuarios de todas las páginas...",
      })

      const allUsers = await fetchAllUsers()
      console.log(`[handleCallAll] Fetched ${allUsers.length} users for call all.`)

      if (allUsers.length === 0) {
        toast({
          title: "⚠️ Sin usuarios",
          description: "No hay usuarios disponibles para llamar.",
          variant: "destructive",
        })
        setIsCallingState(false) // Desactivar estado de UI
        return
      }

      toast({
        title: "🎯 Iniciando llamadas masivas",
        description: `Iniciando ${allUsers.length} llamadas a todos los usuarios...`,
      })

      for (let i = 0; i < allUsers.length; i++) {
        if (stopCallingRef.current) {
          console.log("[handleCallAll] Call process stopped by user or state change (ref).")
          break
        }
        console.log(`[handleCallAll] Calling makeCall for user ${allUsers[i].name} (index ${i}).`)
        await makeCall(allUsers[i])
        if (i < allUsers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    } catch (error) {
      console.error("[handleCallAll] Error in handleCallAll:", error)
      toast({
        title: "❌ Error al obtener usuarios",
        description: "No se pudieron cargar todos los usuarios para llamar.",
        variant: "destructive",
      })
    } finally {
      setIsCallingState(false) // Desactivar estado de UI
      console.log("[handleCallAll] Finished.")
    }
  }, [fetchAllUsers, makeCall, toast])

  const handleStopCalls = useCallback(() => {
    console.log("[handleStopCalls] Triggered. Setting stopCallingRef.current to true.")
    stopCallingRef.current = true // Indicar al bucle que se detenga
    setIsCallingState(false) // Actualizar UI
    toast({
      title: "⏹️ Llamadas detenidas",
      description: "Se ha detenido el proceso de llamadas.",
    })
  }, [toast])

  const handleRefresh = useCallback(() => {
    fetchUsers(pagination.currentPage, pagination.limit)
  }, [fetchUsers, pagination.currentPage, pagination.limit])

  const handleExportReport = useCallback(() => {
    const headers = ["ID", "Nombre", "Teléfono", "Categoría", "Estado Llamada", "ID Llamada", "Última Actualización"]
    const rows = users.map((user) => {
      const status = callStatuses.get(user.id)
      return [
        user.id,
        user.name,
        user.phone,
        user.category || "N/A",
        status ? status.status : "No Llamado",
        status?.callId || "N/A",
        status ? status.timestamp.toLocaleString() : "N/A",
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",") // Escape commas and quotes
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "reporte_llamadas.csv")
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "📄 Reporte Exportado",
      description: "El reporte de llamadas se ha descargado como CSV.",
    })
  }, [users, callStatuses, toast])

  // Obtener categorías únicas para el filtro
  const uniqueCategories = useMemo(() => {
    const categories = new Set()
    users.forEach((user) => {
      if (user.category) categories.add(user.category)
    })
    return ["all", ...Array.from(categories)]
  }, [users])

  // Estados de llamada posibles para el filtro
  const possibleCallStatuses = useMemo(() => {
    return ["all", "pending", "initiated", "failed", "completed", "busy", "no-answer"]
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header limpio y minimalista */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
                <Phone className="h-6 w-6 text-blue-600" />
                Gestión de Llamadas Twilio
              </h1>
              <p className="text-gray-600">Gestiona y realiza llamadas masivas con Twilio</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{pagination.totalUsers}</div>
                <div className="text-sm text-gray-500">Usuarios Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedUsers.size}</div>
                <div className="text-sm text-gray-500">Seleccionados</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-gray-300"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Botones de acción con diseño limpio */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleCallSelected}
            disabled={isCallingState || selectedUsers.size === 0}
            size="lg"
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

          <Button
            onClick={handleCallAll}
            disabled={isCallingState || pagination.totalUsers === 0}
            size="lg"
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {isCallingState ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Llamando Todos...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Llamar Todos ({pagination.totalUsers})
              </>
            )}
          </Button>

          {isCallingState && (
            <Button
              onClick={handleStopCalls}
              size="lg"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="h-4 w-4 mr-2" />
              Detener Llamadas
            </Button>
          )}

          <Button
            onClick={handleExportReport}
            disabled={users.length === 0 && callStatuses.size === 0}
            size="lg"
            variant="outline"
            className="border-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
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

        {/* Stats Cards */}
        <StatsCards
          totalUsers={pagination.totalUsers}
          selectedUsers={selectedUsers.size}
          callStatuses={callStatuses}
          isCallInProgress={isCallingState}
        />

        {/* Tabs con diseño limpio */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
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

          <TabsContent value="users" className="space-y-6">
            <UserList
              users={users}
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

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalUsers={pagination.totalUsers}
              onPageChange={handlePageChange}
              disabled={isLoading}
            />
          </TabsContent>

          <TabsContent value="monitor">
            <CallMonitor users={users} callStatuses={callStatuses} totalUsers={pagination.totalUsers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
