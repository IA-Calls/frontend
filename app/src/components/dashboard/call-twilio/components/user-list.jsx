"use client"

import { useState, useMemo, useEffect } from "react"
import { Phone, Mail, MapPin, Globe, Search, RefreshCw, UserIcon, Star, Building } from "lucide-react"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Checkbox } from "./ui/checkbox.tsx"
import { Input } from "./ui/input.tsx"
import { Badge } from "./ui/badge.tsx"
import { ScrollArea } from "./ui/scroll-area.tsx"
import { Avatar, AvatarFallback } from "./ui/avatar.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
// import type { User, CallStatus } from "@/app/page" // No longer needed for types

// interface UserListProps {
//   users: User[]
//   selectedUsers: Set<string>
//   callStatuses: Map<string, CallStatus>
//   onUserSelection: (userId: string, selected: boolean) => void
//   onSelectAll: () => void
//   onDeselectAll: () => void
//   isLoading?: boolean
//   filterCategory: string
//   setFilterCategory: (category: string) => void
//   filterCallStatus: string
//   setFilterCallStatus: (status: string) => void
//   uniqueCategories: string[]
//   possibleCallStatuses: string[]
// }

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-gradient-to-r from-yellow-400 to-yellow-500"
    case "initiated":
      return "bg-gradient-to-r from-blue-400 to-blue-500"
    case "completed":
      return "bg-gradient-to-r from-emerald-500 to-green-600"
    case "failed":
      return "bg-gradient-to-r from-red-400 to-red-500"
    case "busy":
      return "bg-gradient-to-r from-orange-400 to-orange-500"
    case "no-answer":
      return "bg-gradient-to-r from-gray-400 to-gray-500"
    default:
      return "bg-gradient-to-r from-gray-300 to-gray-400"
  }
}

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "⏳ Pendiente"
    case "initiated":
      return "🚀 Iniciada"
    case "completed":
      return "✅ Completada"
    case "failed":
      return "❌ Falló"
    case "busy":
      return "📵 Ocupado"
    case "no-answer":
      return "🔇 Sin respuesta"
    default:
      return "❓ Desconocido"
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
    }, 300) // 300ms debounce

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
        user.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesCategory = filterCategory === "all" || user.category === filterCategory

      const userCallStatus = callStatuses.get(user.id)?.status || "No Llamado"
      const matchesCallStatus = filterCallStatus === "all" || userCallStatus === filterCallStatus

      return matchesSearch && matchesCategory && matchesCallStatus
    })
  }, [users, debouncedSearchTerm, filterCategory, filterCallStatus, callStatuses])

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cargando usuarios...
          </h3>
          <p className="text-gray-600 text-center">Obteniendo datos desde la API</p>
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <Phone className="h-16 w-16 text-gray-400" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-700">No hay usuarios disponibles</h3>
          <p className="text-gray-500 text-center">No se encontraron usuarios en esta página</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <UserIcon className="h-6 w-6" />
            Lista de Usuarios ({filteredUsers.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSelectAll}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Seleccionar Todos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDeselectAll}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Deseleccionar Todos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
            <Input
              placeholder="Buscar usuarios..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              disabled={isLoading}
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory} disabled={isLoading}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white [&>span]:text-white placeholder:text-white/70">
              <SelectValue placeholder="Filtrar por Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCallStatus} onValueChange={setFilterCallStatus} disabled={isLoading}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white [&>span]:text-white placeholder:text-white/70">
              <SelectValue placeholder="Filtrar por Estado de Llamada" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Todos los Estados</SelectItem>
              {possibleCallStatuses.slice(1).map(
                (
                  status, // Skip "all" from possibleCallStatuses
                ) => (
                  <SelectItem key={status} value={status}>
                    {getStatusText(status).replace(/^[^\s]+\s/, "")} {/* Remove emoji */}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6 space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
                <p className="text-center">Ajusta tus filtros o tu búsqueda.</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const callStatus = callStatuses.get(user.id)
                const isSelected = selectedUsers.has(user.id)

                return (
                  <div
                    key={user.id}
                    className={`relative p-6 border-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg"
                        : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {/* Decorative corner */}
                    <div
                      className={`absolute top-0 right-0 w-16 h-16 ${isSelected ? "bg-blue-100" : "bg-gray-50"} rounded-bl-full opacity-50`}
                    ></div>

                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onUserSelection(user.id, checked)}
                        className="mt-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        disabled={isLoading}
                      />

                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
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
                            <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              {user.name}
                              {user.totalCalls && user.totalCalls > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {user.totalCalls} llamadas
                                </Badge>
                              )}
                            </h4>
                            {user.category && (
                              <Badge className={`mt-1 ${getCategoryColor(user.category)}`}>
                                <Building className="h-3 w-3 mr-1" />
                                {user.category}
                              </Badge>
                            )}
                          </div>
                          {callStatus && (
                            <Badge
                              className={`${getStatusColor(callStatus.status)} text-white shadow-lg animate-pulse`}
                            >
                              {getStatusText(callStatus.status)}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{user.phone}</span>
                          </div>

                          {user.email && (
                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <span className="font-medium truncate">{user.email}</span>
                            </div>
                          )}

                          {user.address && (
                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                              <MapPin className="h-4 w-4 text-red-500" />
                              <span className="font-medium truncate">{user.address}</span>
                            </div>
                          )}

                          {user.website && (
                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                              <Globe className="h-4 w-4 text-purple-500" />
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
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border-l-4 border-yellow-400">
                            <div className="flex items-start gap-2">
                              <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <p className="text-sm text-gray-700 italic font-medium">"{user.review}"</p>
                            </div>
                          </div>
                        )}

                        {callStatus && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between text-xs text-gray-500">
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
