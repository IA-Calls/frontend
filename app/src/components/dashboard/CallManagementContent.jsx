"use client"

import { useState } from "react"
import { GroupsOverview } from "./call-management/GroupsOverview"
import { GroupDetailsView } from "./call-management/GroupDetailsView"
import { MassUploadsContent } from "./MassUploadsContent"

export const CallManagementContent = ({ user }) => {
  const [currentView, setCurrentView] = useState("overview")
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showExcelMapper, setShowExcelMapper] = useState(false)
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Campaña Ventas Q1 2024",
      description: "Llamadas de seguimiento para clientes potenciales del primer trimestre",
      prompt: "Estas hecho para responder preguntas respecto a el evento de bogota",
      phoneNumber: "+1-555-0123",
      totalCalls: 245,
      successfulCalls: 189,
      pendingCalls: 23,
      failedCalls: 33,
      createdAt: "2024-01-15",
      status: "active",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Encuesta Satisfacción",
      description: "Llamadas automatizadas para evaluar la satisfacción del cliente",
      prompt: "Estas hecho para responder preguntas respecto a el evento de metrallork",
      phoneNumber: "+1-555-0456",
      totalCalls: 156,
      successfulCalls: 134,
      pendingCalls: 8,
      failedCalls: 14,
      createdAt: "2024-01-20",
      status: "active",
      color: "bg-green-500",
    },
    {
      id: 3,
      name: "Recordatorios Médicos",
      description: "Sistema de recordatorios para citas médicas",
      prompt: "Estas hecho para responder preguntas respecto a el evento de Bga",
      phoneNumber: "+1-555-0789",
      totalCalls: 89,
      successfulCalls: 76,
      pendingCalls: 5,
      failedCalls: 8,
      createdAt: "2024-01-25",
      status: "paused",
      color: "bg-purple-500",
    },
  ])

  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: groups.length + 1,
      ...groupData,
      totalCalls: 0,
      successfulCalls: 0,
      pendingCalls: 0,
      failedCalls: 0,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
      color: getRandomColor(),
    }
    setGroups([...groups, newGroup])
  }

  const handleSelectGroup = (group) => {
    setSelectedGroup(group)
    setCurrentView("group-details")
  }

  const handleBackToOverview = () => {
    setCurrentView("overview")
    setSelectedGroup(null)
  }

  const getRandomColor = () => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500", "bg-indigo-500"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <button
                onClick={handleBackToOverview}
                className={`hover:text-gray-700 ${currentView === "overview" ? "text-blue-600 font-medium" : ""}`}
              >
                Gestor de Llamadas
              </button>
              {currentView === "group-details" && selectedGroup && (
                <>
                  <span>/</span>
                  <span className="text-blue-600 font-medium">{selectedGroup.name}</span>
                </>
              )}
            </nav>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentView === "overview" ? "Gestor de Llamadas" : selectedGroup?.name}
            </h2>
            <p className="text-gray-600">
              {currentView === "overview"
                ? "Gestiona tus campañas de llamadas automáticas con IA"
                : selectedGroup?.description}
            </p>
          </div>

          {/* Botones mejorados - más visibles */}
          {currentView === "group-details" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowExcelMapper(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Carga masiva de clientes
              </button>

              <button
                onClick={handleBackToOverview}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a Grupos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {currentView === "overview" ? (
        <GroupsOverview
          groups={groups}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          user={user}
        />
      ) : (
        <GroupDetailsView group={selectedGroup} onBack={handleBackToOverview} user={user} />
      )}

      {/* Modal de Carga Masiva - Corregido y más pequeño */}
      {showExcelMapper && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowExcelMapper(false)} />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Carga Masiva de Clientes</h3>
                  <p className="text-sm text-gray-600">
                    Grupo: <span className="font-medium text-blue-600">{selectedGroup?.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowExcelMapper(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <MassUploadsContent user={user} group={selectedGroup} onClose={() => setShowExcelMapper(false)} />
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowExcelMapper(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
