import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Star, Upload, X, FileSpreadsheet, Loader2, Plus, Trash2, Globe, Brain, Settings, Users, Search, CheckCircle, Phone } from "lucide-react"
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
    phoneNumberId: 'phnum_4301k3d047vdfq682hvy29kr5r2g', // Default phone number
    agentId: '' // Nuevo campo requerido
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
  const [agents, setAgents] = useState([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
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

  // Load agents on component mount
  useEffect(() => {
    const loadAgents = async () => {
      setIsLoadingAgents(true)
      try {
        const response = await fetch(config.getApiUrl('/api/agents/list'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        const data = await response.json()

        if (data.success === false) {
          console.error('Error loading agents:', data.message)
          setAgents([])
          return
        }

        if (!response.ok) {
          console.error('Error loading agents:', data.message)
          setAgents([])
          return
        }

        // Acceder a data.data.raw_data.agents para obtener datos completos
        const agentsList = data.data?.raw_data?.agents || data.data?.agents || data.agents || []
        setAgents(agentsList)
      } catch (error) {
        console.error('Error fetching agents:', error)
        setAgents([])
      } finally {
        setIsLoadingAgents(false)
      }
    }
    
    if (isOpen) {
      loadAgents()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setLocalForm({
        name: groupForm.name || '',
        description: groupForm.description || '',
        prefix: groupForm.prefix || '+57',
        selectedCountryCode: groupForm.selectedCountryCode || 'CO',
        color: groupForm.color || '#3B82F6',
        phoneNumberId: groupForm.phoneNumberId || 'phnum_4301k3d047vdfq682hvy29kr5r2g',
        agentId: groupForm.agentId || ''
      })
      // Reset file when opening modal
      setSelectedFile(null)
      setSelectedPhoneNumberId(groupForm.phoneNumberId || '')
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

    if (!localForm.agentId) {
      newErrors.agentId = 'Debes seleccionar un agente'
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

    // Preparar los datos del grupo con clientID y agentId
    const groupData = {
      name: localForm.name,
      description: localForm.description,
      prefix: localForm.prefix,
      selectedCountryCode: localForm.selectedCountryCode,
      color: localForm.color,
      phoneNumberId: selectedPhoneNumberId || localForm.phoneNumberId,
      agentId: localForm.agentId, // ⭐ NUEVO: Campo requerido
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
          className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
          style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 9999
          }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b border-gray-100 dark:border-gray-700">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              {editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              {editingGroup 
                ? 'Modifica la información del grupo seleccionado.' 
                : 'Crea un nuevo grupo para organizar tus clientes y configurar el agente IA.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {/* Configuración del Grupo - Ya no hay tabs, solo una vista */}
          <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prefijo Telefónico *
                  </label>
                  
                  {/* Dropdown personalizado de países */}
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className={`w-full px-3 py-2 text-left border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.prefix ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedCountry ? (
                            <>
                              <span className="text-lg">{getCountryFlag(selectedCountry.code)}</span>
                              <span className="text-sm font-medium">{selectedCountry.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">({selectedCountry.callingCode})</span>
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Seleccionar país...</span>
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
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                                  {/* Buscador dentro del dropdown */}
                          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Buscar país o código..."
                              value={countrySearchTerm}
                              onChange={(e) => setCountrySearchTerm(e.target.value)}
                              className="w-full px-3 py-2 pl-8 pr-8 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
                                className={`w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                                  localForm.selectedCountryCode === country.code ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{getCountryFlag(country.code)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 dark:text-white">{country.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{country.callingCode}</div>
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
                                                  <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={localForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción del grupo"
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={localForm.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Color para identificar el grupo
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Agente - REQUERIDO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agente IA * <span className="text-red-500">(Requerido)</span>
                </label>
                {isLoadingAgents ? (
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Cargando agentes...</span>
                  </div>
                ) : agents.length > 0 ? (
                  <div className="relative">
                    <select
                      value={localForm.agentId}
                      onChange={(e) => handleInputChange('agentId', e.target.value)}
                      className={`block w-full pl-4 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors appearance-none ${
                        errors.agentId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Selecciona un agente...</option>
                      {agents.map((agent) => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.name || agent.agent_id}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {localForm.agentId ? (
                        <Brain className="h-5 w-5 text-blue-600" />
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No hay agentes disponibles. Por favor crea un agente primero.
                    </p>
                  </div>
                )}
                {errors.agentId && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.agentId}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecciona el agente de IA que se usará para las llamadas de este grupo
                </p>
              </div>

              {/* Selector de Número Telefónico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número Telefónico a Usar *
                </label>
                {isLoadingPhoneNumbers ? (
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Cargando números...</span>
                  </div>
                ) : phoneNumbers.length > 0 ? (
                  <div className="relative">
                    <select
                      value={selectedPhoneNumberId || localForm.phoneNumberId}
                      onChange={(e) => {
                        setSelectedPhoneNumberId(e.target.value)
                        handleInputChange('phoneNumberId', e.target.value)
                      }}
                      className={`block w-full pl-4 pr-10 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors appearance-none ${
                        errors.phoneNumberId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Selecciona un número telefónico...</option>
                      {phoneNumbers.map((phoneNumber) => (
                        <option key={phoneNumber.phone_number_id} value={phoneNumber.phone_number_id}>
                          {phoneNumber.phone_number} {phoneNumber.label ? `- ${phoneNumber.label}` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {selectedPhoneNumberId || localForm.phoneNumberId ? (
                        <Phone className="h-5 w-5 text-blue-600" />
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-center">
                    <Phone className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay números telefónicos disponibles</p>
                  </div>
                )}
                {selectedPhoneNumberId && phoneNumbers.find(p => p.phone_number_id === selectedPhoneNumberId) && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Número seleccionado: <span className="font-medium">{phoneNumbers.find(p => p.phone_number_id === selectedPhoneNumberId)?.phone_number}</span>
                    </p>
                  </div>
                )}
                {errors.phoneNumberId && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phoneNumberId}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecciona un número telefónico para este grupo
                </p>
              </div>

              {/* File Upload Section - Only show when creating new group */}
              {!editingGroup && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Carga Masiva (Opcional)
                  </label>
                  <div className="space-y-3">
                    {!selectedFile ? (
                      <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
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
          
          <DialogFooter className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pt-4">
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