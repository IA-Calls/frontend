"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Label } from "./ui/label.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Progress } from "./ui/progress.tsx"
import { Badge } from "./ui/badge.tsx"
import { Separator } from "./ui/separator.tsx"
import { useToast } from "../../hooks/use-toast.ts"
import * as XLSX from "xlsx"
import {
  Trash2,
  Upload,
  FileSpreadsheet,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  CloudUpload,
  MapPin,
} from "lucide-react"

const targetFields = [
  { value: "name", label: "Nombre", color: "bg-blue-100 text-blue-800", apiField: "col_name" },
  { value: "phone", label: "Teléfono", color: "bg-green-100 text-green-800", apiField: "col_number" },
  { value: "review", label: "Reseña", color: "bg-purple-100 text-purple-800", apiField: "col_review" },
  { value: "category", label: "Categoría", color: "bg-orange-100 text-orange-800", apiField: "col_category" },
  { value: "address", label: "Dirección", color: "bg-red-100 text-red-800", apiField: "col_adress" },
  { value: "website", label: "Sitio Web", color: "bg-cyan-100 text-cyan-800", apiField: "col_web" },
  { value: "email", label: "Email", color: "bg-pink-100 text-pink-800", apiField: "col_mail" },
  { value: "latitude", label: "Lat", color: "bg-yellow-100 text-yellow-800", apiField: "col_latitude" },
  { value: "longitude", label: "Lng", color: "bg-indigo-100 text-indigo-800", apiField: "col_length" },
  { value: "location", label: "Ubicación", color: "bg-teal-100 text-teal-800", apiField: "col_ubication" }
]

export const MassUploadsContent = ({ user, group, onClose, onClientsAdded }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentFile, setCurrentFile] = useState(null)
  const [excelData, setExcelData] = useState(null)
  const [columnMappings, setColumnMappings] = useState([])
  const [processingStep, setProcessingStep] = useState("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const simulateProgress = (duration, callback) => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          callback()
          return 100
        }
        return prev + 100 / (duration / 50)
      })
    }, 50)
  }

  const processExcelFile = useCallback(
    (uploadedFile) => {
      if (!uploadedFile.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo Excel válido (.xlsx o .xls)",
          variant: "destructive",
        })
        return
      }

      setCurrentFile(uploadedFile)
      setProcessingStep("reading")

      simulateProgress(1000, () => {
        setProcessingStep("parsing")
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            simulateProgress(1500, () => {
              const data = new Uint8Array(e.target?.result)
              const workbook = XLSX.read(data, { type: "array" })
              const sheetName = workbook.SheetNames[0]
              const worksheet = workbook.Sheets[sheetName]
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

              if (jsonData.length === 0) {
                setProcessingStep("error")
                toast({
                  title: "Error",
                  description: "El archivo Excel está vacío",
                  variant: "destructive",
                })
                return
              }

              const headers = jsonData[0]
              const dataRows = jsonData.slice(1)

              setExcelData({ headers, data: dataRows })
              setColumnMappings(headers.map((header) => ({ excelColumn: header, targetField: "" })))
              setProcessingStep("mapping")
              setUploadProgress(0)

              toast({
                title: "Éxito",
                description: `Archivo cargado correctamente. ${headers.length} columnas detectadas.`,
              })
            })
          } catch (error) {
            setProcessingStep("error")
            toast({
              title: "Error",
              description: "Error al procesar el archivo Excel",
              variant: "destructive",
            })
          }
        }
        reader.readAsArrayBuffer(uploadedFile)
      })
    },
    [toast],
  )

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        processExcelFile(droppedFile)
      }
    },
    [processExcelFile],
  )

  const handleChange = useCallback(
    (e) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        processExcelFile(e.target.files[0])
      }
    },
    [processExcelFile],
  )

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const updateMapping = (index, targetField) => {
    setColumnMappings((prev) => prev.map((mapping, i) => (i === index ? { ...mapping, targetField } : mapping)))
  }

  const removeMapping = (index) => {
    setColumnMappings((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitMapping = async () => {
    if (!currentFile || !excelData) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo Excel primero",
        variant: "destructive",
      })
      return
    }

    const validMappings = columnMappings.filter((mapping) => mapping.targetField !== "")
    if (validMappings.length === 0) {
      toast({
        title: "Error",
        description: "Por favor mapea al menos una columna",
        variant: "destructive",
      })
      return
    }

    setProcessingStep("uploading")
    setIsUploading(true)

    try {
      simulateProgress(3000, async () => {
        const formData = new FormData()
        formData.append("file", currentFile)
        formData.append("group_id", group.id.toString())
        formData.append("group_name", group.name)

        // Agregar todos los campos mapeados
        targetFields.forEach((field) => {
          const mapping = validMappings.find((m) => m.targetField === field.value)
          formData.append(field.apiField, mapping ? mapping.excelColumn : "")
        })

        const response = await fetch("http://127.0.0.1:8080/clients/upload-excel", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          setProcessingStep("complete")

          // Agregar archivo a la lista de completados
          const completedFile = {
            id: Date.now(),
            name: currentFile.name,
            size: currentFile.size,
            status: "completed",
            progress: 100,
            clientsCount: result.clientsCount || 0,
            processedClients: result.clients || [],
            error: null,
          }

          setUploadedFiles((prev) => [...prev, completedFile])

          // Notificar al componente padre
          if (result.clients && result.clients.length > 0 && onClientsAdded) {
            onClientsAdded(group.id, result.clients)
          }

          toast({
            title: "Éxito",
            description: `Archivo enviado correctamente. ${result.clientsCount || 0} clientes procesados.`,
          })

          // Reset después de 2 segundos
          setTimeout(() => {
            setCurrentFile(null)
            setExcelData(null)
            setColumnMappings([])
            setProcessingStep("idle")
            setUploadProgress(0)
            setIsUploading(false)
          }, 2000)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Error en la respuesta del servidor")
        }
      })
    } catch (error) {
      setProcessingStep("error")
      setIsUploading(false)
      toast({
        title: "Error",
        description: error.message || "Error al enviar el archivo al servidor",
        variant: "destructive",
      })
    }
  }

  const resetProcess = () => {
    setCurrentFile(null)
    setExcelData(null)
    setColumnMappings([])
    setProcessingStep("idle")
    setUploadProgress(0)
    setIsUploading(false)
  }

  const getFieldColor = (fieldValue) => {
    return targetFields.find((f) => f.value === fieldValue)?.color || "bg-gray-100 text-gray-800"
  }

  const mappedCount = columnMappings.filter((m) => m.targetField !== "").length

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completado":
        return "text-green-600 bg-green-100"
      case "Error":
        return "text-red-600 bg-red-100"
      case "Procesando":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      {/* Información del Grupo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${group?.color || "bg-blue-500"}`}></div>
          <div>
            <h4 className="font-medium text-blue-900">{group?.name}</h4>
            <p className="text-sm text-blue-700">Los clientes se asociarán automáticamente a este grupo</p>
            <p className="text-xs text-blue-600 mt-1">
              ID del Grupo: <span className="font-mono">{group?.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {processingStep !== "idle" && (
        <Card className="border-2 border-dashed shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {processingStep === "error" ? (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                ) : processingStep === "complete" ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                )}
                <span className="font-semibold text-lg">
                  {processingStep === "error"
                    ? "Error en el procesamiento"
                    : processingStep === "complete"
                      ? "¡Procesamiento completado!"
                      : processingStep === "reading"
                        ? "Leyendo archivo..."
                        : processingStep === "parsing"
                          ? "Procesando datos..."
                          : processingStep === "mapping"
                            ? "Listo para mapear columnas"
                            : "Enviando al servidor..."}
                </span>
              </div>
              {processingStep !== "error" &&
                processingStep !== "complete" &&
                processingStep !== "mapping" &&
                processingStep !== "uploading" && (
                  <div className="space-y-3">
                    <Progress value={uploadProgress} className="w-full h-3" />
                    <p className="text-sm text-center text-muted-foreground font-medium">
                      {Math.round(uploadProgress)}% completado
                    </p>
                  </div>
                )}
              {processingStep === "uploading" && (
                <div className="space-y-3">
                  <Progress value={uploadProgress} className="w-full h-3" />
                  <p className="text-sm text-center text-muted-foreground font-medium">
                    Enviando al servidor... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
              {processingStep === "complete" && (
                <div className="text-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-4 py-2">
                    ✓ Archivo procesado exitosamente
                  </Badge>
                </div>
              )}
              {processingStep === "error" && (
                <div className="text-center">
                  <Button onClick={resetProcess} variant="outline" size="sm">
                    Intentar de nuevo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      {processingStep === "idle" && (
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-3">
              <CloudUpload className="h-6 w-6 text-blue-600" />
              Cargar Archivo Excel
            </CardTitle>
            <CardDescription className="text-base">
              Arrastra y suelta tu archivo Excel aquí o haz clic para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? "border-blue-400 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-blue-300 hover:bg-blue-25"
              }`}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleChange} className="hidden" />
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div
                    className={`p-4 rounded-full transition-all duration-300 ${
                      dragActive ? "bg-blue-100 scale-110" : "bg-gray-100"
                    }`}
                  >
                    <Upload className={`h-8 w-8 ${dragActive ? "text-blue-600" : "text-gray-500"}`} />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {dragActive ? "¡Suelta el archivo aquí!" : "Arrastra tu archivo Excel aquí"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    o <span className="text-blue-600 font-medium hover:underline">haz clic para seleccionar</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Formatos soportados: .xlsx, .xls</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column Headers Display */}
      {excelData && processingStep === "mapping" && (
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                  Columnas Detectadas
                </CardTitle>
                <CardDescription className="text-base">
                  Se encontraron {excelData.headers.length} columnas en tu archivo Excel
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                {excelData.headers.length} columnas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {excelData.headers.map((header, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Badge variant="outline" className="font-mono text-sm w-full justify-center">
                    {header}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column Mapping */}
      {excelData && processingStep === "mapping" && (
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-orange-600" />
                  Mapeo de Columnas
                </CardTitle>
                <CardDescription className="text-base">
                  Conecta cada columna de Excel con el campo correspondiente del sistema
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xl px-4 py-2 font-bold">
                  {mappedCount}/{columnMappings.length}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">columnas mapeadas</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="group relative">
                  <div className="flex items-center gap-6 p-5 border-2 rounded-xl hover:border-orange-200 transition-all duration-200 hover:shadow-lg bg-white">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Columna Excel
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-base px-3 py-1 bg-blue-50">
                          {mapping.excelColumn}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Campo Destino
                      </Label>
                      <Select value={mapping.targetField} onValueChange={(value) => updateMapping(index, value)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Seleccionar campo destino" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${field.color.split(" ")[0]}`} />
                                <span className="font-medium">{field.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mapping.targetField && (
                        <Badge className={`text-sm ${getFieldColor(mapping.targetField)} font-medium`}>
                          ✓ {targetFields.find((f) => f.value === mapping.targetField)?.label}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMapping(index)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-8" />
            <div className="flex justify-between items-center">
              <div className="text-base">
                {mappedCount > 0 ? (
                  <span className="text-green-600 font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {mappedCount} columnas mapeadas correctamente
                  </span>
                ) : (
                  <span className="text-muted-foreground">Mapea al menos una columna para continuar</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={resetProcess} variant="outline" size="lg">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitMapping}
                  disabled={processingStep !== "mapping" || mappedCount === 0 || isUploading}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar al Servidor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {excelData && processingStep === "mapping" && (
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
              Vista Previa de Datos
            </CardTitle>
            <CardDescription className="text-base">
              Mostrando las primeras 3 filas de {excelData.data.length} registros totales
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-xl border-2 border-gray-200 max-h-40">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    {excelData.headers.map((header, index) => (
                      <th key={index} className="border-r border-gray-200 p-4 text-left font-bold text-sm">
                        <Badge variant="outline" className="font-mono text-sm bg-white">
                          {header}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.data.slice(0, 3).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-blue-25 transition-colors border-b border-gray-100">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border-r border-gray-200 p-4 text-sm">
                          <span className="truncate block max-w-[200px] font-medium" title={cell?.toString() || ""}>
                            {cell?.toString() || (
                              <span className="text-muted-foreground italic font-normal">vacío</span>
                            )}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archivos Completados */}
      {uploadedFiles.length > 0 && (
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Archivos Procesados
            </CardTitle>
            <CardDescription className="text-base">Historial de archivos enviados al servidor</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800">{file.name}</p>
                      <p className="text-xs text-green-600">
                        ✓ {file.clientsCount} clientes enviados al grupo "{group?.name}"
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
