"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Label } from "./ui/label.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { Progress } from "./ui/progress.tsx"
import { Badge } from "./ui/badge.tsx"
import { Separator } from "./ui/separator.tsx"
import './global.css';
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
} from "lucide-react"
import { useToast } from "../../hooks/use-toast.ts"
import * as XLSX from "xlsx"

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
  { value: "location", label: "Ubicación", color: "bg-teal-100 text-teal-800", apiField: "col_ubication" },
]

export default function ExcelMapper() {
  const [file, setFile] = useState(null)
  const [excelData, setExcelData] = useState(null)
  const [columnMappings, setColumnMappings] = useState([])
  const [processingStep, setProcessingStep] = useState("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
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

  const processFile = useCallback(
    (uploadedFile) => {
      if (!uploadedFile.name.match(/\.(xlsx|xls)$/)) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo Excel válido (.xlsx o .xls)",
          variant: "destructive",
        })
        return
      }

      setFile(uploadedFile)
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
              setProcessingStep("idle")
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

  const handleFileUpload = useCallback(
    (event) => {
      const uploadedFile = event.target.files?.[0]
      if (uploadedFile) {
        processFile(uploadedFile)
      }
    },
    [processFile],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        processFile(droppedFile)
      }
    },
    [processFile],
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

  const handleSubmit = async () => {
    if (!file || !excelData) {
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

    try {
      simulateProgress(3000, async () => {
        const formData = new FormData()
        formData.append("file", file)
        
        // Add all required fields with either mapped value or empty string
        targetFields.forEach((field) => {
          const mapping = validMappings.find(m => m.targetField === field.value)
          formData.append(field.apiField, mapping ? mapping.excelColumn : "")
        })

        const response = await fetch("https://excel-api-754698887417.us-central1.run.app/clients/upload-excel", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          setProcessingStep("complete")
          toast({
            title: "Éxito",
            description: "Archivo enviado correctamente al servidor",
          })

          setTimeout(() => {
            setFile(null)
            setExcelData(null)
            setColumnMappings([])
            setProcessingStep("idle")
            setUploadProgress(0)
          }, 2000)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Error en la respuesta del servidor")
        }
      })
    } catch (error) {
      setProcessingStep("error")
      toast({
        title: "Error",
        description: error.message || "Error al enviar el archivo al servidor",
        variant: "destructive",
      })
    }
  }

  const getFieldColor = (fieldValue) => {
    return targetFields.find((f) => f.value === fieldValue)?.color || "bg-gray-100 text-gray-800"
  }

  const mappedCount = columnMappings.filter((m) => m.targetField !== "").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Mapeo de Columnas Excel</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sube un archivo Excel y mapea las columnas a los campos correspondientes para procesarlos en el sistema
          </p>
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
                            : "Enviando al servidor..."}
                  </span>
                </div>

                {processingStep !== "error" && processingStep !== "complete" && (
                  <div className="space-y-3">
                    <Progress value={uploadProgress} className="w-full h-3" />
                    <p className="text-sm text-center text-muted-foreground font-medium">
                      {Math.round(uploadProgress)}% completado
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drag & Drop Upload Area */}
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
                isDragOver
                  ? "border-blue-400 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-blue-300 hover:bg-blue-25"
              } ${processingStep !== "idle" ? "opacity-50 pointer-events-none" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={processingStep !== "idle"}
              />

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div
                    className={`p-4 rounded-full transition-all duration-300 ${
                      isDragOver ? "bg-blue-100 scale-110" : "bg-gray-100"
                    }`}
                  >
                    <Upload className={`h-8 w-8 ${isDragOver ? "text-blue-600" : "text-gray-500"}`} />
                  </div>
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {isDragOver ? "¡Suelta el archivo aquí!" : "Arrastra tu archivo Excel aquí"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    o <span className="text-blue-600 font-medium hover:underline">haz clic para seleccionar</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Formatos soportados: .xlsx, .xls</p>
                </div>
              </div>
            </div>

            {file && (
              <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">{file.name}</p>
                  <p className="text-sm text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Cargado
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column Headers Display */}
        {excelData && (
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
        {excelData && (
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <ArrowRight className="h-6 w-6 text-orange-600" />
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
              <div className="space-y-4">
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

                <Button
                  onClick={handleSubmit}
                  disabled={processingStep !== "idle" || mappedCount === 0}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  size="lg"
                >
                  {processingStep === "uploading" ? (
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
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {excelData && (
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
              <CardTitle className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                Vista Previa de Datos
              </CardTitle>
              <CardDescription className="text-base">
                Mostrando las primeras 5 filas de {excelData.data.length} registros totales
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
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
                    {excelData.data.slice(0, 5).map((row, rowIndex) => (
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

              {excelData.data.length > 5 && (
                <div className="mt-6 text-center">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    +{excelData.data.length - 5} filas más en el archivo...
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}