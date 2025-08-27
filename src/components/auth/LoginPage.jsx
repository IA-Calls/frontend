import React from 'react';
import { LoginForm } from './LoginForm';
import { WelcomeSection } from './WelcomeSection';
import { ArrowLeft } from 'lucide-react';

export const LoginPage = ({ onLogin, onBackToLanding }) => {
  return (
    <div className="min-h-screen flex">
      {/* Welcome Section - Left Side */}
      <WelcomeSection />
      
      {/* Login Form - Right Side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative">
        {/* Botón de regreso */}
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver a NextVoice</span>
        </button>
        
        <div className="max-w-md w-full space-y-8">
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}; 