import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Lock, 
  Database,
  Share2,
  Globe,
  UserCheck,
  Bell,
  Trash2,
  Mail,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import logoNegro from '../../images/logo-negro.png';
import logoBlanco from '../../images/logo-blanco.png';

export const PrivacyPolicy = ({ onBack }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = '/';
    }
  };

  const lastUpdated = "15 de Diciembre de 2024";

  const sections = [
    {
      id: 'introduccion',
      icon: <Shield className="w-6 h-6" />,
      title: '1. Introducción',
      content: `NextVoice S.A.S. ("NextVoice", "nosotros", "nuestro") se compromete a proteger la privacidad de nuestros usuarios, clientes y los clientes de nuestros clientes. Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos la información personal.

Esta política aplica a:
- Usuarios de nuestra plataforma (clientes empresariales)
- Visitantes de nuestro sitio web
- Personas cuyos datos son procesados a través de nuestra plataforma por nuestros clientes

Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política. Si es un cliente empresarial, usted es responsable de informar a sus usuarios finales sobre el tratamiento de sus datos a través de NextVoice.

**Base Legal para el Procesamiento:**
Procesamos datos personales basándonos en:
- Ejecución de contrato con nuestros clientes empresariales
- Consentimiento del titular de los datos
- Interés legítimo para mejorar nuestros servicios
- Cumplimiento de obligaciones legales`
    },
    {
      id: 'datos-recopilados',
      icon: <Database className="w-6 h-6" />,
      title: '2. Datos que Recopilamos',
      content: `**2.1. Información de Cuenta Empresarial**
- Nombre de la empresa y datos de contacto
- Información de facturación y método de pago
- Credenciales de acceso (encriptadas)
- Configuración y preferencias de la cuenta
- Historial de uso de la plataforma

**2.2. Datos de Usuarios Finales (procesados en nombre de nuestros clientes)**
- Nombres y datos de contacto
- Números de teléfono y direcciones de email
- Contenido de conversaciones (mensajes y transcripciones de llamadas)
- Grabaciones de audio de llamadas (cuando está habilitado)
- Metadatos de comunicación (fecha, hora, duración)
- Historial de interacciones

**2.3. Información Técnica**
- Dirección IP y datos de ubicación aproximada
- Tipo de dispositivo, navegador y sistema operativo
- Identificadores únicos de dispositivo
- Logs de actividad y errores
- Cookies y tecnologías similares

**2.4. Datos de Interacción con IA**
- Entradas de texto y voz al agente IA
- Respuestas generadas por el sistema
- Métricas de rendimiento y calidad
- Datos de entrenamiento anonimizados`
    },
    {
      id: 'uso-datos',
      icon: <Eye className="w-6 h-6" />,
      title: '3. Cómo Utilizamos los Datos',
      content: `**3.1. Provisión del Servicio**
- Ejecutar conversaciones automatizadas con agentes IA
- Procesar llamadas y mensajes entrantes/salientes
- Gestionar campañas de comunicación
- Proporcionar soporte técnico y atención al cliente

**3.2. Mejora del Servicio**
- Entrenar y optimizar modelos de inteligencia artificial
- Desarrollar nuevas funcionalidades
- Realizar análisis de rendimiento y calidad
- Identificar y corregir errores técnicos

**3.3. Comunicaciones**
- Enviar notificaciones sobre el servicio
- Proporcionar actualizaciones y novedades
- Responder consultas de soporte
- Enviar información comercial (con consentimiento)

**3.4. Cumplimiento y Seguridad**
- Detectar y prevenir fraude o uso indebido
- Cumplir con obligaciones legales y regulatorias
- Proteger los derechos de NextVoice y terceros
- Responder a requerimientos de autoridades

**3.5. Análisis Agregado**
- Generar estadísticas de uso anonimizadas
- Realizar investigación sobre tendencias del mercado
- Crear reportes de industria sin datos identificables`
    },
    {
      id: 'compartir-datos',
      icon: <Share2 className="w-6 h-6" />,
      title: '4. Compartición de Datos',
      content: `**4.1. Proveedores de Servicios**
Compartimos datos con terceros que nos ayudan a operar:
- Proveedores de infraestructura en la nube (AWS, Google Cloud)
- Servicios de telefonía y comunicaciones (Twilio)
- Proveedores de modelos de IA (ElevenLabs, OpenAI)
- Procesadores de pagos (Stripe)
- Servicios de análisis y monitoreo

Todos nuestros proveedores están sujetos a acuerdos de procesamiento de datos y obligaciones de confidencialidad.

**4.2. Clientes Empresariales**
Cuando procesamos datos en nombre de clientes empresariales:
- Los datos de usuarios finales son propiedad del cliente
- El cliente tiene acceso completo a sus datos
- El cliente puede exportar o eliminar datos según sus necesidades

**4.3. Transferencias Legales**
Podemos divulgar información cuando:
- Sea requerido por ley o proceso legal
- Sea necesario para proteger la seguridad pública
- En caso de fusión, adquisición o venta de activos
- Para ejercer o defender derechos legales

**4.4. Datos Agregados**
Podemos compartir estadísticas agregadas y anonimizadas que no identifican a individuos específicos.

**4.5. Con Su Consentimiento**
Compartiremos información personal con terceros cuando usted haya dado su consentimiento explícito.`
    },
    {
      id: 'transferencias-internacionales',
      icon: <Globe className="w-6 h-6" />,
      title: '5. Transferencias Internacionales',
      content: `**5.1. Ubicación de Datos**
Nuestros servidores principales están ubicados en:
- Estados Unidos (AWS, Google Cloud)
- Unión Europea (para clientes europeos cuando sea requerido)

**5.2. Garantías de Transferencia**
Para transferencias fuera de su jurisdicción, implementamos:
- Cláusulas Contractuales Tipo de la UE
- Certificación Privacy Shield (cuando aplique)
- Acuerdos de procesamiento de datos con garantías adecuadas
- Evaluaciones de impacto para países de alto riesgo

**5.3. Sus Derechos**
Tiene derecho a:
- Conocer a qué países se transfieren sus datos
- Solicitar copia de las garantías de transferencia
- Objetar transferencias a jurisdicciones específicas

**5.4. Proveedores Internacionales**
Nuestros principales proveedores con acceso a datos:
- Amazon Web Services (Estados Unidos)
- Google Cloud Platform (Estados Unidos/Europa)
- Twilio (Estados Unidos)
- ElevenLabs (Estados Unidos)
- OpenAI (Estados Unidos)

Todos cumplen con estándares de protección equivalentes o superiores a los de su jurisdicción.`
    },
    {
      id: 'seguridad',
      icon: <Lock className="w-6 h-6" />,
      title: '6. Seguridad de Datos',
      content: `**6.1. Medidas Técnicas**
Implementamos medidas de seguridad robustas:
- Encriptación en tránsito (TLS 1.3) y en reposo (AES-256)
- Autenticación multifactor para acceso a la plataforma
- Aislamiento de datos entre clientes (multi-tenancy seguro)
- Monitoreo continuo de seguridad y detección de amenazas
- Pruebas de penetración regulares

**6.2. Medidas Organizativas**
- Políticas de acceso basadas en el principio de mínimo privilegio
- Capacitación obligatoria en seguridad para empleados
- Acuerdos de confidencialidad con todo el personal
- Procedimientos de respuesta a incidentes
- Auditorías de seguridad periódicas

**6.3. Certificaciones y Cumplimiento**
Trabajamos hacia el cumplimiento de:
- SOC 2 Type II
- ISO 27001
- GDPR (Reglamento General de Protección de Datos)
- CCPA (Ley de Privacidad del Consumidor de California)

**6.4. Notificación de Brechas**
En caso de una brecha de seguridad que afecte datos personales:
- Notificaremos a los clientes afectados dentro de 72 horas
- Informaremos a las autoridades cuando sea requerido
- Proporcionaremos detalles sobre el alcance y las medidas tomadas
- Implementaremos medidas correctivas inmediatas`
    },
    {
      id: 'retencion',
      icon: <Database className="w-6 h-6" />,
      title: '7. Retención de Datos',
      content: `**7.1. Períodos de Retención**
Conservamos datos según los siguientes criterios:

**Datos de cuenta empresarial:**
- Durante la vigencia de la relación comercial
- 5 años adicionales para cumplimiento fiscal/legal

**Datos de usuarios finales:**
- Según las instrucciones del cliente empresarial
- Máximo 2 años después de la última interacción (por defecto)
- Eliminación inmediata a solicitud del cliente

**Grabaciones de llamadas:**
- Según configuración del cliente (30 días a 2 años)
- Eliminación automática después del período configurado

**Logs técnicos:**
- 90 días para logs de actividad
- 1 año para logs de seguridad

**Datos anonimizados:**
- Pueden conservarse indefinidamente para análisis

**7.2. Eliminación de Datos**
Cuando los datos ya no son necesarios:
- Eliminación segura mediante métodos criptográficos
- Destrucción de copias de respaldo según cronograma
- Verificación de eliminación en todos los sistemas
- Registro de la eliminación para auditoría`
    },
    {
      id: 'derechos',
      icon: <UserCheck className="w-6 h-6" />,
      title: '8. Sus Derechos',
      content: `Dependiendo de su jurisdicción, usted puede tener los siguientes derechos:

**8.1. Derecho de Acceso**
Solicitar una copia de los datos personales que tenemos sobre usted.

**8.2. Derecho de Rectificación**
Corregir datos inexactos o incompletos.

**8.3. Derecho de Supresión ("Derecho al Olvido")**
Solicitar la eliminación de sus datos personales cuando:
- Ya no sean necesarios para los fines de procesamiento
- Retire su consentimiento
- Objete al procesamiento
- Los datos hayan sido tratados ilícitamente

**8.4. Derecho de Portabilidad**
Recibir sus datos en un formato estructurado y transferible.

**8.5. Derecho de Oposición**
Oponerse al procesamiento basado en interés legítimo o marketing directo.

**8.6. Derecho a Limitar el Procesamiento**
Restringir el procesamiento mientras se resuelve una disputa.

**8.7. Derechos sobre Decisiones Automatizadas**
No estar sujeto a decisiones basadas únicamente en procesamiento automatizado que tengan efectos legales.

**8.8. Cómo Ejercer sus Derechos**
- Email: privacidad@nextvoice.com
- Formulario en la plataforma (sección Configuración > Privacidad)
- Carta a nuestra dirección física

Responderemos a su solicitud dentro de 30 días. Puede requerirse verificación de identidad.`
    },
    {
      id: 'cookies',
      icon: <Cookie className="w-6 h-6" />,
      title: '9. Cookies y Tecnologías Similares',
      content: `**9.1. Qué son las Cookies**
Las cookies son pequeños archivos de texto almacenados en su dispositivo que nos permiten reconocerlo y recordar sus preferencias.

**9.2. Tipos de Cookies que Utilizamos**

**Cookies Esenciales:**
- Necesarias para el funcionamiento del sitio
- Autenticación y seguridad de sesión
- No pueden deshabilitarse

**Cookies de Rendimiento:**
- Análisis de uso del sitio
- Métricas de rendimiento
- Google Analytics (anonimizado)

**Cookies de Funcionalidad:**
- Preferencias de idioma y tema
- Personalización de la interfaz
- Recordar configuraciones

**Cookies de Marketing:**
- Seguimiento de conversiones
- Publicidad personalizada (solo con consentimiento)
- Remarketing

**9.3. Gestión de Cookies**
Puede gestionar sus preferencias de cookies:
- A través de nuestro banner de consentimiento
- En la configuración de su navegador
- Usando herramientas de opt-out de terceros

**9.4. Tecnologías Similares**
También utilizamos:
- Pixels de seguimiento
- Local storage del navegador
- Identificadores de dispositivo
- Fingerprinting limitado para seguridad`
    },
    {
      id: 'menores',
      icon: <Shield className="w-6 h-6" />,
      title: '10. Privacidad de Menores',
      content: `**10.1. Política General**
NextVoice es un servicio B2B dirigido a empresas. No recopilamos intencionalmente datos de menores de 18 años.

**10.2. Responsabilidad del Cliente**
Nuestros clientes empresariales son responsables de:
- No utilizar la plataforma para contactar menores de edad
- Cumplir con leyes de protección de menores (COPPA, etc.)
- Obtener consentimiento parental cuando sea requerido
- Implementar controles apropiados en sus campañas

**10.3. Eliminación de Datos de Menores**
Si descubrimos que hemos recopilado datos de un menor:
- Eliminaremos los datos inmediatamente
- Notificaremos al cliente afectado
- Tomaremos medidas para prevenir futuras recopilaciones

**10.4. Reportar Preocupaciones**
Si cree que hemos recopilado datos de un menor, contacte:
privacidad@nextvoice.com`
    },
    {
      id: 'cambios',
      icon: <Bell className="w-6 h-6" />,
      title: '11. Cambios a esta Política',
      content: `**11.1. Actualizaciones**
Podemos actualizar esta Política de Privacidad periódicamente para reflejar:
- Cambios en nuestras prácticas de datos
- Nuevas funcionalidades o servicios
- Requisitos legales o regulatorios
- Mejores prácticas de la industria

**11.2. Notificación de Cambios**
Le notificaremos cambios materiales mediante:
- Email a la dirección de contacto registrada
- Aviso prominente en la plataforma
- Actualización de la fecha de "última actualización"

**11.3. Historial de Versiones**
Mantenemos un registro de versiones anteriores disponible bajo solicitud.

**11.4. Su Aceptación**
El uso continuado del servicio después de la publicación de cambios constituye su aceptación de la política actualizada.`
    },
    {
      id: 'contacto',
      icon: <Mail className="w-6 h-6" />,
      title: '12. Contacto y Reclamaciones',
      content: `**12.1. Oficial de Protección de Datos**
Para consultas sobre privacidad y protección de datos:

**Delegado de Protección de Datos**
- Email: dpo@nextvoice.com
- Teléfono: +57 (1) 234-5679

**12.2. Contacto General de Privacidad**
- Email: privacidad@nextvoice.com
- Formulario: nextvoice.com/privacidad/contacto

**12.3. Dirección Postal**
NextVoice S.A.S.
Atención: Departamento de Privacidad
Bogotá, Colombia

**12.4. Autoridades de Protección de Datos**
Tiene derecho a presentar reclamaciones ante:

**Colombia:**
Superintendencia de Industria y Comercio (SIC)
www.sic.gov.co

**Unión Europea:**
Autoridad de Protección de Datos de su país de residencia

**Estados Unidos (California):**
California Attorney General
www.oag.ca.gov

**12.5. Tiempo de Respuesta**
- Consultas generales: 15 días hábiles
- Ejercicio de derechos ARCO: 30 días calendario
- Reclamaciones formales: 15 días hábiles para acuse, 30 días para resolución`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </motion.button>

            <div className="flex items-center space-x-2">
              <img 
                src={isDarkMode ? logoBlanco : logoNegro} 
                alt="NextVoice" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                NextVoice
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Política de Privacidad
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Última actualización: {lastUpdated}
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 mb-8 border border-emerald-100 dark:border-emerald-800"
          >
            <div className="flex items-start space-x-4">
              <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Tu privacidad es nuestra prioridad
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  En NextVoice, nos tomamos muy en serio la protección de tus datos personales. 
                  Esta política explica de manera transparente cómo recopilamos, utilizamos y protegemos 
                  tu información al usar nuestra plataforma de agentes de inteligencia artificial.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Resumen Ejecutivo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">Datos que recopilamos</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Información de cuenta, interacciones y datos técnicos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">Cómo los usamos</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Provisión del servicio, mejoras y cumplimiento</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">Seguridad</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Encriptación, monitoreo 24/7 y cumplimiento SOC 2</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">Tus derechos</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Acceso, rectificación, supresión y portabilidad</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Tabla de Contenidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
                >
                  <span className="text-emerald-600 dark:text-emerald-400">{index + 1}.</span>
                  <span className="truncate">{section.title.replace(/^\d+\.\s*/, '')}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
                    {section.icon}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-2">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => {
                    if (paragraph.startsWith('**') && paragraph.includes('**\n')) {
                      const [title, ...rest] = paragraph.split('\n');
                      return (
                        <div key={pIndex} className="mb-4">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {title.replace(/\*\*/g, '')}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {rest.join('\n')}
                          </p>
                        </div>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={pIndex} className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 mb-4">
                          {paragraph.split('\n').map((item, iIndex) => (
                            <li key={iIndex}>{item.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIndex} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
                        {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © 2024 NextVoice S.A.S. Todos los derechos reservados.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a 
                href="/terminos" 
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Términos y Condiciones
              </a>
              <a 
                href="mailto:privacidad@nextvoice.com" 
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Contactar Privacidad
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

