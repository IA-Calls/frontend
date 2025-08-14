import { useState } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Phone, Loader2, X, User, PhoneCall, Square } from "lucide-react"
import { useToast } from "../use-toast.ts"

export function TestCallModal({ 
  isOpen, 
  onClose, 
  onStartCall 
}) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    importantData: ''
  })
  
  const [isCalling, setIsCalling] = useState(false)
  const [errors, setErrors] = useState({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'El número de teléfono es requerido'
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Formato de teléfono inválido'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleStartCall = async () => {
    if (!validateForm()) {
      return
    }

    setIsCalling(true)
    toast({
      title: "📞 Iniciando llamada de prueba",
      description: `Llamando a ${formData.name} (${formData.phoneNumber})...`,
    })

    try {
      // Simular la llamada - aquí iría la lógica real de la API
      await onStartCall(formData)
      
      toast({
        title: "✅ Llamada iniciada",
        description: "La llamada de prueba se ha iniciado correctamente.",
      })
    } catch (error) {
      console.error('Error al iniciar llamada:', error)
      toast({
        title: "❌ Error",
        description: "No se pudo iniciar la llamada. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsCalling(false)
    }
  }

  const handleCancelCall = () => {
    setIsCalling(false)
    toast({
      title: "⏹️ Llamada cancelada",
      description: "La llamada de prueba ha sido cancelada.",
    })
  }

  const handleClose = () => {
    if (!isCalling) {
      setFormData({
        phoneNumber: '',
        name: '',
        importantData: ''
      })
      setErrors({})
      onClose()
    }
  }

  return (
    <>
      {/* Overlay de fondo oscuro */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          style={{ zIndex: 9998 }}
          onClick={handleClose}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-[500px] bg-white border-gray-200 shadow-xl"
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
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Phone className="h-5 w-5 text-blue-600" />
              Probar Llamada
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Ingresa los datos de la persona para realizar una llamada de prueba
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Teléfono *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+1-555-0123"
                  className={`pl-10 ${errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isCalling}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Persona *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Juan Pérez"
                  className={`pl-10 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isCalling}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datos Importantes (Opcional)
              </label>
              <textarea
                value={formData.importantData}
                onChange={(e) => handleInputChange('importantData', e.target.value)}
                placeholder="Información relevante sobre la persona, contexto de la llamada, etc."
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isCalling}
              />
              <p className="text-xs text-gray-500 mt-1">
                Información adicional que puede ser útil durante la llamada
              </p>
            </div>

            {/* Estado de llamada */}
            {isCalling && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Llamando a {formData.name}...
                    </p>
                    <p className="text-xs text-blue-700">
                      {formData.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white border-t border-gray-100 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isCalling}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {isCalling ? (
              <Button 
                onClick={handleCancelCall}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="h-4 w-4 mr-2" />
                Cancelar Llamada
              </Button>
            ) : (
              <Button 
                onClick={handleStartCall}
                disabled={!formData.phoneNumber.trim() || !formData.name.trim() || Object.keys(errors).length > 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Iniciar Llamada
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
