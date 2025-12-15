import React, { useState } from 'react';
import { facebookService } from '../../../services/facebookService';
import { Loader2 } from 'lucide-react';

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

export const FacebookLoginButton = ({ 
  onSuccess, 
  onError,
  variant = 'default', // 'default' | 'outline' | 'minimal'
  size = 'default', // 'sm' | 'default' | 'lg'
  fullWidth = false,
  showIcon = true,
  customText
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      await facebookService.startOAuthFlow();
      // El flujo de OAuth redirige al usuario, 
      // así que este código normalmente no se ejecuta
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error connecting to Facebook:', error);
      if (onError) {
        onError(error);
      }
      setIsLoading(false);
    }
  };

  // Estilos según la variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return 'border-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white dark:border-[#1877F2] dark:text-[#1877F2] dark:hover:bg-[#1877F2] dark:hover:text-white';
      case 'minimal':
        return 'text-[#1877F2] hover:bg-blue-50 dark:text-[#1877F2] dark:hover:bg-gray-800';
      default:
        return 'bg-[#1877F2] text-white hover:bg-[#166FE5] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40';
    }
  };

  // Estilos según el tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  // Tamaño del icono según el tamaño del botón
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const buttonText = customText || 'Conectar con Facebook';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative inline-flex items-center justify-center gap-3
        font-semibold rounded-xl
        transition-all duration-300 ease-out
        transform hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-4 focus:ring-blue-500/30
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${getIconSize()} animate-spin`} />
          <span>Conectando...</span>
        </>
      ) : (
        <>
          {showIcon && <FacebookIcon className={getIconSize()} />}
          <span>{buttonText}</span>
        </>
      )}
      
      {/* Efecto de brillo al hover */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
      </div>
    </button>
  );
};

export default FacebookLoginButton;


