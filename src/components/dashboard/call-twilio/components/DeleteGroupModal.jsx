import { useState, useEffect } from "react"
import { Button } from "./ui/button.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { AlertTriangle, Trash2 } from "lucide-react"

export function DeleteGroupModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  groupName = '',
  groups = [],
  selectedGroupId = null,
  onGroupSelect = null,
  isLoading = false 
}) {
  const [selectedGroup, setSelectedGroup] = useState(selectedGroupId || '')

  // Sincronizar el estado cuando cambie el prop o se abra el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedGroup(selectedGroupId || '')
    }
  }, [isOpen, selectedGroupId])

  const handleGroupChange = (value) => {
    setSelectedGroup(value)
    if (onGroupSelect) {
      onGroupSelect(value)
    }
  }

  const handleConfirm = () => {
    if (selectedGroup) {
      onConfirm(selectedGroup)
    }
  }

  // Filtrar solo grupos activos (isActive !== false)
  const activeGroups = groups.filter(group => group.isActive !== false)
  
  const selectedGroupData = activeGroups.find(g => g.id === selectedGroup)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px] bg-white dark:bg-gray-800" 
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 10000
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Esta acción no se puede deshacer. El grupo será eliminado permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {activeGroups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Grupo
              </label>
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {activeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <Trash2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                ¿Estás seguro de que quieres eliminar el grupo?
              </p>
              {(selectedGroupData?.name || groupName) && (
                <p className="text-gray-900 dark:text-white font-semibold mt-1">
                  "{(selectedGroupData?.name || groupName)}"
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Esta acción eliminará permanentemente el grupo y todos sus datos asociados.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isLoading || !selectedGroup}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Grupo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 