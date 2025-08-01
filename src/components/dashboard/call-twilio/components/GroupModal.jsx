import { useState, useEffect } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Star } from "lucide-react"

export function GroupModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingGroup, 
  groupForm, 
  setGroupForm 
}) {
  const [localForm, setLocalForm] = useState({
    name: '',
    description: '',
    prompt: '',
    color: '#3B82F6',
    favorite: false
  })

  useEffect(() => {
    if (isOpen) {
      setLocalForm({
        name: groupForm.name || '',
        description: groupForm.description || '',
        prompt: groupForm.prompt || '',
        color: groupForm.color || '#3B82F6',
        favorite: groupForm.favorite || false
      })
    }
  }, [isOpen, groupForm])

  const handleSave = () => {
    onSave(localForm)
  }

  const handleClose = () => {
    onClose()
  }

  const handleInputChange = (field, value) => {
    setLocalForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleFavorite = () => {
    setLocalForm(prev => ({ ...prev, favorite: !prev.favorite }))
  }



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[500px] bg-white" 
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
            <button
              onClick={toggleFavorite}
              className={`p-1 rounded-full transition-colors ${
                localForm.favorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Star className={`h-5 w-5 ${localForm.favorite ? 'fill-current' : ''}`} />
            </button>
          </DialogTitle>
          <DialogDescription>
            {editingGroup 
              ? 'Modifica la información del grupo seleccionado.' 
              : 'Crea un nuevo grupo para organizar tus clientes.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Grupo *
            </label>
            <Input
              value={localForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Clientes VIP"
              className={!localForm.name.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {!localForm.name.trim() && (
              <p className="text-sm text-red-600 mt-1">El nombre del grupo es requerido</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={localForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción del grupo"
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              value={localForm.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Prompt para el grupo, ejemplo: 'Realiza llamadas profesionales'"
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localForm.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-500">
                Color para identificar el grupo
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!localForm.name.trim()}
          >
            {editingGroup ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 