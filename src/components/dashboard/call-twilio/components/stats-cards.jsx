"use client"

import { useMemo } from "react"
import { Phone, Users, Target, Zap, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "./ui/card.tsx"

export function StatsCards({ totalUsers, selectedUsers, callStatuses, isCallInProgress }) {
  const stats = useMemo(() => {
    const called = callStatuses.size
    const completed = Array.from(callStatuses.values()).filter((s) => s.status === "completed").length
    const failed = Array.from(callStatuses.values()).filter((s) => s.status === "failed").length
    // "Iniciada" se considera en progreso hasta que haya un estado final
    const inProgress = Array.from(callStatuses.values()).filter(
      (s) => s.status === "pending" || s.status === "initiated",
    ).length

    const successRate = called > 0 ? (completed / called) * 100 : 0

    return { called, completed, failed, inProgress, successRate }
  }, [callStatuses])

  const cards = [
    {
      title: "Total Usuarios",
      value: totalUsers,
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "Seleccionados",
      value: selectedUsers,
      icon: Target,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `${selectedUsers}/${totalUsers}`,
      changeColor: "text-purple-600",
    },
    {
      title: "Llamadas Realizadas",
      value: stats.called,
      icon: Phone,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      change: isCallInProgress ? "En progreso..." : "Completado",
      changeColor: isCallInProgress ? "text-yellow-600" : "text-green-600",
    },
    {
      title: "En Progreso",
      value: stats.inProgress,
      icon: Clock,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: isCallInProgress ? "Activo" : "Inactivo",
      changeColor: isCallInProgress ? "text-yellow-600" : "text-gray-500",
    },
    {
      title: "Completadas",
      value: stats.completed,
      icon: Zap,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: `${stats.successRate.toFixed(1)}% éxito`,
      changeColor: "text-emerald-600",
    },
    {
      title: "Fallidas",
      value: stats.failed,
      icon: TrendingUp,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      change: stats.called > 0 ? `${((stats.failed / stats.called) * 100).toFixed(1)}%` : "0%",
      changeColor: "text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{card.value.toLocaleString()}</p>
                <p className={`text-xs font-medium ${card.changeColor}`}>{card.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
