import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { authService } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  };

  // Mostrar loading mientras verificamos autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar dashboard si está autenticado, sino mostrar login
  return isAuthenticated ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <div>
      <LoginPage onLogin={handleLogin} />
      
      {/* Credenciales de ejemplo */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
        <h4 className="font-semibold text-gray-900 mb-2">Credenciales de prueba:</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Admin:</strong><br />
            admin@iacalls.com / admin123
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Asegúrate de que el servidor esté ejecutándose en localhost:5000
        </p>
      </div>
    </div>
  );
}

export default App;
