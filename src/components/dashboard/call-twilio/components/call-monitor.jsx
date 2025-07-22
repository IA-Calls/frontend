"use client"

import { useMemo } from "react"
import { Phone, Clock, CheckCircle, XCircle, AlertCircle, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Progress } from "./ui/progress.tsx"
import { Badge } from "./ui/badge.tsx"
import { ScrollArea } from "./ui/scroll-area.tsx"
// import type { User, CallStatus } from "@/app/page" // No longer needed for types

// Interface definitions are now implicit or handled by JSDoc if desired
// interface CallMonitorProps {
//   users: User[]
//   callStatuses: Map<string, CallStatus>
//   totalUsers?: number
// }

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
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
      case "no-answer":
      case "busy":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "initiated":
        return <Phone className="h-4 w-4 text-blue-500 animate-pulse" />
      default: // pending
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "initiated":
        return "bg-blue-500"
      case "completed":
        return "bg-green-600"
      case "failed":
        return "bg-red-500"
      case "busy":
        return "bg-orange-500"
      case "no-answer":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Llamadas Realizadas</p>
                <p className="text-2xl font-bold">{stats.called}</p>
              </div>
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fallidas</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progreso */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Llamadas realizadas</span>
              <span>
                {stats.called} de {stats.total}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{progressPercentage.toFixed(1)}% completado</p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de llamadas recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {recentCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Phone className="h-12 w-12 mb-4" />
                <p>No hay actividad de llamadas aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCalls.map(({ user, status }) => (
                  <div
                    key={`${user?.id}-${status.timestamp.getTime()}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status.status)}
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="secondary" className={`${getStatusColor(status.status)} text-white mb-1`}>
                        {getStatusText(status.status)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{status.timestamp.toLocaleTimeString()}</p>
                      {status.callId && <p className="text-xs text-muted-foreground">ID: {status.callId.slice(-8)}</p>}
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
