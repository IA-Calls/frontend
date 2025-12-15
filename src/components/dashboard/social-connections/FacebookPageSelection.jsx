import React, { useState, useEffect } from 'react';
import { facebookService } from '../../../services/facebookService';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  Users,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../common/Button';

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

export const FacebookPageSelection = ({ 
  pages = [], 
  userAccessToken,
  onPageSelected,
  onCancel,
  onBack
}) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePageSelect = (page) => {
    setSelectedPage(page);
    setError(null);
  };

  const handleActivate = async () => {
    if (!selectedPage) {
      setError('Por favor, selecciona una página');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await facebookService.storePageToken({
        pageId: selectedPage.id,
        pageAccessToken: selectedPage.access_token,
        pageName: selectedPage.name
      });

      setSuccess(true);
      
      // Limpiar los parámetros de la URL
      facebookService.clearCallbackParams();

      // Notificar al componente padre después de un breve delay
      setTimeout(() => {
        if (onPageSelected) {
          onPageSelected(selectedPage, result);
        }
      }, 2000);

    } catch (err) {
      console.error('Error activating page:', err);
      setError(err.message || 'Error al activar la automatización');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si fue exitoso, mostrar mensaje de éxito
  if (success) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="relative">
          {/* Círculo animado de éxito */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          {/* Partículas decorativas */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-green-400 animate-pulse delay-150" />
        </div>
        
        <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          ¡Página Conectada!
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
          <span className="font-semibold text-green-600 dark:text-green-400">{selectedPage?.name}</span> ha sido conectada exitosamente.
          La automatización está lista para usar.
        </p>
        
        <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">
            Redirigiendo...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1877F2] to-[#0D65D9] flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FacebookIcon className="w-5 h-5 text-white" />
              </div>
              Seleccionar Página
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Elige la página de Facebook que deseas conectar
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Pages list */}
      {pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <FacebookIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron páginas
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            No tienes páginas de Facebook disponibles o no tienes permisos de administrador en ninguna página.
          </p>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="secondary"
              className="mt-6"
            >
              Volver
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pages.length} {pages.length === 1 ? 'página encontrada' : 'páginas encontradas'}
          </p>
          
          <div className="grid gap-3">
            {pages.map((page) => {
              const isSelected = selectedPage?.id === page.id;
              
              return (
                <button
                  key={page.id}
                  onClick={() => handlePageSelect(page)}
                  disabled={isSubmitting}
                  className={`
                    relative w-full p-4 rounded-xl border-2 text-left
                    transition-all duration-200 ease-out
                    ${isSelected 
                      ? 'border-[#1877F2] bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar de la página */}
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isSelected 
                        ? 'bg-gradient-to-br from-[#1877F2] to-[#0D65D9]' 
                        : 'bg-gray-100 dark:bg-gray-700'
                      }
                    `}>
                      {page.picture ? (
                        <img 
                          src={page.picture} 
                          alt={page.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <FacebookIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>

                    {/* Info de la página */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isSelected ? 'text-[#1877F2]' : 'text-gray-900 dark:text-white'}`}>
                        {page.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          ID: {page.id}
                        </span>
                        {page.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {page.category}
                          </span>
                        )}
                      </div>
                      {page.followers_count && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>{page.followers_count.toLocaleString()} seguidores</span>
                        </div>
                      )}
                    </div>

                    {/* Indicador de selección */}
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      transition-all duration-200
                      ${isSelected 
                        ? 'border-[#1877F2] bg-[#1877F2]' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Badge de seleccionado */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1877F2] text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Seleccionada
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {pages.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleActivate}
            disabled={!selectedPage || isSubmitting}
            className="bg-gradient-to-r from-[#1877F2] to-[#0D65D9] hover:from-[#166FE5] hover:to-[#0B5BC4] text-white border-0 shadow-lg shadow-blue-500/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Activar Automatización
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FacebookPageSelection;


