import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { LandingPage } from './components/landing/LandingPage';
import { authService } from './services/authService';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la app
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getUserFromToken();
        setUser(userData);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const userData = authService.getUserFromToken();
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setShowLogin(true); // Ir al login en lugar de la landing page
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleBackToLanding = () => {
    setShowLogin(false);
  };

  // Mostrar loading mientras verificamos autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar dashboard si está autenticado
  if (isAuthenticated) {
    return (
      <ThemeProvider>
        <Dashboard user={user} onLogout={handleLogout} />
      </ThemeProvider>
    );
  }

  // Mostrar login o landing page según el estado
  return (
    <ThemeProvider>
      {showLogin ? (
        <div>
          <LoginPage onLogin={handleLogin} onBackToLanding={handleBackToLanding} />
        </div>
      ) : (
        <LandingPage onLoginClick={handleLoginClick} />
      )}
    </ThemeProvider>
  );
}

export default App;
