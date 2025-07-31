"use client"

import { useState, useMemo, useEffect } from "react"
import { Phone, Mail, MapPin, Globe, Search, RefreshCw, UserIcon, Star, Building, FolderOpen } from "lucide-react"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Checkbox } from "./ui/checkbox.tsx"
import { Input } from "./ui/input.tsx"
import { Badge } from "./ui/badge.tsx"
import { ScrollArea } from "./ui/scroll-area.tsx"
import { Avatar, AvatarFallback } from "./ui/avatar.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"

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

const getCategoryColor = (category) => {
  if (!category) return "bg-gray-100 text-gray-800"

  const colors = {
    Cirujano: "bg-blue-100 text-blue-800",
    Doctor: "bg-green-100 text-green-800",
    Especialista: "bg-purple-100 text-purple-800",
    Cliente: "bg-orange-100 text-orange-800",
    Premium: "bg-yellow-100 text-yellow-800",
    General: "bg-gray-100 text-gray-800",
  }

  return colors[category] || "bg-gray-100 text-gray-800"
}

export function UserList({
  users,
  selectedUsers,
  callStatuses,
  onUserSelection,
  onSelectAll,
  onDeselectAll,
  isLoading = false,
  filterCategory,
  setFilterCategory,
  filterCallStatus,
  setFilterCallStatus,
  uniqueCategories,
  possibleCallStatuses,
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(localSearchTerm)
    }, 300)

    return () => {
      clearTimeout(timerId)
    }
  }, [localSearchTerm])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.phone.includes(debouncedSearchTerm) ||
        user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.groupName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesCategory = filterCategory === "all" || user.category === filterCategory

      const userCallStatus = callStatuses.get(user.id)?.status || "No Llamado"
      const matchesCallStatus = filterCallStatus === "all" || userCallStatus === filterCallStatus

      return matchesSearch && matchesCategory && matchesCallStatus
    })
  }, [users, debouncedSearchTerm, filterCategory, filterCallStatus, callStatuses])

  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando usuarios...
          </h3>
          <p className="text-gray-600 text-center">Obteniendo datos desde la API</p>
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay usuarios disponibles</h3>
          <p className="text-gray-500 text-center">No se encontraron usuarios en esta selección</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-blue-600" />
            Lista de Usuarios ({filteredUsers.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={isLoading}
              className="border-gray-300"
            >
              Seleccionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              disabled={isLoading}
              className="border-gray-300"
            >
              Deseleccionar Todos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuarios o grupos..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-10 border-gray-300"
              disabled={isLoading}
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory} disabled={isLoading}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Filtrar por Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {uniqueCategories.filter(cat => cat !== "all").map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCallStatus} onValueChange={setFilterCallStatus} disabled={isLoading}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Filtrar por Estado de Llamada" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Todos los Estados</SelectItem>
              {possibleCallStatuses.slice(1).map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusText(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6 space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-center">Ajusta tus filtros o tu búsqueda.</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const callStatus = callStatuses.get(user.id)
                const isSelected = selectedUsers.has(user.id)

                return (
                  <div
                    key={user.id}
                    className={`p-6 border rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onUserSelection(user.id, checked)}
                        className="mt-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        disabled={isLoading}
                      />

                      <Avatar className="h-12 w-12 border border-gray-200">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              {user.name}
                              {user.totalCalls && user.totalCalls > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {user.totalCalls} llamadas
                                </Badge>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {user.category && (
                                <Badge className={`${getCategoryColor(user.category)}`}>
                                  <Building className="h-3 w-3 mr-1" />
                                  {user.category}
                                </Badge>
                              )}
                              {user.groupName && (
                                <Badge 
                                  variant="outline"
                                  className="border-gray-300"
                                  style={{ 
                                    borderLeftColor: user.groupColor,
                                    borderLeftWidth: '3px'
                                  }}
                                >
                                  <FolderOpen className="h-3 w-3 mr-1" />
                                  {user.groupName}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {callStatus && (
                            <Badge
                              className={`${getStatusColor(callStatus.status)}`}
                            >
                              {getStatusText(callStatus.status)}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                            <Phone className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{user.phone}</span>
                          </div>

                          {user.email && (
                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span className="font-medium truncate">{user.email}</span>
                            </div>
                          )}

                          {user.address && (
                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <span className="font-medium truncate">{user.address}</span>
                            </div>
                          )}

                          {user.website && (
                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                              <Globe className="h-4 w-4 text-purple-600" />
                              <a
                                href={user.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium hover:text-purple-600 hover:underline truncate"
                              >
                                {user.website}
                              </a>
                            </div>
                          )}
                        </div>

                        {user.review && (
                          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                            <div className="flex items-start gap-2">
                              <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <p className="text-sm text-gray-700 italic">"{user.review}"</p>
                            </div>
                          </div>
                        )}

                        {callStatus && (
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Última actualización: {callStatus.timestamp.toLocaleTimeString()}</span>
                              {callStatus.callId && <span>ID: {callStatus.callId.slice(-8)}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
