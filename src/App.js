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
          
          {/* Credenciales de ejemplo */}
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Credenciales de prueba:</h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <strong>Admin:</strong><br />
                admin@iacalls.com / admin123
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Asegúrate de que el servidor esté ejecutándose en localhost:5000
            </p>
          </div>
        </div>
      ) : (
        <LandingPage onLoginClick={handleLoginClick} />
      )}
    </ThemeProvider>
  );
}

export default App;
