"use client"

import { useMemo } from "react"
import { Phone, Users, Target, Zap, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "./ui/card.tsx"
// import type { CallStatus } from "@/app/page" // No longer needed for types

// interface StatsCardsProps {
//   totalUsers: number
//   selectedUsers: number
//   callStatuses: Map<string, CallStatus>
//   isCallInProgress: boolean
// }

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
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "Seleccionados",
      value: selectedUsers,
      icon: Target,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: `${selectedUsers}/${totalUsers}`,
      changeColor: "text-purple-600",
    },
    {
      title: "Llamadas Realizadas",
      value: stats.called,
      icon: Phone,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      change: isCallInProgress ? "En progreso..." : "Completado",
      changeColor: isCallInProgress ? "text-yellow-600" : "text-green-600",
    },
    {
      title: "En Progreso",
      value: stats.inProgress,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-100",
      change: isCallInProgress ? "Activo" : "Inactivo",
      changeColor: isCallInProgress ? "text-yellow-600" : "text-gray-500",
    },
    {
      title: "Completadas",
      value: stats.completed,
      icon: Zap,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-50 to-green-100",
      change: `${stats.successRate.toFixed(1)}% éxito`,
      changeColor: "text-emerald-600",
    },
    {
      title: "Fallidas",
      value: stats.failed,
      icon: TrendingUp,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      change: stats.called > 0 ? `${((stats.failed / stats.called) * 100).toFixed(1)}%` : "0%",
      changeColor: "text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value.toLocaleString()}</p>
                <p className={`text-xs font-medium ${card.changeColor}`}>{card.change}</p>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-r ${card.gradient} shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
