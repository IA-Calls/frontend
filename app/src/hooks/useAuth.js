import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '../services/authService';

// Contexto de autenticación
const AuthContext = createContext();

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
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

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const userData = authService.getUserFromToken();
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook alternativo para usar sin contexto (más simple)
export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const userData = authService.getUserFromToken();
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const userData = authService.getUserFromToken();
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}; 