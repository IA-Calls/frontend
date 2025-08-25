import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Star, Upload, X, FileSpreadsheet, Loader2, Plus, Trash2, Globe, MessageSquare, Settings, Users, Search, CheckCircle, Phone } from "lucide-react"
import { useToast } from "../use-toast.ts"
import { AuthService } from "../../../../services/authService.js"
import { PhoneNumberUtil } from 'google-libphonenumber'
import axios from 'axios'
import config from "../../../../config/environment.js"

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
    prefix: '+57', // Default to Colombia
    selectedCountryCode: 'CO', // Default to Colombia
    color: '#3B82F6',
    prompt: '',
    firstMessage: '',
    language: 'es',
    phoneNumberId: 'phnum_4301k3d047vdfq682hvy29kr5r2g' // Default phone number
  })
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [countries, setCountries] = useState([])
  const [countrySearchTerm, setCountrySearchTerm] = useState("")
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [isLoadingPhoneNumbers, setIsLoadingPhoneNumbers] = useState(false)
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState('')
  const fileInputRef = useRef(null)
  const countryDropdownRef = useRef(null)
  const { toast } = useToast()
  const authService = new AuthService()

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = () => {
      try {
        const phoneUtil = PhoneNumberUtil.getInstance()
        const countriesList = phoneUtil.getSupportedRegions()
          .map(countryCode => {
            const callingCode = phoneUtil.getCountryCodeForRegion(countryCode)
            return {
              code: countryCode,
              callingCode: `+${callingCode}`,
              name: new Intl.DisplayNames(['es'], { type: 'region' }).of(countryCode) || countryCode
            }
          })
          .filter(country => country.callingCode !== '+0') // Filter out invalid codes
          .sort((a, b) => a.name.localeCompare(b.name))
        
        setCountries(countriesList)
      } catch (error) {
        console.error('Error loading countries:', error)
        // Fallback to common countries
        setCountries([
          { code: 'CO', callingCode: '+57', name: 'Colombia' },
          { code: 'US', callingCode: '+1', name: 'Estados Unidos' },
          { code: 'MX', callingCode: '+52', name: 'México' },
          { code: 'ES', callingCode: '+34', name: 'España' },
          { code: 'AR', callingCode: '+54', name: 'Argentina' },
          { code: 'PE', callingCode: '+51', name: 'Perú' },
          { code: 'CL', callingCode: '+56', name: 'Chile' },
          { code: 'BR', callingCode: '+55', name: 'Brasil' }
        ])
      }
    }
    
    loadCountries()
  }, [])

  // Load phone numbers on component mount
  useEffect(() => {
    const loadPhoneNumbers = async () => {
      setIsLoadingPhoneNumbers(true)
      try {
        const response = await axios.get(`${config.AGENTS_API_URL}/phone-numbers`, {
          headers: {
            'Content-Type': 'application/json'
            // Sin Authorization header - endpoint público
          }
        })
        
        if (response.data.success) {
          setPhoneNumbers(response.data.data.phoneNumbers || [])
        } else {
          console.error('Error loading phone numbers:', response.data.message)
          // Fallback to default phone number
          setPhoneNumbers([{
            phone_number_id: 'phnum_4301k3d047vdfq682hvy29kr5r2g',
            phone_number: '+1234567890',
            provider: 'twilio',
            label: 'Default'
          }])
        }
              } catch (error) {
          console.error('Error fetching phone numbers:', error)
          // Fallback to default phone number
          setPhoneNumbers([{
            phone_number_id: 'phnum_4301k3d047vdfq682hvy29kr5r2g',
            phone_number: '+1234567890',
            provider: 'twilio',
            label: 'Default'
          }])
        } finally {
        setIsLoadingPhoneNumbers(false)
      }
    }
    
    loadPhoneNumbers()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setLocalForm({
        name: groupForm.name || '',
        description: groupForm.description || '',
        prefix: groupForm.prefix || '+57',
        selectedCountryCode: groupForm.selectedCountryCode || 'CO',
        color: groupForm.color || '#3B82F6',
        prompt: groupForm.prompt || '',
        firstMessage: groupForm.firstMessage || '',
        language: groupForm.language || 'es',
        phoneNumberId: groupForm.phoneNumberId || 'phnum_4301k3d047vdfq682hvy29kr5r2g'
      })
      // Reset file when opening modal
      setSelectedFile(null)
      setErrors({})
    }
  }, [isOpen, groupForm])

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!localForm.name.trim()) {
      newErrors.name = 'El nombre del grupo es requerido'
    }

    if (localForm.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!localForm.prefix) {
      newErrors.prefix = 'El prefijo telefónico es requerido'
    }

    if (!localForm.prompt.trim()) {
      newErrors.prompt = 'El prompt del agente es requerido'
    }

    if (!localForm.language) {
      newErrors.language = 'El lenguaje es requerido'
    }

    if (!selectedPhoneNumberId && !localForm.phoneNumberId) {
      newErrors.phoneNumberId = 'Debes seleccionar un número telefónico'
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
      phoneNumberId: selectedPhoneNumberId || localForm.phoneNumberId,
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
        // Remove the data URL prefix
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

  const getCountryFlag = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
  }

  // Filtrar países basado en el término de búsqueda
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.callingCode.includes(countrySearchTerm)
  )

  // Obtener el país seleccionado
  const selectedCountry = countries.find(country => country.code === localForm.selectedCountryCode)

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
          className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl"
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
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {editingGroup 
                ? 'Modifica la información del grupo seleccionado.' 
                : 'Crea un nuevo grupo para organizar tus clientes y configurar el agente IA.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="group-config" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="group-config" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración del Grupo
              </TabsTrigger>
              <TabsTrigger value="agent-config" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Configuración Agente IA
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Configuración del Grupo */}
            <TabsContent value="group-config" className="space-y-4">
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
                    Prefijo Telefónico *
                  </label>
                  
                  {/* Dropdown personalizado de países */}
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className={`w-full px-3 py-2 text-left border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.prefix ? 'border-red-300' : 'border-gray-300'
                      } bg-white hover:bg-gray-50 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedCountry ? (
                            <>
                              <span className="text-lg">{getCountryFlag(selectedCountry.code)}</span>
                              <span className="text-sm font-medium">{selectedCountry.name}</span>
                              <span className="text-sm text-gray-500">({selectedCountry.callingCode})</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Seleccionar país...</span>
                          )}
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            isCountryDropdownOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Dropdown de países */}
                    {isCountryDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        {/* Buscador dentro del dropdown */}
                        <div className="p-3 border-b border-gray-100">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Buscar país o código..."
                              value={countrySearchTerm}
                              onChange={(e) => setCountrySearchTerm(e.target.value)}
                              className="w-full px-3 py-2 pl-8 pr-8 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              autoFocus
                            />
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            {countrySearchTerm && (
                              <button
                                onClick={() => setCountrySearchTerm("")}
                                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Lista de países */}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCountries.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                              No se encontraron países
                            </div>
                          ) : (
                            filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  handleInputChange('prefix', country.callingCode)
                                  handleInputChange('selectedCountryCode', country.code)
                                  setIsCountryDropdownOpen(false)
                                  setCountrySearchTerm("")
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                                  localForm.selectedCountryCode === country.code ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{getCountryFlag(country.code)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{country.name}</div>
                                    <div className="text-xs text-gray-500">{country.callingCode}</div>
                                  </div>
                                  {localForm.selectedCountryCode === country.code && (
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>

                        {/* Contador de resultados */}
                        {countrySearchTerm && (
                          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                            {filteredCountries.length} país(es) encontrado(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {errors.prefix && (
                    <p className="text-sm text-red-600 mt-1">{errors.prefix}</p>
                  )}
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

              {/* File Upload Section - Only show when creating new group */}
              {!editingGroup && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Carga Masiva (Opcional)
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
            </TabsContent>

            {/* Tab 2: Configuración Agente IA */}
            <TabsContent value="agent-config" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lenguaje *
                  </label>
                  <select
                    value={localForm.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.language ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                  </select>
                  {errors.language && (
                    <p className="text-sm text-red-600 mt-1">{errors.language}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número Telefónico a Usar
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {isLoadingPhoneNumbers ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">Cargando números...</span>
                      </div>
                    ) : phoneNumbers.length > 0 ? (
                      <div className="space-y-2">
                        {phoneNumbers.map((phoneNumber) => (
                          <div 
                            key={phoneNumber.phone_number_id} 
                            className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                              selectedPhoneNumberId === phoneNumber.phone_number_id 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedPhoneNumberId(phoneNumber.phone_number_id)}
                          >
                            <div className="flex items-center gap-2">
                              <Phone className={`h-4 w-4 ${
                                selectedPhoneNumberId === phoneNumber.phone_number_id 
                                  ? 'text-blue-600' 
                                  : 'text-gray-400'
                              }`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {phoneNumber.phone_number}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {phoneNumber.label}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-400">
                                {phoneNumber.phone_number_id}
                              </div>
                              {selectedPhoneNumberId === phoneNumber.phone_number_id && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Phone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No hay números telefónicos disponibles</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Selecciona un número telefónico para este grupo
                    </p>
                    {selectedPhoneNumberId && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Número seleccionado: {phoneNumbers.find(p => p.phone_number_id === selectedPhoneNumberId)?.phone_number}
                      </p>
                    )}
                    {errors.phoneNumberId && (
                      <p className="text-sm text-red-600 mt-1">{errors.phoneNumberId}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primer Mensaje
                </label>
                <textarea
                  value={localForm.firstMessage}
                  onChange={(e) => handleInputChange('firstMessage', e.target.value)}
                  placeholder="El primer mensaje que dirá el agente. Si está vacío, el agente esperará a que el usuario inicie la conversación."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si está vacío, el agente esperará a que el usuario inicie la conversación.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt *
                </label>
                <textarea
                  value={localForm.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  placeholder="Explica que el prompt es para suministrar la personalidad del agente"
                  rows={4}
                  className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.prompt ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.prompt && (
                  <p className="text-sm text-red-600 mt-1">{errors.prompt}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  El prompt es para suministrar la personalidad del agente
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
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