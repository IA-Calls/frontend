import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import config from '../../../config/environment';
import { authService } from '../../../services/authService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../call-twilio/components/ui/tabs.tsx';
import {
  Plus,
  X,
  Upload,
  FileText,
  Loader2,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Link2,
  HardDrive
} from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  synced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Error',
  synced: 'Sincronizado'
};

export const KnowledgeBaseContent = () => {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sourceType, setSourceType] = useState('excel'); // excel, database, google_sheet, pdf
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // Form states
  const [fileForm, setFileForm] = useState({
    file: null,
    name: '',
    agent_id: ''
  });

  const [databaseForm, setDatabaseForm] = useState({
    name: '',
    db_type: 'mysql',
    db_host: '',
    db_port: '',
    db_name: '',
    db_user: '',
    db_password: '',
    selected_database: '',
    selected_table: '',
    agent_id: ''
  });

  const [googleSheetForm, setGoogleSheetForm] = useState({
    name: '',
    google_sheet_url: '',
    agent_id: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Load data sources
  useEffect(() => {
    loadDataSources();
    loadAgents();
  }, []);

  const loadDataSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl('/api/data-sources'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al cargar fuentes de información');
      }

      setDataSources(data.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar fuentes de información');
      console.error('Error loading data sources:', err);
      setDataSources([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(config.getApiUrl('/api/whatsapp/agents'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        console.error('Error loading agents:', data.message);
        setAgents([]);
        return;
      }

      setAgents(data.data || []);
    } catch (err) {
      console.error('Error loading agents:', err);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!fileForm.name) {
        setFileForm({ ...fileForm, file, name: file.name.split('.')[0] });
      } else {
        setFileForm({ ...fileForm, file });
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (!fileForm.name) {
        setFileForm({ ...fileForm, file, name: file.name.split('.')[0] });
      } else {
        setFileForm({ ...fileForm, file });
      }
    }
  };

  // Submit file upload
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      if (!fileForm.file) {
        throw new Error('Debes seleccionar un archivo');
      }

      const formData = new FormData();
      formData.append('file', fileForm.file);
      formData.append('name', fileForm.name);
      if (fileForm.agent_id) {
        formData.append('agent_id', fileForm.agent_id);
      }

      const response = await fetch(config.getApiUrl('/api/data-sources/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al subir el archivo');
      }

      // Reset form
      setFileForm({ file: null, name: '', agent_id: '' });
      setSelectedFile(null);
      setShowCreateForm(false);
      
      // Reload data sources
      await loadDataSources();
      
      if (window.addActivityLog) {
        window.addActivityLog(`✅ Archivo "${fileForm.name}" subido exitosamente`, 'success', 6000);
      }
    } catch (err) {
      setError(err.message || 'Error al subir el archivo');
      console.error('Error uploading file:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit database form
  const handleDatabaseSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const payload = {
        name: databaseForm.name,
        type: 'database',
        db_type: databaseForm.db_type,
        db_host: databaseForm.db_host,
        db_port: parseInt(databaseForm.db_port),
        db_name: databaseForm.db_name,
        db_user: databaseForm.db_user,
        db_password: databaseForm.db_password,
        ...(databaseForm.agent_id && { agent_id: databaseForm.agent_id })
      };

      const response = await fetch(config.getApiUrl('/api/data-sources'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al crear la fuente de base de datos');
      }

      // Reset form
      setDatabaseForm({
        name: '',
        db_type: 'mysql',
        db_host: '',
        db_port: '',
        db_name: '',
        db_user: '',
        db_password: '',
        selected_database: '',
        selected_table: '',
        agent_id: ''
      });
      setShowCreateForm(false);
      
      // Reload data sources
      await loadDataSources();
      
      if (window.addActivityLog) {
        window.addActivityLog(`✅ Base de datos "${databaseForm.name}" creada exitosamente`, 'success', 6000);
      }
    } catch (err) {
      setError(err.message || 'Error al crear la fuente de base de datos');
      console.error('Error creating database source:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Google Sheet form
  const handleGoogleSheetSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const payload = {
        name: googleSheetForm.name,
        type: 'google_sheet',
        google_sheet_url: googleSheetForm.google_sheet_url,
        ...(googleSheetForm.agent_id && { agent_id: googleSheetForm.agent_id })
      };

      const response = await fetch(config.getApiUrl('/api/data-sources'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al crear la fuente de Google Sheet');
      }

      // Reset form
      setGoogleSheetForm({
        name: '',
        google_sheet_url: '',
        agent_id: ''
      });
      setShowCreateForm(false);
      
      // Reload data sources
      await loadDataSources();
      
      if (window.addActivityLog) {
        window.addActivityLog(`✅ Google Sheet "${googleSheetForm.name}" creado exitosamente`, 'success', 6000);
      }
    } catch (err) {
      setError(err.message || 'Error al crear la fuente de Google Sheet');
      console.error('Error creating Google Sheet source:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process data source
  const handleProcess = async (id) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl(`/api/data-sources/${id}/process`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al procesar la fuente');
      }

      if (window.addActivityLog) {
        window.addActivityLog(`✅ Procesamiento iniciado`, 'success', 4000);
      }

      // Reload after a delay
      setTimeout(() => loadDataSources(), 2000);
    } catch (err) {
      setError(err.message || 'Error al procesar la fuente');
      console.error('Error processing source:', err);
    }
  };

  // Sync data source with agent
  const handleSync = async (id) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl(`/api/data-sources/${id}/sync`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al sincronizar la fuente');
      }

      if (window.addActivityLog) {
        window.addActivityLog(`✅ Fuente sincronizada exitosamente`, 'success', 4000);
      }

      // Reload data sources
      await loadDataSources();
    } catch (err) {
      setError(err.message || 'Error al sincronizar la fuente');
      console.error('Error syncing source:', err);
    }
  };

  // Delete data source
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta fuente de información?')) {
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl(`/api/data-sources/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al eliminar la fuente');
      }

      if (window.addActivityLog) {
        window.addActivityLog(`✅ Fuente eliminada exitosamente`, 'success', 4000);
      }

      // Reload data sources
      await loadDataSources();
    } catch (err) {
      setError(err.message || 'Error al eliminar la fuente');
      console.error('Error deleting source:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'google_sheet':
        return <Link2 className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      default:
        return <HardDrive className="w-5 h-5" />;
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setSelectedFile(null);
    setFileForm({ file: null, name: '', agent_id: '' });
    setDatabaseForm({
      name: '',
      db_type: 'mysql',
      db_host: '',
      db_port: '',
      db_name: '',
      db_user: '',
      db_password: '',
      selected_database: '',
      selected_table: '',
      agent_id: ''
    });
    setGoogleSheetForm({
      name: '',
      google_sheet_url: '',
      agent_id: ''
    });
    setError(null);
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Agregar Nueva Fuente de Información
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Selecciona el tipo de fuente y completa la información requerida.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Tabs value={sourceType} onValueChange={setSourceType} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Excel / PDF
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Base de Datos
              </TabsTrigger>
              <TabsTrigger value="google_sheet" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Google Sheet
              </TabsTrigger>
            </TabsList>

            {/* Excel/PDF Upload Tab */}
            <TabsContent value="excel" className="p-6">
              <form onSubmit={handleFileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Fuente *
                  </label>
                  <Input
                    value={fileForm.name}
                    onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })}
                    placeholder="Ej: Catálogo de Productos"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agente (Opcional)
                  </label>
                  <select
                    value={fileForm.agent_id}
                    onChange={(e) => setFileForm({ ...fileForm, agent_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting || loadingAgents}
                  >
                    <option value="">Ninguno (asignar después)</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Archivo (Excel o PDF) *
                  </label>
                  {!selectedFile ? (
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                        dragActive
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Arrastra un archivo aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Formatos soportados: .xlsx, .xls, .pdf (máximo 50MB)
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedFile.name.endsWith('.pdf') ? (
                            <FileText className="h-8 w-8 text-red-600" />
                          ) : (
                            <FileSpreadsheet className="h-8 w-8 text-green-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setFileForm({ ...fileForm, file: null });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedFile || !fileForm.name.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Subir Archivo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Database Tab */}
            <TabsContent value="database" className="p-6">
              <form onSubmit={handleDatabaseSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de la Fuente *
                    </label>
                    <Input
                      value={databaseForm.name}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, name: e.target.value })}
                      placeholder="Ej: BD Clientes"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Base de Datos *
                    </label>
                    <select
                      value={databaseForm.db_type}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, db_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                      required
                    >
                      <option value="mysql">MySQL</option>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mssql">SQL Server</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Host *
                    </label>
                    <Input
                      value={databaseForm.db_host}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, db_host: e.target.value })}
                      placeholder="localhost o IP"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Puerto *
                    </label>
                    <Input
                      type="number"
                      value={databaseForm.db_port}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, db_port: e.target.value })}
                      placeholder="3306"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de BD *
                    </label>
                    <Input
                      value={databaseForm.db_name}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, db_name: e.target.value })}
                      placeholder="nombre_bd"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Usuario *
                    </label>
                    <Input
                      value={databaseForm.db_user}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, db_user: e.target.value })}
                      placeholder="usuario"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña *
                  </label>
                  <Input
                    type="password"
                    value={databaseForm.db_password}
                    onChange={(e) => setDatabaseForm({ ...databaseForm, db_password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agente (Opcional)
                  </label>
                  <select
                    value={databaseForm.agent_id}
                    onChange={(e) => setDatabaseForm({ ...databaseForm, agent_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting || loadingAgents}
                  >
                    <option value="">Ninguno (asignar después)</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Crear Fuente de BD
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Google Sheet Tab */}
            <TabsContent value="google_sheet" className="p-6">
              <form onSubmit={handleGoogleSheetSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Fuente *
                  </label>
                  <Input
                    value={googleSheetForm.name}
                    onChange={(e) => setGoogleSheetForm({ ...googleSheetForm, name: e.target.value })}
                    placeholder="Ej: Hoja de Productos"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL de Google Sheet *
                  </label>
                  <Input
                    type="url"
                    value={googleSheetForm.google_sheet_url}
                    onChange={(e) => setGoogleSheetForm({ ...googleSheetForm, google_sheet_url: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Asegúrate de que la hoja sea de acceso público o compartida con el servicio.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agente (Opcional)
                  </label>
                  <select
                    value={googleSheetForm.agent_id}
                    onChange={(e) => setGoogleSheetForm({ ...googleSheetForm, agent_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting || loadingAgents}
                  >
                    <option value="">Ninguno (asignar después)</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Crear Fuente de Google Sheet
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bases de Conocimiento
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona las fuentes de información para tus agentes de WhatsApp.
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Agregar Fuente
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Error</p>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Data Sources List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Cargando fuentes de información...</p>
          </div>
        ) : dataSources.length === 0 ? (
          <div className="p-8 text-center">
            <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No hay fuentes de información creadas todavía.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Agregar Primera Fuente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {dataSources.map((source) => {
                  const agent = agents.find(a => a.id === source.agent_id);
                  const createdAt = source.created_at ? new Date(source.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A';

                  return (
                    <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                          {getTypeIcon(source.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {source.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {source.type === 'database' && source.db_name}
                          {source.type === 'excel' && source.file_name}
                          {source.type === 'pdf' && source.file_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[source.status] || STATUS_COLORS.pending}`}>
                          {STATUS_LABELS[source.status] || source.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {agent ? agent.name : 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {source.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcess(source.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Procesar
                          </Button>
                        )}
                        {source.status === 'completed' && source.agent_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(source.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Sincronizar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(source.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

