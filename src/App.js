import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { LandingPage } from './components/landing/LandingPage';
import { TermsAndConditions } from './components/legal/TermsAndConditions';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { authService } from './services/authService';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // Detectar la ruta actual al cargar
  useEffect(() => {
    const pathname = window.location.pathname;
    
    if (pathname === '/terminos' || pathname === '/terms') {
      setCurrentPage('terms');
    } else if (pathname === '/privacidad' || pathname === '/privacy') {
      setCurrentPage('privacy');
    } else {
      setCurrentPage('home');
    }
  }, []);

  // Escuchar cambios en la URL (navegación del navegador)
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      
      if (pathname === '/terminos' || pathname === '/terms') {
        setCurrentPage('terms');
      } else if (pathname === '/privacidad' || pathname === '/privacy') {
        setCurrentPage('privacy');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    // Actualizar la URL sin recargar
    window.history.pushState({}, '', '/');
    setCurrentPage('home');
  };

  // Función para navegar a páginas legales
  const navigateTo = (page) => {
    if (page === 'terms') {
      window.history.pushState({}, '', '/terminos');
      setCurrentPage('terms');
    } else if (page === 'privacy') {
      window.history.pushState({}, '', '/privacidad');
      setCurrentPage('privacy');
    } else {
      window.history.pushState({}, '', '/');
      setCurrentPage('home');
    }
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

  // Mostrar páginas legales independientemente del estado de autenticación
  if (currentPage === 'terms') {
    return (
      <ThemeProvider>
        <TermsAndConditions onBack={() => navigateTo('home')} />
      </ThemeProvider>
    );
  }

  if (currentPage === 'privacy') {
    return (
      <ThemeProvider>
        <PrivacyPolicy onBack={() => navigateTo('home')} />
      </ThemeProvider>
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
        <LandingPage 
          onLoginClick={handleLoginClick} 
          onNavigate={navigateTo}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
