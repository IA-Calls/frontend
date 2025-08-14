import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Star, Upload, X, FileSpreadsheet, Loader2, Plus, Trash2 } from "lucide-react"
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
    favorite: false,
    idioma: 'es',
    variables: {}
  })
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [newVariable, setNewVariable] = useState({ name: '', url: '' })
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
        favorite: groupForm.favorite || false,
        idioma: groupForm.idioma || 'es',
        variables: groupForm.variables || {}
      })
      // Reset file when opening modal
      setSelectedFile(null)
      setNewVariable({ name: '', url: '' })
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

  const addVariable = () => {
    if (newVariable.name.trim() && newVariable.url.trim()) {
      setLocalForm(prev => ({
        ...prev,
        variables: {
          ...prev.variables,
          [newVariable.name.trim()]: newVariable.url.trim()
        }
      }))
      setNewVariable({ name: '', url: '' })
      toast({
        title: "✅ Variable agregada",
        description: `Variable "${newVariable.name}" agregada al grupo.`,
      })
    } else {
      toast({
        title: "❌ Error",
        description: "Por favor completa el nombre y URL de la variable.",
        variant: "destructive",
      })
    }
  }

  const removeVariable = (variableName) => {
    const updatedVariables = { ...localForm.variables }
    delete updatedVariables[variableName]
    setLocalForm(prev => ({
      ...prev,
      variables: updatedVariables
    }))
    toast({
      title: "🗑️ Variable removida",
      description: `Variable "${variableName}" removida del grupo.`,
    })
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
      clientId: parseInt(clientId)
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
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl"
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
          <DialogDescription className="text-sm text-gray-600">
            {editingGroup 
              ? 'Modifica la información del grupo seleccionado.' 
              : 'Crea un nuevo grupo para organizar tus clientes. Opcionalmente, puedes cargar un archivo Excel con clientes. El sistema detectará automáticamente las columnas: Nombre, Teléfono, Email, Dirección, Categoría, Comentario.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Idioma
              </label>
              <select
                value={localForm.idioma}
                onChange={(e) => handleInputChange('idioma', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Idioma principal para las comunicaciones del grupo
              </p>
            </div>
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
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
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



          {/* Variables Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Variables (Opcional)
            </label>
            <div className="space-y-3">
              {Object.entries(localForm.variables).length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(localForm.variables).map(([name, url]) => (
                    <div key={name} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 block truncate">{name}</span>
                        <span className="text-xs text-gray-500 block truncate">{url}</span>
                      </div>
                      <button
                        onClick={() => removeVariable(name)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la variable"
                  className="flex-1"
                />
                <Input
                  type="text"
                  value={newVariable.url}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="URL de la variable"
                  className="flex-1"
                />
                <Button onClick={addVariable} size="sm" className="px-3">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Agrega variables personalizadas con nombre y URL para enriquecer los datos del grupo
            </p>
          </div>

          {/* File Upload Section - Only show when creating new group */}
          {!editingGroup && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cargar Clientes (Opcional)
              </label>
                              <div className="space-y-3">
                  {!selectedFile ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
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
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-6 w-6 text-green-600" />
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
        
        <DialogFooter className="sticky bottom-0 bg-white border-t border-gray-100 pt-4">
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
    </>
  )
} 