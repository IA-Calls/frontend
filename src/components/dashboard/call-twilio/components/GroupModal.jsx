import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Star, Upload, X, FileSpreadsheet, Loader2 } from "lucide-react"
import { useToast } from "../use-toast.ts"
import { AuthService } from "../../../../services/authService.js"

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
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)
  const { toast } = useToast()
  const authService = new AuthService()

  useEffect(() => {
    if (isOpen) {
      setLocalForm({
        name: groupForm.name || '',
        description: groupForm.description || '',
        prompt: groupForm.prompt || '',
        color: groupForm.color || '#3B82F6',
        favorite: groupForm.favorite || false
      })
      // Reset file when opening modal
      setSelectedFile(null)
    }
  }, [isOpen, groupForm])

  const validateForm = () => {
    const newErrors = {}

    if (!localForm.name.trim()) {
      newErrors.name = 'El nombre del grupo es requerido'
    }

    if (localForm.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setLocalForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    // Obtener el clientID del usuario autenticado
    const clientId = authService.getClientId()
    if (!clientId) {
      toast({
        title: "❌ Error",
        description: "No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    // Preparar los datos del grupo con clientID
    const groupData = {
      ...localForm,
      createdByClient: clientId
    }

    if (selectedFile && !editingGroup) {
      setIsUploading(true)
      try {
        // Convert file to base64
        const base64File = await fileToBase64(selectedFile)
        
        // Create group data with file and clientID
        const groupDataWithFile = {
          ...groupData,
          base64: base64File,
          document_name: selectedFile.name
        }
        
        await onSave(groupDataWithFile)
      } catch (error) {
        console.error('Error converting file to base64:', error)
        toast({
          title: "❌ Error",
          description: "Error al procesar el archivo. Inténtalo de nuevo.",
          variant: "destructive",
        })
        await onSave(groupData)
      } finally {
        setIsUploading(false)
      }
    } else {
      await onSave(groupData)
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,")
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
      ]
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "❌ Archivo no válido",
          description: "Por favor selecciona un archivo Excel válido (.xlsx, .xls)",
          variant: "destructive",
        })
        return
      }
      
      setSelectedFile(file)
             toast({
         title: "✅ Archivo seleccionado",
         description: `${file.name} ha sido seleccionado. El sistema detectará automáticamente las columnas del Excel.`,
       })
    }
  }

  const handleFileDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
      ]
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "❌ Archivo no válido",
          description: "Por favor selecciona un archivo Excel válido (.xlsx, .xls)",
          variant: "destructive",
        })
        return
      }
      
      setSelectedFile(file)
             toast({
         title: "✅ Archivo cargado",
         description: `${file.name} ha sido cargado. El sistema detectará automáticamente las columnas del Excel.`,
       })
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast({
      title: "🗑️ Archivo removido",
      description: "El archivo ha sido removido del formulario.",
    })
  }

  const handleClose = () => {
    onClose()
  }



  const toggleFavorite = () => {
    setLocalForm(prev => ({ ...prev, favorite: !prev.favorite }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[600px] bg-white" 
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
              : 'Crea un nuevo grupo para organizar tus clientes. Opcionalmente, puedes cargar un archivo Excel con clientes. El sistema detectará automáticamente las columnas: Nombre, Teléfono, Email, Dirección, Categoría, Comentario.'
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
              className={errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
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

          {/* File Upload Section - Only show when creating new group */}
          {!editingGroup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargar Clientes (Opcional)
              </label>
              <div className="space-y-3">
                {!selectedFile ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                         <p className="text-sm text-gray-600 mb-2">
                       Arrastra y suelta un archivo Excel aquí, o haz clic para seleccionar
                     </p>
                     <p className="text-xs text-gray-500 mb-2">
                       Formatos soportados: .xlsx, .xls
                     </p>
                     <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                       <p className="font-medium mb-1">Columnas detectadas automáticamente:</p>
                       <p>• <strong>Requeridas:</strong> Nombre, Teléfono</p>
                       <p>• <strong>Opcionales:</strong> Email, Dirección, Categoría, Comentario</p>
                     </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!localForm.name.trim() || isUploading || Object.keys(errors).length > 0}
          >
                         {isUploading ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 {selectedFile ? 'Creando grupo y extrayendo clientes...' : 'Procesando...'}
               </>
             ) : (
               editingGroup ? 'Actualizar' : 'Crear'
             )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 