import React, { useState, useEffect, useCallback } from 'react';
import { facebookService } from '../../../services/facebookService';
import { FacebookLoginButton } from './FacebookLoginButton';
import { FacebookPageSelection } from './FacebookPageSelection';
import { Button } from '../../common/Button';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Unplug,
  RefreshCw,
  Settings,
  Shield,
  Zap,
  Globe,
  MessageCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// Icono de Facebook personalizado
const FacebookIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Icono de Instagram personalizado
const InstagramIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Icono de WhatsApp personalizado
const WhatsAppIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const SocialConnectionsContent = ({ user }) => {
  const [activeTab, setActiveTab] = useState('facebook');
  const [connectedPages, setConnectedPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPageSelection, setShowPageSelection] = useState(false);
  const [callbackData, setCallbackData] = useState(null);
  const [isDisconnecting, setIsDisconnecting] = useState(null);

  // Verificar si hay datos del callback de OAuth al cargar
  useEffect(() => {
    const checkCallback = () => {
      const data = facebookService.parseCallbackParams();
      if (data) {
        if (data.success) {
          setCallbackData(data);
          setShowPageSelection(true);
        } else {
          setError(data.errorDescription || 'Error en la autenticación con Facebook');
        }
        // Limpiar los parámetros de la URL
        facebookService.clearCallbackParams();
      }
    };

    checkCallback();
  }, []);

  // Cargar páginas conectadas
  const loadConnectedPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pages = await facebookService.getConnectedPages();
      setConnectedPages(pages);
    } catch (err) {
      console.error('Error loading connected pages:', err);
      // No mostrar error si simplemente no hay páginas
      if (!err.message.includes('No pages')) {
        setError(err.message);
      }
      setConnectedPages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnectedPages();
  }, [loadConnectedPages]);

  // Manejar la selección de página
  const handlePageSelected = (page, result) => {
    setShowPageSelection(false);
    setCallbackData(null);
    loadConnectedPages();
  };

  // Manejar desconexión de página
  const handleDisconnect = async (pageId) => {
    setIsDisconnecting(pageId);
    try {
      await facebookService.disconnectPage(pageId);
      await loadConnectedPages();
    } catch (err) {
      setError(err.message || 'Error al desconectar la página');
    } finally {
      setIsDisconnecting(null);
    }
  };

  // Manejar error de conexión
  const handleConnectionError = (error) => {
    setError(error.message || 'Error al conectar con Facebook');
  };

  // Lista de redes sociales disponibles
  const socialNetworks = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FacebookIcon,
      color: '#1877F2',
      gradient: 'from-[#1877F2] to-[#0D65D9]',
      description: 'Conecta tu página de Facebook para automatizar respuestas y gestionar mensajes.',
      available: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: InstagramIcon,
      color: '#E4405F',
      gradient: 'from-[#833AB4] via-[#E4405F] to-[#FCAF45]',
      description: 'Gestiona mensajes directos y automatiza respuestas en Instagram.',
      available: false,
      comingSoon: true
    },
    {
      id: 'whatsapp-business',
      name: 'WhatsApp Business',
      icon: WhatsAppIcon,
      color: '#25D366',
      gradient: 'from-[#25D366] to-[#128C7E]',
      description: 'Integra WhatsApp Business API para atención al cliente automatizada.',
      available: false,
      comingSoon: true
    }
  ];

  // Si estamos mostrando la selección de páginas
  if (showPageSelection && callbackData) {
    return (
      <div className="max-w-4xl mx-auto">
        <FacebookPageSelection
          pages={callbackData.pages || []}
          userAccessToken={callbackData.userAccessToken}
          onPageSelected={handlePageSelected}
          onCancel={() => {
            setShowPageSelection(false);
            setCallbackData(null);
          }}
          onBack={() => {
            setShowPageSelection(false);
            setCallbackData(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Conexión de Redes Sociales
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Conecta tus cuentas de redes sociales para automatizar la comunicación con tus clientes
              </p>
            </div>
          </div>
          <Button
            onClick={loadConnectedPages}
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs de redes sociales */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {socialNetworks.map((network) => {
            const Icon = network.icon;
            const isActive = activeTab === network.id;
            
            return (
              <button
                key={network.id}
                onClick={() => setActiveTab(network.id)}
                className={`
                  relative flex items-center gap-3 px-6 py-4 font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }
                `}
              >
                <Icon className={`w-5 h-5`} style={{ color: network.color }} />
                <span>{network.name}</span>
                {network.comingSoon && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    Próximamente
                  </span>
                )}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: network.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'facebook' && (
            <div className="space-y-6">
              {/* Info section */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                  <FacebookIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Integración con Facebook
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Conecta tu página de Facebook para recibir y responder mensajes automáticamente. 
                    Necesitas ser administrador de la página que deseas conectar.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Shield className="w-3.5 h-3.5 text-green-500" />
                      <span>Conexión segura OAuth 2.0</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                      <span>Respuestas automáticas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                      <span>Gestión de mensajes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected pages */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : connectedPages.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Páginas Conectadas
                  </h3>
                  <div className="grid gap-4">
                    {connectedPages.map((page) => (
                      <div 
                        key={page.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1877F2] to-[#0D65D9] flex items-center justify-center">
                            {page.picture ? (
                              <img 
                                src={page.picture} 
                                alt={page.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <FacebookIcon className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {page.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">
                                Conectada
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                ID: {page.id}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleDisconnect(page.id)}
                            variant="secondary"
                            size="sm"
                            disabled={isDisconnecting === page.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            {isDisconnecting === page.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Unplug className="w-4 h-4 mr-1" />
                                Desconectar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Botón para conectar más páginas */}
                  <div className="pt-4">
                    <FacebookLoginButton 
                      onError={handleConnectionError}
                      variant="outline"
                      customText="Conectar otra página"
                    />
                  </div>
                </div>
              ) : (
                /* No pages connected - Show connect button */
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#1877F2] to-[#0D65D9] flex items-center justify-center mb-6 shadow-xl shadow-blue-500/25">
                    <FacebookIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Conecta tu página de Facebook
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                    Vincula tu página de Facebook para comenzar a automatizar la comunicación con tus clientes.
                  </p>
                  <FacebookLoginButton 
                    onError={handleConnectionError}
                    size="lg"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'instagram' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45] flex items-center justify-center mb-6 opacity-50">
                <InstagramIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Instagram - Próximamente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Estamos trabajando en la integración con Instagram. 
                Pronto podrás gestionar mensajes directos y automatizar respuestas.
              </p>
            </div>
          )}

          {activeTab === 'whatsapp-business' && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center mb-6 opacity-50">
                <WhatsAppIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                WhatsApp Business - Próximamente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                La integración con WhatsApp Business API estará disponible pronto.
                Podrás automatizar la atención al cliente directamente desde WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Respuestas Automáticas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configura respuestas automáticas inteligentes para tus mensajes entrantes.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            IA Integrada
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Utiliza inteligencia artificial para mejorar la calidad de las respuestas.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Personalización Total
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configura reglas y flujos personalizados según las necesidades de tu negocio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialConnectionsContent;


