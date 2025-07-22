import React from 'react';
import { LoginForm } from './LoginForm';
import { WelcomeSection } from './WelcomeSection';

export const LoginPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex">
      {/* Welcome Section - Left Side */}
      <WelcomeSection />
      
      {/* Login Form - Right Side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}; 