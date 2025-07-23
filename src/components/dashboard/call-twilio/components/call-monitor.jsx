"use client"

import { useMemo } from "react"
import { Phone, Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Progress } from "./ui/progress.tsx"
import { Badge } from "./ui/badge.tsx"
import { ScrollArea } from "./ui/scroll-area.tsx"

export function CallMonitor({ users, callStatuses, totalUsers = 0 }) {
  const stats = useMemo(() => {
    const total = totalUsers || users.length
    const called = callStatuses.size
    const completed = Array.from(callStatuses.values()).filter((s) => s.status === "completed").length
    const failed = Array.from(callStatuses.values()).filter((s) => s.status === "failed").length
    // "Iniciada" se considera en progreso hasta que haya un estado final
    const inProgress = Array.from(callStatuses.values()).filter(
      (s) => s.status === "pending" || s.status === "initiated",
    ).length

    return { total, called, completed, failed, inProgress }
  }, [totalUsers, users.length, callStatuses])

  const recentCalls = useMemo(() => {
    return Array.from(callStatuses.entries())
      .map(([userId, status]) => ({
        user: users.find((u) => u.id === userId),
        status,
      }))
      .filter((item) => item.user)
      .sort((a, b) => b.status.timestamp.getTime() - a.status.timestamp.getTime())
      .slice(0, 20)
  }, [users, callStatuses])

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
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Llamadas Realizadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.called}</p>
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
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
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
                <p className="text-sm font-medium text-gray-600">Fallidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progreso */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Progreso General</CardTitle>
        </CardHeader>
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
                {recentCalls.map(({ user, status }) => (
                  <div
                    key={`${user?.id}-${status.timestamp.getTime()}`}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status.status)}
                      <div>
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="secondary" className={`${getStatusColor(status.status)} mb-1`}>
                        {getStatusText(status.status)}
                      </Badge>
                      <p className="text-xs text-gray-500">{status.timestamp.toLocaleTimeString()}</p>
                      {status.callId && <p className="text-xs text-gray-500">ID: {status.callId.slice(-8)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
