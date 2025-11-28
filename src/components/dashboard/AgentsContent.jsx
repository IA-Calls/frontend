import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import config from '../../config/environment';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './call-twilio/components/ui/tabs.tsx';
import { Slider } from './call-twilio/components/ui/slider.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './call-twilio/components/ui/select.tsx';
import { cn } from '../../lib/utils';
import { 
  Plus, 
  X, 
  Upload, 
  FileText, 
  Mic, 
  Brain,
  Loader2,
  Trash2,
  RefreshCw,
  Sparkles,
  Play,
  Pause,
  Globe
} from 'lucide-react';

export const AgentsContent = ({ user }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    // Agente tab
    name: '',
    prompt_text: '',
    agent_first_message: '',
    agent_language: 'es',
    prompt_temperature: 0.5,
    prompt_ignore_default_personality: false,
    
    // Voz tab
    asr_quality: 'high',
    tts_stability: 0.6,
    tts_speed: 1.1,
    tts_similarity_boost: 0.85,
    tts_voice_id: 'WOSzFvlJRm2hkYb3KA5w',
    tts_optimize_streaming_latency: 3,
    
    // Bases de conocimiento
    prompt_knowledge_base: []
  });

  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  
  // Estados para creación con IA
  const [showAICreateForm, setShowAICreateForm] = useState(false);
  const [isSubmittingAI, setIsSubmittingAI] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    name: '',
    prompt: '',
    tts_voice_id: 'WOSzFvlJRm2hkYb3KA5w'
  });

  // Estado para controlar el audio que se está reproduciendo
  const [playingPreview, setPlayingPreview] = useState(null);
  const audioRef = useRef(null);
  const preventSelectionRef = useRef(false);

  // Load voices function
  const loadVoices = useCallback(async () => {
    setLoadingVoices(true);
    try {
      const response = await fetch(config.getApiUrl('/api/agents/voices'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al cargar voces');
      }

      const voicesList = data.data?.voices || [];
      setVoices(voicesList);
    } catch (err) {
      console.error('Error loading voices:', err);
      setError(err.message || 'Error al cargar voces disponibles');
      setVoices([]);
    } finally {
      setLoadingVoices(false);
    }
  }, []);

  // Fetch agents
  useEffect(() => {
    loadAgents();
  }, []);

  // Load voices when form is opened
  useEffect(() => {
    if (showCreateForm) {
      loadVoices();
    }
  }, [showCreateForm, loadVoices]);

  // Load voices when AI form is opened
  useEffect(() => {
    if (showAICreateForm) {
      loadVoices();
    }
  }, [showAICreateForm, loadVoices]);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.getApiUrl('/api/agents/list'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      // Verificar si la respuesta tiene success: false
      if (data.success === false) {
        throw new Error(data.message || 'Error al cargar agentes');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar agentes');
      }

      // Acceder a data.data.raw_data.agents para obtener datos completos con created_at_unix_secs
      const rawAgents = data.data?.raw_data?.agents || data.data?.agents || data.agents || [];
      setAgents(rawAgents);
    } catch (err) {
      setError(err.message || 'Error al cargar agentes');
      console.error('Error loading agents:', err);
      setAgents([]); // Asegurar que agents esté vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(value) ? value[0] : value
    }));
  };

  // Drag and drop handlers
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

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newFiles = files.map(file => ({
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: 'file',
      usage_mode: 'auto',
      file: file
    }));

    setKnowledgeBaseFiles(prev => [...prev, ...newFiles]);
  };

  const removeKnowledgeBaseFile = (id) => {
    setKnowledgeBaseFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare knowledge base array
      const prompt_knowledge_base = knowledgeBaseFiles.map(file => ({
        type: file.type || 'file',
        name: file.name,
        id: file.id,
        usage_mode: file.usage_mode || 'auto'
      }));

      const payload = {
        name: formData.name,
        asr_quality: formData.asr_quality,
        tts_optimize_streaming_latency: formData.tts_optimize_streaming_latency,
        tts_stability: formData.tts_stability,
        tts_speed: formData.tts_speed,
        tts_similarity_boost: formData.tts_similarity_boost,
        tts_voice_id: formData.tts_voice_id,
        agent_first_message: formData.agent_first_message,
        agent_language: formData.agent_language,
        prompt_text: formData.prompt_text,
        prompt_temperature: formData.prompt_temperature,
        prompt_ignore_default_personality: formData.prompt_ignore_default_personality,
        prompt_knowledge_base: prompt_knowledge_base
      };

      const response = await fetch(config.getApiUrl('/api/create-agent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el agente');
      }

      // Reset form
      setFormData({
        name: '',
        prompt_text: '',
        agent_first_message: '',
        agent_language: 'es',
        prompt_temperature: 0.5,
        prompt_ignore_default_personality: false,
        asr_quality: 'high',
        tts_stability: 0.6,
        tts_speed: 1.1,
        tts_similarity_boost: 0.85,
        tts_voice_id: 'WOSzFvlJRm2hkYb3KA5w',
        tts_optimize_streaming_latency: 3,
        prompt_knowledge_base: []
      });
      setKnowledgeBaseFiles([]);
      setShowCreateForm(false);
      
      // Reload agents
      await loadAgents();
    } catch (err) {
      setError(err.message);
      console.error('Error creating agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar un agente específico por ID
  const loadAgentById = async (agentId) => {
    setLoadingAgent(true);
    setError(null);
    try {
      const response = await fetch(config.getApiUrl(`/api/agents/${agentId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al cargar el agente');
      }

      // Mapear los datos de la API al formato del formulario
      const agentData = data.data;
      const configData = agentData.conversation_config || {};
      const agentConfig = configData.agent || {};
      const promptConfig = agentConfig.prompt || {};
      const ttsConfig = configData.tts || {};
      const asrConfig = configData.asr || {};

      const mappedData = {
        name: agentData.name || '',
        prompt_text: promptConfig.prompt || '',
        agent_first_message: agentConfig.first_message || '',
        agent_language: agentConfig.language || 'es',
        prompt_temperature: promptConfig.temperature || 0.5,
        prompt_ignore_default_personality: false, // No disponible en la API
        asr_quality: asrConfig.quality || 'high',
        tts_stability: ttsConfig.stability || 0.6,
        tts_speed: ttsConfig.speed || 1.1,
        tts_similarity_boost: ttsConfig.similarity_boost || 0.85,
        tts_voice_id: ttsConfig.voice_id || '',
        tts_optimize_streaming_latency: ttsConfig.optimize_streaming_latency || 3,
        prompt_knowledge_base: promptConfig.knowledge_base || []
      };

      setFormData(mappedData);
      setOriginalFormData(JSON.parse(JSON.stringify(mappedData))); // Deep copy
      
      // Mapear knowledge base a formato de archivos
      const kbFiles = (promptConfig.knowledge_base || []).map((kb, index) => ({
        id: kb.id || `kb_${Date.now()}_${index}`,
        name: kb.name || 'Knowledge Base',
        type: kb.type || 'file',
        usage_mode: kb.usage_mode || 'auto'
      }));
      setKnowledgeBaseFiles(kbFiles);
      
      setSelectedAgentId(agentId);
      setShowCreateForm(true);
    } catch (err) {
      setError(err.message || 'Error al cargar el agente');
      console.error('Error loading agent:', err);
    } finally {
      setLoadingAgent(false);
    }
  };

  // Verificar si hay cambios en el formulario
  const hasChanges = () => {
    if (!originalFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  // Actualizar agente
  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Preparar el payload para PATCH
      const payload = {
        name: formData.name,
        conversation_config: {
          asr: {
            quality: formData.asr_quality
          },
          tts: {
            voice_id: formData.tts_voice_id,
            stability: formData.tts_stability,
            speed: formData.tts_speed,
            similarity_boost: formData.tts_similarity_boost,
            optimize_streaming_latency: formData.tts_optimize_streaming_latency
          },
          agent: {
            first_message: formData.agent_first_message,
            language: formData.agent_language,
            prompt: {
              prompt: formData.prompt_text,
              temperature: formData.prompt_temperature,
              knowledge_base: knowledgeBaseFiles.map(file => ({
                type: file.type || 'file',
                name: file.name,
                id: file.id,
                usage_mode: file.usage_mode || 'auto'
              }))
            }
          }
        }
      };

      const response = await fetch(config.getApiUrl(`/api/agents/${selectedAgentId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al actualizar el agente');
      }

      // Actualizar el original form data
      setOriginalFormData(JSON.parse(JSON.stringify(formData)));
      
      // Recargar la lista de agentes
      await loadAgents();
      
      // Opcional: mostrar mensaje de éxito
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al actualizar el agente');
      console.error('Error updating agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setSelectedAgentId(null);
    setOriginalFormData(null);
    setFormData({
      name: '',
      prompt_text: '',
      agent_first_message: '',
      agent_language: 'es',
      prompt_temperature: 0.5,
      prompt_ignore_default_personality: false,
      asr_quality: 'high',
      tts_stability: 0.6,
      tts_speed: 1.1,
      tts_similarity_boost: 0.85,
      tts_voice_id: 'WOSzFvlJRm2hkYb3KA5w',
      tts_optimize_streaming_latency: 3,
      prompt_knowledge_base: []
    });
    setKnowledgeBaseFiles([]);
    setError(null);
  };

  // Función para crear agente con IA
  const handleCreateWithAI = async (e) => {
    e.preventDefault();
    setIsSubmittingAI(true);
    setError(null);

    // Validar campos obligatorios
    if (!aiFormData.name.trim()) {
      setError('El nombre del agente es obligatorio');
      setIsSubmittingAI(false);
      return;
    }

    if (!aiFormData.prompt.trim()) {
      setError('El prompt es obligatorio');
      setIsSubmittingAI(false);
      return;
    }

    if (!aiFormData.tts_voice_id) {
      setError('La voz es obligatoria');
      setIsSubmittingAI(false);
      return;
    }

    try {
      const agentName = aiFormData.name.trim();
      const payload = {
        name: agentName,
        prompt: aiFormData.prompt.trim(),
        tts_voice_id: aiFormData.tts_voice_id
      };

      const response = await fetch(config.getApiUrl('/api/agents/create-with-prompt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success === false || !response.ok) {
        throw new Error(data.message || 'Error al crear el agente con IA');
      }

      // Guardar el nombre antes de resetear para el mensaje de éxito
      const createdAgentName = agentName;

      // Reset form
      setAiFormData({
        name: '',
        prompt: '',
        tts_voice_id: 'WOSzFvlJRm2hkYb3KA5w'
      });
      setShowAICreateForm(false);
      setError(null);
      
      // Reload agents
      await loadAgents();

      // Mostrar mensaje de éxito si existe la función
      if (window.addActivityLog) {
        window.addActivityLog(`✅ Agente "${createdAgentName}" creado exitosamente con IA`, 'success', 6000);
      }
    } catch (err) {
      setError(err.message || 'Error al crear el agente con IA');
      console.error('Error creating agent with AI:', err);
    } finally {
      setIsSubmittingAI(false);
    }
  };

  const handleAICancel = () => {
    setShowAICreateForm(false);
    setAiFormData({
      name: '',
      prompt: '',
      tts_voice_id: 'WOSzFvlJRm2hkYb3KA5w'
    });
    setError(null);
  };

  // Función helper para obtener idiomas únicos de una voz
  const getUniqueLanguages = (voice) => {
    if (!voice.verified_languages || voice.verified_languages.length === 0) {
      return [];
    }
    const languages = new Set();
    voice.verified_languages.forEach(lang => {
      languages.add(lang.language);
    });
    return Array.from(languages);
  };

  // Función helper para obtener el preview URL para un idioma específico (preferir español, luego inglés, luego el primero)
  const getPreviewUrl = (voice, preferredLanguage = 'es') => {
    if (!voice.verified_languages || voice.verified_languages.length === 0) {
      return null;
    }
    
    // Buscar preview para el idioma preferido
    const preferredLang = voice.verified_languages.find(l => l.language === preferredLanguage);
    if (preferredLang && preferredLang.preview_url) {
      return preferredLang.preview_url;
    }
    
    // Buscar preview en inglés
    const englishLang = voice.verified_languages.find(l => l.language === 'en');
    if (englishLang && englishLang.preview_url) {
      return englishLang.preview_url;
    }
    
    // Usar el primer preview disponible
    const firstLang = voice.verified_languages.find(l => l.preview_url);
    return firstLang?.preview_url || null;
  };

  // Función para reproducir/pausar preview
  const handlePlayPreview = (voiceId, previewUrl, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Marcar que no se debe seleccionar el item
    preventSelectionRef.current = true;
    
    // Resetear después de un breve delay
    setTimeout(() => {
      preventSelectionRef.current = false;
    }, 100);
    
    if (playingPreview === voiceId) {
      // Pausar si ya está reproduciendo
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingPreview(null);
    } else {
      // Detener cualquier audio que esté reproduciendo
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Reproducir nuevo audio
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      setPlayingPreview(voiceId);
      
      audio.play().catch(err => {
        console.error('Error playing preview:', err);
        setPlayingPreview(null);
      });
      
      audio.onended = () => {
        setPlayingPreview(null);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setPlayingPreview(null);
        audioRef.current = null;
      };
    }
  };

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Modal de creación con IA
  if (showAICreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Crear Agente con IA
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Crea un agente de forma rápida usando inteligencia artificial. Solo necesitas proporcionar el nombre, un prompt descriptivo y seleccionar la voz.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleAICancel}
            disabled={isSubmittingAI}
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleCreateWithAI} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Agente *
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                Asigna un nombre descriptivo que identifique fácilmente a este agente.
              </p>
              <Input
                value={aiFormData.name}
                onChange={(e) => setAiFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Agente de Ventas"
                required
                disabled={isSubmittingAI}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompt para la IA *
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                Describe el tipo de agente que quieres crear. La IA generará automáticamente la configuración completa del agente basándose en tu descripción.
              </p>
              <textarea
                value={aiFormData.prompt}
                onChange={(e) => setAiFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Crea un agente de ventas profesional que se especialice en productos tecnológicos"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows="4"
                required
                disabled={isSubmittingAI}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voz *
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                Selecciona la voz que utilizará el agente para comunicarse. Cada voz muestra los idiomas disponibles y puedes escuchar un preview.
              </p>
              {loadingVoices ? (
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Cargando voces...</span>
                </div>
              ) : voices.length > 0 ? (
                <Select
                  value={aiFormData.tts_voice_id}
                  onValueChange={(value) => setAiFormData(prev => ({ ...prev, tts_voice_id: value }))}
                  disabled={isSubmittingAI}
                >
                  <SelectTrigger className="w-full h-auto min-h-[3rem] px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <SelectValue>
                      {(() => {
                        const selectedVoice = voices.find(v => v.voice_id === aiFormData.tts_voice_id);
                        if (!selectedVoice) return "Selecciona una voz...";
                        return selectedVoice.name;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] w-full min-w-[var(--radix-select-trigger-width)]">
                    {voices.map((voice) => {
                      const uniqueLanguages = getUniqueLanguages(voice);
                      const previewUrl = getPreviewUrl(voice, 'es');
                      const isPlaying = playingPreview === voice.voice_id;
                      
                      return (
                        <SelectItem
                          key={voice.voice_id}
                          value={voice.voice_id}
                          className="py-3 pr-2 cursor-pointer"
                          disabled={isSubmittingAI}
                          onSelect={(e) => {
                            if (preventSelectionRef.current) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="flex flex-col gap-1.5 w-full -ml-6">
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="font-medium text-sm">{voice.name}</span>
                            </div>
                            
                            {uniqueLanguages.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 ml-6">
                                <Globe className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                {uniqueLanguages.map((lang) => {
                                  const langInfo = voice.verified_languages.find(l => l.language === lang);
                                  const accent = langInfo?.accent;
                                  return (
                                    <span
                                      key={lang}
                                      className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                    >
                                      {lang.toUpperCase()}{accent && ` (${accent})`}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            
                            {previewUrl && (
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!isSubmittingAI) {
                                    handlePlayPreview(voice.voice_id, previewUrl, e);
                                  }
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!isSubmittingAI) {
                                    handlePlayPreview(voice.voice_id, previewUrl, e);
                                  }
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!isSubmittingAI) {
                                    handlePlayPreview(voice.voice_id, previewUrl, e);
                                  }
                                }}
                                disabled={isSubmittingAI}
                                className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors ml-6 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isPlaying ? (
                                  <>
                                    <Pause className="h-3 w-3" />
                                    <span>Pausar preview</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3 w-3" />
                                    <span>Escuchar preview</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                    No hay voces disponibles. Por favor, intenta recargar.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadVoices}
                    className="w-full"
                    disabled={isSubmittingAI}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recargar Voces
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAICancel}
              disabled={isSubmittingAI}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingAI || !aiFormData.name.trim() || !aiFormData.prompt.trim() || !aiFormData.tts_voice_id}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
            >
              {isSubmittingAI ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Crear Agente con IA
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (showCreateForm) {
    const isEditMode = selectedAgentId !== null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isEditMode ? 'Editar Agente' : 'Crear Nuevo Agente'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode 
                ? 'Modifica los parámetros del agente. Los cambios se guardarán cuando presiones "Guardar Cambios".'
                : 'Configura todos los parámetros del agente en las siguientes secciones.'}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting || loadingAgent}
          >
            <X className="w-4 h-4 mr-2" />
            {isEditMode ? 'Cerrar' : 'Cancelar'}
          </Button>
        </div>

        {loadingAgent && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
              <p className="text-sm text-blue-600 dark:text-blue-400">Cargando información del agente...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={isEditMode ? handleUpdateAgent : handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Tabs defaultValue="agente" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="agente" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Agente
                </TabsTrigger>
                <TabsTrigger value="voz" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Voz
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Bases de Conocimiento
                </TabsTrigger>
              </TabsList>

              {/* Agente Tab */}
              <TabsContent value="agente" className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del Agente *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Asigna un nombre descriptivo que identifique fácilmente a este agente. Este nombre aparecerá en las llamadas y en la lista de agentes.
                    </p>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ej: Agente de Ventas"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prompt del Agente *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Define la personalidad, comportamiento y contexto del agente. Describe cómo debe hablar, qué tono usar, qué información debe compartir y cómo debe interactuar con los clientes.
                    </p>
                    <textarea
                      value={formData.prompt_text}
                      onChange={(e) => handleInputChange('prompt_text', e.target.value)}
                      placeholder="Eres un agente de ventas profesional. Ayuda a los clientes con información sobre productos y servicios."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows="4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primer Mensaje del Agente *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      El saludo inicial que el agente dirá cuando responda una llamada. Debe ser claro, amigable y profesional.
                    </p>
                    <Input
                      value={formData.agent_first_message}
                      onChange={(e) => handleInputChange('agent_first_message', e.target.value)}
                      placeholder="Hola, ¿cómo puedo ayudarte hoy?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Idioma del Agente *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Selecciona el idioma principal en el que el agente se comunicará con los clientes. Esto afecta tanto el habla como la comprensión del agente.
                    </p>
                    <select
                      value={formData.agent_language}
                      onChange={(e) => handleInputChange('agent_language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temperatura del Prompt: {formData.prompt_temperature.toFixed(1)}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Controla la creatividad y variabilidad de las respuestas del agente. Valores bajos generan respuestas más deterministas y consistentes, mientras que valores altos permiten más creatividad y variación.
                    </p>
                    <Slider
                      value={[formData.prompt_temperature]}
                      onValueChange={(value) => handleSliderChange('prompt_temperature', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      <span>Más determinista</span>
                      <span>Más creativo</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        id="prompt_ignore_default_personality"
                        checked={formData.prompt_ignore_default_personality}
                        onChange={(e) => handleInputChange('prompt_ignore_default_personality', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="prompt_ignore_default_personality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ignorar personalidad por defecto
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-7 leading-relaxed">
                      Si está activado, el agente ignorará la personalidad predeterminada del sistema y usará únicamente la personalidad definida en el prompt.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Voz Tab */}
              <TabsContent value="voz" className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estabilidad: {formData.tts_stability.toFixed(1)}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Controla qué tan variada es la entonación de la voz. Valores bajos hacen la voz más expresiva y natural, mientras que valores altos la hacen más consistente y predecible.
                    </p>
                    <Slider
                      value={[formData.tts_stability]}
                      onValueChange={(value) => handleSliderChange('tts_stability', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      <span>Más expresivo</span>
                      <span>Más consistente</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Velocidad: {formData.tts_speed.toFixed(1)}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Ajusta la velocidad de habla del agente. Valores más bajos hacen que hable más despacio (útil para información importante), mientras que valores más altos aceleran el habla.
                    </p>
                    <Slider
                      value={[formData.tts_speed]}
                      onValueChange={(value) => handleSliderChange('tts_speed', value)}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      <span>Más lento</span>
                      <span>Más rápido</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Similitud: {formData.tts_similarity_boost.toFixed(2)}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Controla qué tan similar suena la voz generada a la voz original del modelo. Valores altos hacen que la voz sea más fiel al modelo original, mientras que valores bajos permiten más variación.
                    </p>
                    <Slider
                      value={[formData.tts_similarity_boost]}
                      onValueChange={(value) => handleSliderChange('tts_similarity_boost', value)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      <span>Bajo</span>
                      <span>Alto</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Optimizar Latencia de Streaming: {formData.tts_optimize_streaming_latency}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Optimiza el tiempo de respuesta del audio en tiempo real. Valores más altos reducen la latencia pero pueden afectar ligeramente la calidad del audio. Ideal para conversaciones en tiempo real.
                    </p>
                    <Slider
                      value={[formData.tts_optimize_streaming_latency]}
                      onValueChange={(value) => handleSliderChange('tts_optimize_streaming_latency', value)}
                      min={0}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      <span>Menos optimizado</span>
                      <span>Más optimizado</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Calidad ASR *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Define la calidad del reconocimiento de voz (ASR - Automatic Speech Recognition). Calidad alta mejora la precisión pero puede aumentar el tiempo de procesamiento. Calidad baja es más rápida pero menos precisa.
                    </p>
                    <select
                      value={formData.asr_quality}
                      onChange={(e) => handleInputChange('asr_quality', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Voz *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                      Selecciona la voz que utilizará el agente para comunicarse. Cada voz muestra los idiomas disponibles y puedes escuchar un preview.
                    </p>
                    {loadingVoices ? (
                      <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Cargando voces...</span>
                      </div>
                    ) : voices.length > 0 ? (
                      <Select
                        value={formData.tts_voice_id}
                        onValueChange={(value) => handleInputChange('tts_voice_id', value)}
                      >
                        <SelectTrigger className="w-full h-auto min-h-[3rem] px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          <SelectValue>
                            {(() => {
                              const selectedVoice = voices.find(v => v.voice_id === formData.tts_voice_id);
                              if (!selectedVoice) return "Selecciona una voz...";
                              return selectedVoice.name;
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px] w-full min-w-[var(--radix-select-trigger-width)]">
                          {voices.map((voice) => {
                            const uniqueLanguages = getUniqueLanguages(voice);
                            const previewUrl = getPreviewUrl(voice, formData.agent_language || 'es');
                            const isPlaying = playingPreview === voice.voice_id;
                            
                            return (
                              <SelectItem
                                key={voice.voice_id}
                                value={voice.voice_id}
                                className="py-3 pr-2 cursor-pointer"
                                onSelect={(e) => {
                                  if (preventSelectionRef.current) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <div className="flex flex-col gap-1.5 w-full -ml-6">
                                  <div className="flex items-center gap-2">
                                    <Mic className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="font-medium text-sm">{voice.name}</span>
                                  </div>
                                  
                                  {uniqueLanguages.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 ml-6">
                                      <Globe className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                      {uniqueLanguages.map((lang) => {
                                        const langInfo = voice.verified_languages.find(l => l.language === lang);
                                        const accent = langInfo?.accent;
                                        return (
                                          <span
                                            key={lang}
                                            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                          >
                                            {lang.toUpperCase()}{accent && ` (${accent})`}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {previewUrl && (
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handlePlayPreview(voice.voice_id, previewUrl, e);
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handlePlayPreview(voice.voice_id, previewUrl, e);
                                      }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handlePlayPreview(voice.voice_id, previewUrl, e);
                                      }}
                                      className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ml-6 mt-0.5"
                                    >
                                      {isPlaying ? (
                                        <>
                                          <Pause className="h-3 w-3" />
                                          <span>Pausar preview</span>
                                        </>
                                      ) : (
                                        <>
                                          <Play className="h-3 w-3" />
                                          <span>Escuchar preview</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          No hay voces disponibles. Por favor, intenta recargar.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadVoices}
                          className="mt-2 w-full"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Recargar Voces
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Bases de Conocimiento Tab */}
              <TabsContent value="knowledge" className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bases de Conocimiento
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Arrastra y suelta archivos o haz clic para seleccionar
                    </p>

                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer",
                        dragActive
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('knowledge-file-input')?.click()}
                    >
                      <input
                        id="knowledge-file-input"
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Soporta múltiples archivos
                      </p>
                    </div>

                    {knowledgeBaseFiles.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Archivos seleccionados ({knowledgeBaseFiles.length})
                        </h4>
                        <div className="space-y-2">
                          {knowledgeBaseFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {file.type} • {file.usage_mode}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeKnowledgeBaseFile(file.id)}
                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting || loadingAgent}
            >
              {isEditMode ? 'Cerrar' : 'Cancelar'}
            </Button>
            {isEditMode ? (
              <Button
                type="submit"
                disabled={isSubmitting || loadingAgent || !hasChanges() || !formData.name || !formData.prompt_text}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar Cambios
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.prompt_text}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Agente
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
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
              Gestión de Agentes
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Administra y configura tus agentes de IA.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowAICreateForm(true)}
              variant="secondary"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Crear con IA
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Crear Agente
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Error al cargar agentes</p>
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

      {/* Agents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Cargando agentes...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No hay agentes creados todavía.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Agente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {agents.map((agent) => {
                  // Convertir Unix timestamp a fecha legible
                  const formatDate = (unixTimestamp) => {
                    if (!unixTimestamp) return 'N/A';
                    const date = new Date(unixTimestamp * 1000); // Convertir segundos a milisegundos
                    return date.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  };

                  return (
                    <tr 
                      key={agent.agent_id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => loadAgentById(agent.agent_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.name || 'Sin nombre'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(agent.created_at_unix_secs)}
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

