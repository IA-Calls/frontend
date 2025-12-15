import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Users, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  Play,
  Globe,
  Bot,
  Sparkles,
  Menu,
  X,
  CheckCircle,
  Star,
  MessageSquare,
  Headphones,
  Target,
  TrendingUp,
  Award,
  Clock,
  Settings,
  Database,
  Send,
  Sun,
  Moon
} from 'lucide-react';
import { DemoModal } from './DemoModal';
import logoNegro from '../../images/logo-negro.png';
import logoBlanco from '../../images/logo-blanco.png';

export const LandingPage = ({ onLoginClick, onNavigate }) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verificar localStorage primero, si no hay tema guardado, usar modo claro por defecto
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Por defecto, modo claro
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Solo cambiar si no hay tema guardado en localStorage
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Actualizar el tema en el documento
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleDemoClick = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseDemo = () => {
    setIsDemoModalOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "IA Conversacional Avanzada",
      description: "Agentes inteligentes que entienden contexto y mantienen conversaciones naturales"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestión Masiva de Clientes",
      description: "Administra miles de contactos y automatiza tus campañas de comunicación"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics en Tiempo Real",
      description: "Métricas detalladas y reportes avanzados para optimizar tus resultados"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Seguridad Enterprise",
      description: "Cumplimiento GDPR, encriptación end-to-end y auditorías completas"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Integración Multiplataforma",
      description: "Conecta con WhatsApp, SMS, llamadas y más canales desde una sola plataforma"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Automatización Inteligente",
      description: "Flujos de trabajo automatizados que se adaptan a las respuestas del cliente"
    }
  ];

  const stats = [
    { number: "10M+", label: "Conversaciones Procesadas" },
    { number: "500+", label: "Empresas Confían en Nosotros" },
    { number: "99.9%", label: "Tiempo de Actividad" },
    { number: "24/7", label: "Soporte Técnico" }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Configuración Inicial",
      description: "Configura tu agente IA con tu marca, objetivos y flujos de conversación específicos.",
      icon: <Settings className="h-8 w-8" />,
      details: [
        "Personalización de la voz y personalidad del agente",
        "Configuración de objetivos de conversación",
        "Integración con tu CRM y sistemas existentes"
      ]
    },
    {
      step: "02",
      title: "Importación de Datos",
      description: "Carga tu base de datos de clientes y segmenta según tus necesidades de marketing.",
      icon: <Database className="h-8 w-8" />,
      details: [
        "Importación masiva de contactos",
        "Segmentación automática por criterios",
        "Validación y limpieza de datos"
      ]
    },
    {
      step: "03",
      title: "Lanzamiento y Monitoreo",
      description: "Inicia tus campañas automatizadas y monitorea resultados en tiempo real.",
      icon: <TrendingUp className="h-8 w-8" />,
      details: [
        "Lanzamiento de campañas automatizadas",
        "Monitoreo en tiempo real de conversaciones",
        "Análisis de métricas y optimización continua"
      ]
    }
  ];

  const benefits = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Mayor Alcance",
      description: "Llega a miles de clientes simultáneamente con mensajes personalizados"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Ahorro de Tiempo",
      description: "Automatiza tareas repetitivas y enfócate en lo que realmente importa"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Mejores Resultados",
      description: "Incrementa tus tasas de conversión con IA conversacional avanzada"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Experiencia Premium",
      description: "Ofrece atención 24/7 con la calidad de un agente humano"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden">
      <style>{`
        @media (min-width: 475px) {
          .xs\\:inline { display: inline !important; }
          .xs\\:hidden { display: none !important; }
          .xs\\:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          .xs\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        }
      `}</style>
      {/* Header con navegación */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-2 min-w-0"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={isDarkMode ? logoBlanco : logoNegro} 
                alt="NextVoice" 
                className="h-6 w-auto sm:h-8 flex-shrink-0"
              />
              <span className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                NextVoice
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('process')}
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Proceso
              </button>
              <button 
                onClick={() => scrollToSection('benefits')}
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Beneficios
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Precios
              </button>
            </nav>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDemoClick}
                className="hidden sm:block px-3 sm:px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                Demo Gratuita
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="px-3 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden xs:inline">Iniciar Sesión</span>
                <span className="xs:hidden">Entrar</span>
              </motion.button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Características
                </button>
                <button 
                  onClick={() => scrollToSection('process')}
                  className="text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Proceso
                </button>
                <button 
                  onClick={() => scrollToSection('benefits')}
                  className="text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Beneficios
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Precios
                </button>
                <button 
                  onClick={handleDemoClick}
                  className="text-left text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  Demo Gratuita
                </button>
                <button 
                  onClick={toggleDarkMode}
                  className="text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center space-x-2"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Modo Oscuro</span>
                    </>
                  )}
                </button>
              </div>
            </motion.nav>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-slate-200 dark:bg-slate-700/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 backdrop-blur-sm rounded-full border border-blue-200 dark:border-blue-800"
            >
              <Sparkles className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">Revolucionando la Comunicación Empresarial</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight px-2"
            >
              <span className="text-slate-900 dark:text-white">
                El Futuro de la
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Comunicación
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-base xs:text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-light px-4"
            >
              Potencia tu negocio con IA conversacional avanzada, automatización inteligente y analytics en tiempo real. 
              Conecta con tus clientes de manera personalizada a escala masiva.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDemoClick}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-semibold text-base sm:text-lg text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span className="whitespace-nowrap">Agendar Demo Gratuita</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('process')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-lg font-semibold text-base sm:text-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Ver Proceso</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-slate-300 dark:border-slate-600 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-slate-400 dark:bg-slate-500 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base mt-1 sm:mt-2 font-medium px-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              <span className="text-slate-900 dark:text-white">
                ¿Por qué NextVoice?
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-light px-4">
              Combinamos la última tecnología de IA con una plataforma intuitiva para transformar 
              la manera en que te conectas con tus clientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="p-6 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              <span className="text-slate-900 dark:text-white">
                ¿Cómo Funciona?
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-light px-4">
              En solo 3 pasos simples, transforma tu comunicación empresarial con tecnología de vanguardia.
            </p>
          </motion.div>

          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-4 sm:gap-6 md:gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="w-full lg:w-1/2">
                  <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                        {step.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{step.step}</div>
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{step.description}</p>
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="lg:w-1/2">
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          {step.icon}
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400">Paso {step.step}</p>
                      </div>
                    </div>
                    
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2">
                        <ArrowRight className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              <span className="text-slate-900 dark:text-white">
                Beneficios Clave
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-light px-4">
              Descubre cómo NextVoice puede transformar tu negocio y mejorar la experiencia de tus clientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              <span className="text-slate-900 dark:text-white">
                Planes y Precios
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-light px-4">
              Elige el plan que mejor se adapte a las necesidades de tu negocio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                name: "Starter",
                price: "$99",
                period: "/mes",
                description: "Perfecto para pequeñas empresas",
                features: [
                  "Hasta 1,000 contactos",
                  "1 Agente IA",
                  "Soporte por email",
                  "Analytics básicos",
                  "Integración WhatsApp"
                ],
                popular: false
              },
              {
                name: "Professional",
                price: "$299",
                period: "/mes",
                description: "Ideal para empresas en crecimiento",
                features: [
                  "Hasta 10,000 contactos",
                  "3 Agentes IA",
                  "Soporte prioritario",
                  "Analytics avanzados",
                  "Integración multi-canal",
                  "API personalizada"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Personalizado",
                period: "",
                description: "Para grandes organizaciones",
                features: [
                  "Contactos ilimitados",
                  "Agentes IA ilimitados",
                  "Soporte 24/7",
                  "Analytics personalizados",
                  "Integración completa",
                  "Implementación dedicada"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
                  plan.popular 
                    ? 'border-blue-500 dark:border-blue-400 scale-105' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-slate-600 dark:text-slate-400 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDemoClick}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {plan.name === "Enterprise" ? "Contactar Ventas" : "Comenzar Ahora"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold px-2">
              <span className="text-slate-900 dark:text-white">
                ¿Listo para Transformar tu Negocio?
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-light px-4">
              Únete a cientos de empresas que ya están revolucionando su comunicación 
              con NextVoice. Agenda tu demo gratuita hoy mismo.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDemoClick}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-semibold text-base sm:text-lg text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span className="whitespace-nowrap">Agendar Demo Gratuita</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-lg font-semibold text-base sm:text-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span className="whitespace-nowrap">Acceder a la Plataforma</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src={isDarkMode ? logoBlanco : logoNegro} 
                alt="NextVoice" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                NextVoice
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 text-slate-600 dark:text-slate-400">
              <button 
                onClick={() => onNavigate && onNavigate('privacy')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Privacidad
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('terms')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Términos
              </button>
              <a 
                href="mailto:soporte@nextvoice.com"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Soporte
              </a>
              <a 
                href="mailto:contacto@nextvoice.com"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            <p>&copy; 2024 NextVoice. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemo} />
    </div>
  );
};
