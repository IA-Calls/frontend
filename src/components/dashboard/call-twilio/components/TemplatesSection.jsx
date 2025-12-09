import { useState, useEffect } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Textarea } from "./ui/textarea.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Plus, Trash2, Eye, Search, FileText, Loader2, AlertTriangle, X } from "lucide-react"
import { useToast } from "../use-toast.ts"
import { whatsappTemplatesService } from "../../../../services/whatsappTemplatesService.js"

export function TemplatesSection() {
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Debug: Log cuando cambia el estado del modal
  useEffect(() => {
    console.log('Modal state changed:', isCreateModalOpen)
  }, [isCreateModalOpen])
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [languageFilter, setLanguageFilter] = useState("all")
  const { toast } = useToast()

  // Form state for creating template
  const [templateForm, setTemplateForm] = useState({
    name: "",
    language: "es",
    category: "marketing",
    components: [
      {
        type: "body",
        text: "",
        example: {
          body_text_named_params: []
        }
      }
    ]
  })

  // Load templates
  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (statusFilter && statusFilter !== "all") params.status = statusFilter
      if (languageFilter && languageFilter !== "all") params.language = languageFilter
      
      const data = await whatsappTemplatesService.getTemplates(params)
      setTemplates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error",
        description: error.message || "Error al cargar las plantillas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [statusFilter, languageFilter])

  // Create template
  const handleCreateTemplate = async () => {
    try {
      setIsLoading(true)
      
      // Validate form
      if (!templateForm.name.trim()) {
        toast({
          title: "Error",
          description: "El nombre es requerido",
          variant: "destructive"
        })
        return
      }

      if (!templateForm.components[0]?.text?.trim()) {
        toast({
          title: "Error",
          description: "El texto del cuerpo es requerido",
          variant: "destructive"
        })
        return
      }

      // Prepare components - solo type y text
      const components = templateForm.components
        .filter(comp => comp.text && comp.text.trim()) // Solo componentes con texto
        .map(comp => ({
          type: comp.type,
          text: comp.text.trim()
        }))

      if (components.length === 0) {
        toast({
          title: "Error",
          description: "Debes agregar al menos un componente con texto",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      const templateData = {
        name: templateForm.name.trim(),
        language: templateForm.language,
        category: templateForm.category,
        components: components
      }

      await whatsappTemplatesService.createTemplate(templateData)
      
      toast({
        title: "Éxito",
        description: "Plantilla creada correctamente"
      })
      
      setIsCreateModalOpen(false)
      resetForm()
      loadTemplates()
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: error.message || "Error al crear la plantilla",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // View template details
  const handleViewTemplate = async (templateId) => {
    try {
      setIsLoading(true)
      const template = await whatsappTemplatesService.getTemplate(templateId)
      setSelectedTemplate(template)
      setIsViewModalOpen(true)
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Error",
        description: error.message || "Error al cargar la plantilla",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return
    
    try {
      setIsLoading(true)
      await whatsappTemplatesService.deleteTemplate(selectedTemplate.id || selectedTemplate.templateId)
      
      toast({
        title: "Éxito",
        description: "Plantilla eliminada correctamente"
      })
      
      setIsDeleteModalOpen(false)
      setSelectedTemplate(null)
      loadTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la plantilla",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTemplateForm({
      name: "",
      language: "es",
      category: "marketing",
      components: [
        {
          type: "body",
          text: ""
        }
      ]
    })
  }

  // Add component to form
  const addComponent = (type) => {
    const newComponent = {
      type: type,
      text: ""
    }
    
    setTemplateForm({
      ...templateForm,
      components: [...templateForm.components, newComponent]
    })
  }

  // Remove component from form
  const removeComponent = (index) => {
    const newComponents = templateForm.components.filter((_, i) => i !== index)
    setTemplateForm({
      ...templateForm,
      components: newComponents
    })
  }

  // Update component text
  const updateComponentText = (index, text) => {
    const newComponents = [...templateForm.components]
    newComponents[index].text = text
    setTemplateForm({
      ...templateForm,
      components: newComponents
    })
  }

  // Filter templates by search term
  const filteredTemplates = templates.filter(template => {
    const name = template.name || template.templateName || ""
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { label: "Aprobado", variant: "default", className: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" },
      PENDING: { label: "Pendiente", variant: "secondary", className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400" },
      REJECTED: { label: "Rechazado", variant: "destructive", className: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" }
    }
    
    const statusInfo = statusMap[status] || { label: status, variant: "secondary", className: "" }
    
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plantillas de WhatsApp</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus templates de mensajes de WhatsApp
          </p>
        </div>
        <Button
          onClick={() => {
            console.log('Button clicked, opening modal')
            setIsCreateModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Plantilla
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="APPROVED">Aprobado</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="REJECTED">Rechazado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">Inglés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates List */}
      {isLoading && templates.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No hay plantillas</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Crea tu primera plantilla para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id || template.templateId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {template.name || template.templateName || "Sin nombre"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {template.category || "Sin categoría"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(template.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Idioma</p>
                    <Badge variant="outline">{template.language || "es"}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTemplate(template.id || template.templateId)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedTemplate(template)
                        setIsDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent 
          className="sm:max-w-[800px] max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
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
            <DialogTitle>Crear Nueva Plantilla</DialogTitle>
            <DialogDescription>
              Completa los campos para crear una nueva plantilla de WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Plantilla *
              </label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="mi_template"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma *
                </label>
                <Select
                  value={templateForm.language}
                  onValueChange={(value) => setTemplateForm({ ...templateForm, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <Select
                  value={templateForm.category}
                  onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="utility">Utilidad</SelectItem>
                    <SelectItem value="authentication">Autenticación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Componentes del Mensaje
              </label>
              <div className="space-y-4">
                {templateForm.components.map((component, index) => (
                  <Card key={index} className="border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                            {component.type === "body" ? "Cuerpo del Mensaje" : component.type === "footer" ? "Pie de Página" : "Encabezado"}
                          </CardTitle>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {component.type === "body" ? "Texto principal del mensaje (requerido)" : component.type === "footer" ? "Texto opcional al final" : "Encabezado opcional"}
                          </p>
                        </div>
                        {templateForm.components.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeComponent(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(component.type === "body" || component.type === "footer") && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Texto {component.type === "body" ? "*" : ""}
                          </label>
                          <Textarea
                            value={component.text || ""}
                            onChange={(e) => updateComponentText(index, e.target.value)}
                            placeholder={component.type === "body" ? "Ejemplo: Hola {{1}}, tu resumen es: {{2}}" : "Ejemplo: Gracias por contactarnos"}
                            rows={4}
                            className="resize-none"
                          />
                          {component.type === "body" && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                              💡 Usa {"{{1}}"}, {"{{2}}"}, etc. para variables dinámicas
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addComponent("footer")}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Agregar Footer
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                El cuerpo del mensaje es obligatorio. Puedes agregar un footer opcional.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false)
              resetForm()
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTemplate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Plantilla"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Template Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Plantilla</DialogTitle>
            <DialogDescription>
              Información completa de la plantilla
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <p className="text-gray-900 dark:text-white">{selectedTemplate.name || selectedTemplate.templateName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idioma
                  </label>
                  <Badge>{selectedTemplate.language}</Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  {getStatusBadge(selectedTemplate.status)}
                </div>
              </div>

              {selectedTemplate.components && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Componentes
                  </label>
                  <div className="space-y-3">
                    {selectedTemplate.components.map((component, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm capitalize">{component.type}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {component.format && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Formato: {component.format}
                            </p>
                          )}
                          {component.text && (
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                              {component.text}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsViewModalOpen(false)
                setIsDeleteModalOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta plantilla? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="py-4">
              <p className="text-gray-900 dark:text-white font-medium">
                {selectedTemplate.name || selectedTemplate.templateName}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

