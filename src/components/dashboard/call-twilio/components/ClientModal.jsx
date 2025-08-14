import { useState, useEffect } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog.tsx"
import { Trash2 } from "lucide-react"

export function ClientModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  client = null, 
  groupId = null,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    address: '',
    website: '',
    review: ''
  })

  const [errors, setErrors] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        category: client.category || 'none',
        address: client.address || '',
        website: client.website || '',
        review: client.review || ''
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: 'none',
        address: '',
        website: '',
        review: ''
      })
    }
    setErrors({})
  }, [client, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Convertir "none" a string vacío para el backend
      const dataToSend = {
        ...formData,
        category: formData.category === 'none' ? '' : formData.category
      }
      onSave(dataToSend)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay de fondo oscuro */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          style={{ zIndex: 9998 }}
          onClick={onClose}
        />
      )}
      
             <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent 
           className="sm:max-w-[600px] max-h-[90vh] overflow-hidden bg-white border-gray-200 shadow-xl"
           style={{ 
             position: 'fixed',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             backgroundColor: 'white',
             border: '1px solid #e5e7eb',
             borderRadius: '12px',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
             zIndex: 9999
           }}
           onPointerDownOutside={(e) => e.preventDefault()}
           onInteractOutside={(e) => e.preventDefault()}
         >
                 <DialogHeader className="bg-white border-b border-gray-100 p-6">
           <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
             {client ? 'Editar Cliente' : 'Nuevo Cliente'}
           </DialogTitle>
           <DialogDescription className="text-sm text-gray-600 mt-2">
             {client 
               ? 'Modifica la información del cliente seleccionado.' 
               : 'Agrega un nuevo cliente al grupo.'
             }
           </DialogDescription>
         </DialogHeader>

                 <div className="flex-1 overflow-y-auto">
           <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
                             <Input
                 value={formData.name}
                 onChange={(e) => handleInputChange('name', e.target.value)}
                 placeholder="Nombre completo"
                 className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                 required
               />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
                             <Input
                 value={formData.phone}
                 onChange={(e) => handleInputChange('phone', e.target.value)}
                 placeholder="+1-555-0123"
                 className={errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                 required
               />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
                             <Input
                 value={formData.email}
                 onChange={(e) => handleInputChange('email', e.target.value)}
                 placeholder="email@ejemplo.com"
                 type="email"
                 className={errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
               />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  <SelectItem value="Cirujano">Cirujano</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Especialista">Especialista</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Dirección completa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sitio Web
            </label>
            <Input
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://ejemplo.com"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios
            </label>
            <textarea
              value={formData.review}
              onChange={(e) => handleInputChange('review', e.target.value)}
              placeholder="Comentarios adicionales sobre el cliente..."
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         />
           </div>
         </form>
         </div>

                 <DialogFooter className="bg-white border-t border-gray-100 p-6">
           <div className="flex justify-between w-full">
             <div>
               {client && (
                 <Button
                   variant="destructive"
                   onClick={handleDelete}
                   disabled={loading}
                   className="bg-red-600 hover:bg-red-700"
                 >
                   Eliminar Cliente
                 </Button>
               )}
             </div>
             
             <div className="flex gap-2">
               <Button
                 variant="outline"
                 onClick={onClose}
                 disabled={loading}
               >
                 Cancelar
               </Button>
               <Button
                 onClick={handleSubmit}
                 disabled={loading || !formData.name.trim() || !formData.phone.trim()}
                 className="bg-blue-600 hover:bg-blue-700"
               >
                 {loading ? 'Guardando...' : (client ? 'Actualizar' : 'Crear')}
               </Button>
             </div>
           </div>
         </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Eliminar Cliente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <div className="space-y-2">
              <p>¿Estás seguro de que quieres eliminar al cliente <strong>"{client?.name}"</strong>?</p>
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <p className="text-sm text-red-700">
                  ⚠️ Esta acción es <strong>irreversible</strong> y eliminará permanentemente el cliente del grupo.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel onClick={cancelDelete} className="flex-1">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete} 
            className="bg-red-600 hover:bg-red-700 flex-1"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

