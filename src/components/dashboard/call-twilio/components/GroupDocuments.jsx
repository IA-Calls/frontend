import { useState, useEffect, useMemo, useCallback } from "react"
import { FileText, Download, Eye, Calendar, User, FolderOpen, Search, Filter, RefreshCw, Trash2, FileSpreadsheet, FileImage, File, X } from "lucide-react"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Input } from "./ui/input.tsx"
import { Badge } from "./ui/badge.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { ScrollArea } from "./ui/scroll-area.tsx"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog.tsx"
import { useToast } from "../use-toast.ts"
import config from "../../../../config/environment.js"
import { authService } from "../../../../services/authService.js"

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return <FileSpreadsheet className="h-8 w-8 text-green-600" />
    case 'pdf':
      return <File className="h-8 w-8 text-red-600" />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FileImage className="h-8 w-8 text-blue-600" />
    default:
      return <FileText className="h-8 w-8 text-gray-600" />
  }
}

const getFileTypeColor = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return "bg-green-100 text-green-800"
    case 'pdf':
      return "bg-red-100 text-red-800"
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function GroupDocuments() {
  const [documents, setDocuments] = useState([])
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGroup, setFilterGroup] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  const { toast } = useToast()

  // Obtener documentos de los grupos
  const fetchDocuments = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const clientId = authService.getClientId()
      if (!clientId) {
        throw new Error('No se pudo obtener el ID del cliente')
      }
      
      const url = `http://localhost:5000/documents/${clientId}?page=${page}&limit=${limit}`
      
      console.log('Fetching documents from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authService.getToken() && { 'Authorization': `Bearer ${authService.getToken()}` })
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setDocuments(result.data || [])
        setPagination(result.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
        
                 // Extraer grupos únicos para el filtro
         const groupNames = result.data.map(doc => doc.groupInfo?.name || doc.metadata?.groupName).filter(Boolean)
         const uniqueGroups = [...new Set(groupNames)]
         setGroups(uniqueGroups)
        
        toast({
          title: "✅ Documentos cargados",
          description: `Se cargaron ${result.data.length} documentos.`,
        })
      } else {
        throw new Error(result.message || 'Error al cargar documentos')
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      setError(`No se pudieron cargar los documentos: ${error.message}`)
      toast({
        title: "❌ Error al cargar documentos",
        description: "Verifica la conexión con la API.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Cargar documentos al montar el componente
  useEffect(() => {
    fetchDocuments(1, 10)
  }, [fetchDocuments])

  // Filtrar documentos
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = 
        doc.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.groupInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.metadata?.groupName?.toLowerCase().includes(searchTerm.toLowerCase())

      const groupName = doc.groupInfo?.name || doc.metadata?.groupName
      const matchesGroup = filterGroup === "all" || groupName === filterGroup
      
      const fileExtension = doc.originalName?.split('.').pop()?.toLowerCase()
      const matchesType = filterType === "all" || fileExtension === filterType

      return matchesSearch && matchesGroup && matchesType
    })
  }, [documents, searchTerm, filterGroup, filterType])

  // Obtener tipos de archivo únicos
  const fileTypes = useMemo(() => {
    const types = [...new Set(documents.map(doc => doc.originalName?.split('.').pop()?.toLowerCase()))].filter(Boolean)
    return types
  }, [documents])

  // Manejar eliminación de documento
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return
    
    setIsDeleting(true)
    try {
      const clientId = authService.getClientId()
      const url = `http://localhost:5000/documents/${clientId}/${selectedDocument.id}`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authService.getToken() && { 'Authorization': `Bearer ${authService.getToken()}` })
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      toast({
        title: "✅ Documento eliminado",
        description: `El documento "${selectedDocument.originalName}" se eliminó correctamente.`,
      })
      
      // Recargar documentos
      await fetchDocuments(pagination.page, pagination.limit)
      setShowDeleteConfirm(false)
      setSelectedDocument(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: "❌ Error al eliminar",
        description: `No se pudo eliminar el documento: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Manejar descarga de documento
  const handleDownloadDocument = async (document) => {
    try {
      // Usar la URL de descarga directa del documento
      const downloadUrl = document.downloadUrl || document.publicUrl
      
      if (!downloadUrl) {
        throw new Error('URL de descarga no disponible')
      }

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          ...(authService.getToken() && { 'Authorization': `Bearer ${authService.getToken()}` })
        }
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const tempUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = tempUrl
      link.download = document.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(tempUrl)

      toast({
        title: "✅ Descarga iniciada",
        description: `Descargando "${document.originalName}"...`,
      })
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "❌ Error al descargar",
        description: `No se pudo descargar el documento: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    fetchDocuments(newPage, pagination.limit)
  }

  // Manejar cambio de límite por página
  const handleLimitChange = (newLimit) => {
    fetchDocuments(1, newLimit)
  }

  // Manejar previsualización de documento
  const handlePreviewDocument = (document) => {
    setPreviewDocument(document)
    setShowPreviewModal(true)
  }

  // Cerrar modal de previsualización
  const handleClosePreview = () => {
    setShowPreviewModal(false)
    setPreviewDocument(null)
  }

  if (isLoading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando documentos...
          </h3>
          <p className="text-gray-600 text-center">Obteniendo documentos desde la API</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar documentos
          </h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
                     <Button onClick={() => fetchDocuments(1, 10)} variant="outline">
             <RefreshCw className="h-4 w-4 mr-2" />
             Reintentar
           </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              Documentos de Grupos ({filteredDocuments.length})
            </CardTitle>
                         <Button
               variant="outline"
               size="sm"
               onClick={() => fetchDocuments(pagination.page, pagination.limit)}
               disabled={isLoading}
               className="border-gray-300"
             >
               <RefreshCw className="h-4 w-4 mr-2" />
               Actualizar
             </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
                disabled={isLoading}
              />
            </div>

            <Select value={filterGroup} onValueChange={setFilterGroup} disabled={isLoading}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Filtrar por Grupo" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                <SelectItem value="all">Todos los Grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType} disabled={isLoading}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Filtrar por Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                <SelectItem value="all">Todos los Tipos</SelectItem>
                {fileTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-6 space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron documentos</h3>
                  <p className="text-center">Ajusta tus filtros o tu búsqueda.</p>
                </div>
              ) : (
                filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="p-6 border rounded-lg bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                                             <div className="flex-shrink-0">
                         {getFileIcon(document.originalName)}
                       </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                                                     <div>
                             <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                               {document.originalName}
                               <Badge className={getFileTypeColor(document.originalName)}>
                                 {document.originalName?.split('.').pop()?.toUpperCase()}
                               </Badge>
                             </h4>
                             <div className="flex items-center gap-2 mt-1">
                               {(document.groupInfo?.name || document.metadata?.groupName) && (
                                 <Badge variant="outline" className="border-gray-300">
                                   <FolderOpen className="h-3 w-3 mr-1" />
                                   {document.groupInfo?.name || document.metadata?.groupName}
                                 </Badge>
                               )}
                               {document.fileSize && (
                                 <Badge variant="outline" className="border-gray-300">
                                   {formatFileSize(document.fileSize)}
                                 </Badge>
                               )}
                             </div>
                           </div>
                                                     <div className="flex items-center gap-2">
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => handlePreviewDocument(document)}
                               className="text-green-600 hover:text-green-700 hover:bg-green-50"
                               title="Previsualizar documento"
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => handleDownloadDocument(document)}
                               className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                               title="Descargar documento"
                             >
                               <Download className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => {
                                 setSelectedDocument(document)
                                 setShowDeleteConfirm(true)
                               }}
                               className="text-red-600 hover:text-red-700 hover:bg-red-50"
                               title="Eliminar documento"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                        </div>

                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {document.uploadedBy && (
                             <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                               <User className="h-4 w-4 text-blue-600" />
                               <span className="font-medium">Subido por: {document.uploadedBy}</span>
                             </div>
                           )}

                           {document.createdAt && (
                             <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-md">
                               <Calendar className="h-4 w-4 text-green-600" />
                               <span className="font-medium">{formatDate(document.createdAt)}</span>
                             </div>
                           )}
                         </div>

                         {document.groupInfo?.description && (
                           <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                             <p className="text-sm text-gray-700">{document.groupInfo.description}</p>
                           </div>
                         )}

                         {document.metadata?.totalClients && (
                           <div className="bg-green-50 p-3 rounded-md border border-green-200">
                             <p className="text-sm text-gray-700">
                               <strong>Total de clientes:</strong> {document.metadata.totalClients}
                             </p>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))
              )}
                         </div>
           </ScrollArea>
         </CardContent>

         {/* Paginación */}
         {pagination.totalPages > 1 && (
           <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-700">
                   Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} documentos
                 </span>
                 <Select value={pagination.limit.toString()} onValueChange={(value) => handleLimitChange(parseInt(value))}>
                   <SelectTrigger className="w-20">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="5">5</SelectItem>
                     <SelectItem value="10">10</SelectItem>
                     <SelectItem value="20">20</SelectItem>
                     <SelectItem value="50">50</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="flex items-center gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handlePageChange(pagination.page - 1)}
                   disabled={!pagination.hasPrev}
                 >
                   Anterior
                 </Button>
                 
                 <div className="flex items-center gap-1">
                   {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                     const pageNum = i + 1
                     return (
                       <Button
                         key={pageNum}
                         variant={pagination.page === pageNum ? "default" : "outline"}
                         size="sm"
                         onClick={() => handlePageChange(pageNum)}
                         className="w-8 h-8 p-0"
                       >
                         {pageNum}
                       </Button>
                     )
                   })}
                 </div>
                 
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handlePageChange(pagination.page + 1)}
                   disabled={!pagination.hasNext}
                 >
                   Siguiente
                 </Button>
               </div>
             </div>
           </div>
         )}
              </Card>

       {/* Preview Modal */}
       {showPreviewModal && previewDocument && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <div className="flex items-center gap-3">
                 {getFileIcon(previewDocument.originalName)}
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900">
                     {previewDocument.originalName}
                   </h3>
                   <p className="text-sm text-gray-600">
                     {(previewDocument.groupInfo?.name || previewDocument.metadata?.groupName) && 
                       `Grupo: ${previewDocument.groupInfo?.name || previewDocument.metadata?.groupName}`
                     }
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   onClick={() => handleDownloadDocument(previewDocument)}
                   className="text-blue-600 hover:text-blue-700"
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Descargar
                 </Button>
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={handleClosePreview}
                   className="text-gray-600 hover:text-gray-900"
                 >
                   <X className="h-5 w-5" />
                 </Button>
               </div>
             </div>

             {/* Content */}
             <div className="flex-1 p-6 overflow-hidden">
               <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden">
                                   <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewDocument.publicUrl)}`}
                    style={{ width: '100%', height: '100%' }}
                    frameBorder="0"
                    title={`Preview de ${previewDocument.originalName}`}
                  />
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Eliminar Documento
            </AlertDialogTitle>
                         <AlertDialogDescription className="text-left">
               <div className="space-y-2">
                 <p>¿Estás seguro de que quieres eliminar <strong>"{selectedDocument?.originalName}"</strong>?</p>
                 <div className="bg-red-50 p-3 rounded-md border border-red-200">
                   <p className="text-sm text-red-700">
                     ⚠️ Esta acción es <strong>irreversible</strong> y eliminará permanentemente el documento.
                   </p>
                 </div>
               </div>
             </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false)
              setSelectedDocument(null)
            }} className="flex-1">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDocument} 
              className="bg-red-600 hover:bg-red-700 flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
