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
  Link2,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Edit,
  Search,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Image as ImageIcon,
  Globe,
  Sparkles,
  Tag
} from 'lucide-react';

const EXTRACTION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

const EXTRACTION_STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Error'
};

const LINK_TYPES = [
  { value: 'calendar', label: 'Calendario', icon: Calendar },
  { value: 'payment', label: 'Pago', icon: CreditCard },
  { value: 'form', label: 'Formulario', icon: FileText },
  { value: 'website', label: 'Sitio Web', icon: Globe },
  { value: 'other', label: 'Otro', icon: Link2 }
];

export const KnowledgeItemsContent = () => {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [itemType, setItemType] = useState('link'); // link, document
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [linkForm, setLinkForm] = useState({
    name: '',
    url: '',
    link_type: 'website',
    link_title: '',
    link_description: '',
    triggers: '',
    priority: 5,
    usage_context: '',
    usage_instructions: '',
    agent_id: ''
  });

  const [documentForm, setDocumentForm] = useState({
    file: null,
    name: '',
    triggers: '',
    priority: 5,
    usage_context: '',
    usage_instructions: '',
    agent_id: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Load knowledge items
  useEffect(() => {
    loadKnowledgeItems();
    loadAgents();
  }, []);

  const loadKnowledgeItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl('/api/knowledge-items'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al cargar elementos de conocimiento');
      }

      setKnowledgeItems(data.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar elementos de conocimiento');
      console.error('Error loading knowledge items:', err);
      setKnowledgeItems([]);
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
      if (!documentForm.name) {
        setDocumentForm({ ...documentForm, file, name: file.name.split('.')[0] });
      } else {
        setDocumentForm({ ...documentForm, file });
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
      if (!documentForm.name) {
        setDocumentForm({ ...documentForm, file, name: file.name.split('.')[0] });
      } else {
        setDocumentForm({ ...documentForm, file });
      }
    }
  };

  // Submit link form
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Parse triggers
      const triggers = linkForm.triggers
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      const payload = {
        name: linkForm.name,
        type: 'link',
        url: linkForm.url,
        link_type: linkForm.link_type,
        link_title: linkForm.link_title,
        link_description: linkForm.link_description,
        triggers,
        priority: parseInt(linkForm.priority),
        usage_context: linkForm.usage_context,
        usage_instructions: linkForm.usage_instructions,
        ...(linkForm.agent_id && { agent_id: linkForm.agent_id })
      };

      const response = await fetch(config.getApiUrl('/api/knowledge-items'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al crear el enlace');
      }

      // Reset form
      setLinkForm({
        name: '',
        url: '',
        link_type: 'website',
        link_title: '',
        link_description: '',
        triggers: '',
        priority: 5,
        usage_context: '',
        usage_instructions: '',
        agent_id: ''
      });
      setShowCreateForm(false);
      
      // Reload items
      await loadKnowledgeItems();
      
      if (window.addActivityLog) {
        window.addActivityLog(`✅ Enlace "${linkForm.name}" creado exitosamente`, 'success', 6000);
      }
    } catch (err) {
      setError(err.message || 'Error al crear el enlace');
      console.error('Error creating link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit document form
  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      if (!documentForm.file) {
        throw new Error('Debes seleccionar un archivo');
      }

      const formData = new FormData();
      formData.append('file', documentForm.file);
      formData.append('name', documentForm.name);
      
      // Parse triggers
      const triggers = documentForm.triggers
        .split(',')
        .map(t => t.trim())
        .filter(t => t);
      
      formData.append('triggers', JSON.stringify(triggers));
      formData.append('priority', documentForm.priority.toString());
      
      if (documentForm.usage_context) {
        formData.append('usage_context', documentForm.usage_context);
      }
      if (documentForm.usage_instructions) {
        formData.append('usage_instructions', documentForm.usage_instructions);
      }
      if (documentForm.agent_id) {
        formData.append('agent_id', documentForm.agent_id);
      }

      const response = await fetch(config.getApiUrl('/api/knowledge-items/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al subir el documento');
      }

      // Reset form
      setDocumentForm({
        file: null,
        name: '',
        triggers: '',
        priority: 5,
        usage_context: '',
        usage_instructions: '',
        agent_id: ''
      });
      setSelectedFile(null);
      setShowCreateForm(false);
      
      // Reload items
      await loadKnowledgeItems();
      
      if (window.addActivityLog) {
        window.addActivityLog(`✅ Documento "${documentForm.name}" subido exitosamente`, 'success', 6000);
      }
    } catch (err) {
      setError(err.message || 'Error al subir el documento');
      console.error('Error uploading document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process item
  const handleProcess = async (id) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl(`/api/knowledge-items/${id}/process`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al procesar el elemento');
      }

      if (window.addActivityLog) {
        window.addActivityLog(`✅ Procesamiento iniciado`, 'success', 4000);
      }

      // Reload after a delay
      setTimeout(() => loadKnowledgeItems(), 2000);
    } catch (err) {
      setError(err.message || 'Error al procesar el elemento');
      console.error('Error processing item:', err);
    }
  };

  // Sync item with agent
  const handleSync = async (id) => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl(`/api/knowledge-items/${id}/sync`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al sincronizar el elemento');
      }

      if (window.addActivityLog) {
        window.addActivityLog(`✅ Elemento sincronizado exitosamente`, 'success', 4000);
      }

      // Reload items
      await loadKnowledgeItems();
    } catch (err) {
      setError(err.message || 'Error al sincronizar el elemento');
      console.error('Error syncing item:', err);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este elemento de conocimiento?')) {
      return;
    }

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(config.getApiUrl(`/api/knowledge-items/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al eliminar el elemento');
      }

      if (window.addActivityLog) {
        window.addActivityLog(`✅ Elemento eliminado exitosamente`, 'success', 4000);
      }

      // Reload items
      await loadKnowledgeItems();
    } catch (err) {
      setError(err.message || 'Error al eliminar el elemento');
      console.error('Error deleting item:', err);
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'link') {
      return <Link2 className="w-5 h-5" />;
    } else {
      return <FileText className="w-5 h-5" />;
    }
  };

  const getLinkTypeIcon = (linkType) => {
    const type = LINK_TYPES.find(t => t.value === linkType);
    if (type) {
      const Icon = type.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Link2 className="w-4 h-4" />;
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setSelectedFile(null);
    setLinkForm({
      name: '',
      url: '',
      link_type: 'website',
      link_title: '',
      link_description: '',
      triggers: '',
      priority: 5,
      usage_context: '',
      usage_instructions: '',
      agent_id: ''
    });
    setDocumentForm({
      file: null,
      name: '',
      triggers: '',
      priority: 5,
      usage_context: '',
      usage_instructions: '',
      agent_id: ''
    });
    setError(null);
  };

  // Filter items by search
  const filteredItems = knowledgeItems.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.url?.toLowerCase().includes(search) ||
      item.triggers?.some(t => t.toLowerCase().includes(search))
    );
  });

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Agregar Nueva Retroalimentación
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Agrega enlaces o documentos que los agentes usarán como retroalimentación inteligente.
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
          <Tabs value={itemType} onValueChange={setItemType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Enlace
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documento
              </TabsTrigger>
            </TabsList>

            {/* Link Tab */}
            <TabsContent value="link" className="p-6">
              <form onSubmit={handleLinkSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del Elemento *
                    </label>
                    <Input
                      value={linkForm.name}
                      onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                      placeholder="Ej: Calendario de Citas"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Enlace *
                    </label>
                    <select
                      value={linkForm.link_type}
                      onChange={(e) => setLinkForm({ ...linkForm, link_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={isSubmitting}
                      required
                    >
                      {LINK_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL *
                  </label>
                  <Input
                    type="url"
                    value={linkForm.url}
                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                    placeholder="https://..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título (Opcional)
                    </label>
                    <Input
                      value={linkForm.link_title}
                      onChange={(e) => setLinkForm({ ...linkForm, link_title: e.target.value })}
                      placeholder="Agendar Cita"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridad (1-10) *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={linkForm.priority}
                      onChange={(e) => setLinkForm({ ...linkForm, priority: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción (Opcional)
                  </label>
                  <Input
                    value={linkForm.link_description}
                    onChange={(e) => setLinkForm({ ...linkForm, link_description: e.target.value })}
                    placeholder="Enlace para agendar citas con el equipo"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Palabras Clave (separadas por comas) *
                  </label>
                  <Input
                    value={linkForm.triggers}
                    onChange={(e) => setLinkForm({ ...linkForm, triggers: e.target.value })}
                    placeholder="cita, agendar, calendario, reunión"
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    El agente usará este elemento cuando detecte estas palabras en la conversación
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contexto de Uso (Opcional)
                  </label>
                  <Input
                    value={linkForm.usage_context}
                    onChange={(e) => setLinkForm({ ...linkForm, usage_context: e.target.value })}
                    placeholder="Cuando el cliente quiere agendar una cita o reunión"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instrucciones de Uso (Opcional)
                  </label>
                  <textarea
                    value={linkForm.usage_instructions}
                    onChange={(e) => setLinkForm({ ...linkForm, usage_instructions: e.target.value })}
                    placeholder="Ofrecer este enlace cuando el cliente mencione querer agendar una cita. Explicar que pueden elegir el horario que mejor les convenga."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agente (Opcional)
                  </label>
                  <select
                    value={linkForm.agent_id}
                    onChange={(e) => setLinkForm({ ...linkForm, agent_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Crear Enlace
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Document Tab */}
            <TabsContent value="document" className="p-6">
              <form onSubmit={handleDocumentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Elemento *
                  </label>
                  <Input
                    value={documentForm.name}
                    onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                    placeholder="Ej: Manual de Usuario"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Archivo (PDF, Word, Excel, Imagen) *
                  </label>
                  {!selectedFile ? (
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                        dragActive
                          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Arrastra un archivo aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Formatos soportados: PDF, Word, Excel, Imágenes (máximo 100MB)
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-purple-600" />
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
                            setDocumentForm({ ...documentForm, file: null });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Palabras Clave (separadas por comas) *
                  </label>
                  <Input
                    value={documentForm.triggers}
                    onChange={(e) => setDocumentForm({ ...documentForm, triggers: e.target.value })}
                    placeholder="manual, ayuda, instrucciones"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad (1-10) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={documentForm.priority}
                    onChange={(e) => setDocumentForm({ ...documentForm, priority: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contexto de Uso (Opcional)
                  </label>
                  <Input
                    value={documentForm.usage_context}
                    onChange={(e) => setDocumentForm({ ...documentForm, usage_context: e.target.value })}
                    placeholder="Cuando el cliente necesita ayuda"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instrucciones de Uso (Opcional)
                  </label>
                  <textarea
                    value={documentForm.usage_instructions}
                    onChange={(e) => setDocumentForm({ ...documentForm, usage_instructions: e.target.value })}
                    placeholder="Compartir este manual cuando el cliente tenga dudas sobre cómo usar el producto"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agente (Opcional)
                  </label>
                  <select
                    value={documentForm.agent_id}
                    onChange={(e) => setDocumentForm({ ...documentForm, agent_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    disabled={isSubmitting || !selectedFile}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Subir Documento
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-purple-600" />
              Retroalimentación Inteligente
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enlaces y documentos que los agentes usarán como retroalimentación durante las conversaciones.
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Elemento
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, URL o palabras clave..."
            className="pl-10"
          />
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

      {/* Knowledge Items List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600 dark:text-gray-400">Cargando elementos de retroalimentación...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'No se encontraron elementos con ese criterio de búsqueda.' : 'No hay elementos de retroalimentación creados todavía.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Primer Elemento
              </Button>
            )}
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
                    Palabras Clave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => {
                  const agent = agents.find(a => a.id === item.agent_id);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                          {item.type === 'link' ? getLinkTypeIcon(item.link_type) : getTypeIcon(item.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        {item.type === 'link' && item.url && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {item.url}
                          </a>
                        )}
                        {item.type === 'document' && item.file_name && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.file_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.triggers && item.triggers.slice(0, 3).map((trigger, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                            >
                              {trigger}
                            </span>
                          ))}
                          {item.triggers && item.triggers.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{item.triggers.length - 3} más
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[60px]">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(item.priority || 5) * 10}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {item.priority || 5}/10
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EXTRACTION_STATUS_COLORS[item.extraction_status] || EXTRACTION_STATUS_COLORS.pending}`}>
                          {EXTRACTION_STATUS_LABELS[item.extraction_status] || item.extraction_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {agent ? agent.name : 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {item.extraction_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcess(item.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Procesar
                          </Button>
                        )}
                        {item.extraction_status === 'completed' && item.agent_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(item.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Sincronizar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
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










