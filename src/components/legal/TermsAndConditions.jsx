import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  Users, 
  CreditCard,
  AlertTriangle,
  Scale,
  Clock,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import logoNegro from '../../images/logo-negro.png';
import logoBlanco from '../../images/logo-blanco.png';

export const TermsAndConditions = ({ onBack }) => {
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
      id: 'aceptacion',
      icon: <FileText className="w-6 h-6" />,
      title: '1. Aceptación de los Términos',
      content: `Al acceder y utilizar la plataforma NextVoice ("el Servicio"), usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestro Servicio.

NextVoice es una plataforma de inteligencia artificial conversacional que proporciona agentes virtuales para la gestión automatizada de comunicaciones empresariales a través de canales de mensajería (chat) y llamadas de voz.

Estos términos constituyen un acuerdo legal entre usted ("Usuario", "Cliente" o "usted") y NextVoice S.A.S. ("NextVoice", "nosotros" o "nuestro").`
    },
    {
      id: 'descripcion',
      icon: <Shield className="w-6 h-6" />,
      title: '2. Descripción del Servicio',
      content: `NextVoice proporciona los siguientes servicios:

**2.1. Agentes de IA Conversacional**
- Agentes virtuales inteligentes capaces de mantener conversaciones naturales
- Soporte multicanal: WhatsApp, SMS, llamadas telefónicas, Facebook Messenger y otros canales de mensajería
- Procesamiento de lenguaje natural avanzado para comprensión contextual
- Personalización de respuestas basadas en el contexto empresarial del cliente

**2.2. Automatización de Comunicaciones**
- Campañas automatizadas de llamadas salientes
- Gestión automatizada de mensajes entrantes
- Seguimiento y escalamiento inteligente de conversaciones
- Integración con sistemas CRM y bases de datos empresariales

**2.3. Análisis y Reportes**
- Dashboard en tiempo real con métricas de rendimiento
- Reportes detallados de conversaciones y resultados
- Análisis de sentimiento y satisfacción del cliente
- Exportación de datos para análisis adicional

**2.4. Gestión de Conocimiento**
- Bases de conocimiento personalizables
- Entrenamiento continuo de agentes IA
- Retroalimentación inteligente para mejora de respuestas`
    },
    {
      id: 'registro',
      icon: <Users className="w-6 h-6" />,
      title: '3. Registro y Cuenta de Usuario',
      content: `**3.1. Requisitos de Registro**
Para utilizar NextVoice, usted debe:
- Ser mayor de 18 años o tener capacidad legal para contratar
- Proporcionar información veraz, precisa y actualizada
- Mantener la confidencialidad de sus credenciales de acceso
- Notificar inmediatamente cualquier uso no autorizado de su cuenta

**3.2. Responsabilidad de la Cuenta**
Usted es responsable de:
- Todas las actividades que ocurran bajo su cuenta
- Mantener la seguridad de sus credenciales de acceso
- Actualizar su información de contacto y facturación
- Cumplir con todas las leyes aplicables en el uso del Servicio

**3.3. Verificación de Identidad**
Nos reservamos el derecho de:
- Solicitar documentación adicional para verificar su identidad
- Suspender cuentas que presenten información fraudulenta
- Limitar el acceso mientras se completa la verificación`
    },
    {
      id: 'uso-aceptable',
      icon: <Scale className="w-6 h-6" />,
      title: '4. Uso Aceptable del Servicio',
      content: `**4.1. Usos Permitidos**
El Servicio debe utilizarse únicamente para:
- Comunicaciones comerciales legítimas con clientes actuales o potenciales
- Atención al cliente y soporte técnico
- Campañas de marketing con el debido consentimiento
- Gestión de citas, recordatorios y notificaciones autorizadas

**4.2. Usos Prohibidos**
Queda estrictamente prohibido utilizar NextVoice para:
- Spam, mensajes no solicitados o comunicaciones fraudulentas
- Acoso, amenazas o contenido ofensivo
- Actividades ilegales o que violen derechos de terceros
- Suplantación de identidad o phishing
- Distribución de malware o contenido malicioso
- Llamadas o mensajes a números que hayan solicitado no ser contactados
- Violación de regulaciones de telecomunicaciones (Do Not Call lists, etc.)
- Cualquier uso que pueda dañar la reputación de NextVoice

**4.3. Cumplimiento Regulatorio**
El Usuario es responsable de:
- Obtener consentimiento previo para comunicaciones de marketing
- Cumplir con GDPR, CCPA y otras leyes de protección de datos aplicables
- Respetar las regulaciones de telecomunicaciones de su jurisdicción
- Mantener registros de consentimiento cuando sea requerido`
    },
    {
      id: 'pagos',
      icon: <CreditCard className="w-6 h-6" />,
      title: '5. Precios, Pagos y Facturación',
      content: `**5.1. Estructura de Precios**
- Los precios están disponibles en nuestra página web y pueden variar según el plan seleccionado
- Los precios no incluyen impuestos aplicables, los cuales serán añadidos según la jurisdicción
- Nos reservamos el derecho de modificar precios con 30 días de anticipación

**5.2. Términos de Pago**
- Los pagos se realizan por adelantado de forma mensual o anual
- Aceptamos tarjetas de crédito, débito y transferencias bancarias
- Las facturas se emiten electrónicamente al email registrado
- El impago puede resultar en suspensión o terminación del servicio

**5.3. Política de Reembolsos**
- Los pagos anuales son reembolsables prorrateadamente dentro de los primeros 30 días
- Los pagos mensuales no son reembolsables una vez iniciado el período
- Los créditos de uso no utilizados no son reembolsables ni transferibles
- En caso de terminación por incumplimiento, no habrá reembolso

**5.4. Consumo y Límites**
- Cada plan incluye límites específicos de contactos, agentes y uso
- El exceso de uso se facturará según las tarifas publicadas
- Nos reservamos el derecho de limitar el servicio si se detecta uso abusivo`
    },
    {
      id: 'propiedad',
      icon: <Shield className="w-6 h-6" />,
      title: '6. Propiedad Intelectual',
      content: `**6.1. Propiedad de NextVoice**
NextVoice retiene todos los derechos sobre:
- La plataforma, software, código fuente y algoritmos
- Marcas comerciales, logotipos y elementos de diseño
- Modelos de IA, bases de conocimiento propietarias
- Documentación, materiales de capacitación y contenido

**6.2. Licencia de Uso**
Le otorgamos una licencia limitada, no exclusiva y revocable para:
- Acceder y utilizar el Servicio según estos términos
- Integrar el Servicio con sus sistemas mediante nuestras APIs
- Personalizar los agentes IA dentro de las capacidades proporcionadas

**6.3. Contenido del Usuario**
Usted retiene la propiedad de:
- Sus datos de clientes y contactos
- Contenido personalizado de agentes y respuestas
- Grabaciones de conversaciones (sujeto a leyes aplicables)

**6.4. Licencia para Mejoras**
Nos otorga una licencia para usar datos anonimizados y agregados con el fin de:
- Mejorar nuestros modelos de IA
- Desarrollar nuevas funcionalidades
- Realizar análisis estadísticos`
    },
    {
      id: 'privacidad',
      icon: <Shield className="w-6 h-6" />,
      title: '7. Privacidad y Protección de Datos',
      content: `**7.1. Tratamiento de Datos**
El tratamiento de datos personales se rige por nuestra Política de Privacidad, la cual forma parte integral de estos términos.

**7.2. Responsabilidades del Usuario**
Como controlador de datos de sus clientes, usted debe:
- Obtener consentimiento válido para el procesamiento
- Informar a sus clientes sobre el uso de agentes IA
- Proporcionar mecanismos para ejercer derechos ARCO
- Reportar inmediatamente cualquier brecha de seguridad

**7.3. Rol de NextVoice**
Actuamos como procesador de datos y nos comprometemos a:
- Procesar datos solo según sus instrucciones documentadas
- Implementar medidas de seguridad técnicas y organizativas
- Asistir en el cumplimiento de obligaciones regulatorias
- Eliminar datos al término del servicio según se acuerde`
    },
    {
      id: 'limitacion',
      icon: <AlertTriangle className="w-6 h-6" />,
      title: '8. Limitación de Responsabilidad',
      content: `**8.1. Exclusión de Garantías**
El Servicio se proporciona "tal cual" y "según disponibilidad". No garantizamos:
- Operación ininterrumpida o libre de errores
- Resultados específicos de las campañas de comunicación
- Precisión absoluta de las respuestas de IA
- Compatibilidad con todos los sistemas o dispositivos

**8.2. Limitación de Daños**
En ningún caso NextVoice será responsable por:
- Pérdida de beneficios, datos o uso
- Daños indirectos, incidentales o consecuentes
- Acciones de terceros o eventos de fuerza mayor
- Daños que excedan el monto pagado en los últimos 12 meses

**8.3. Indemnización**
Usted acepta indemnizar a NextVoice por:
- Reclamaciones derivadas de su uso del Servicio
- Violaciones a estos términos o leyes aplicables
- Disputas con sus clientes o terceros
- Contenido que usted proporcione o genere`
    },
    {
      id: 'terminacion',
      icon: <Clock className="w-6 h-6" />,
      title: '9. Duración y Terminación',
      content: `**9.1. Duración**
- El contrato tiene vigencia desde la aceptación hasta su terminación
- Los planes se renuevan automáticamente según el período contratado
- Puede cancelar la renovación automática en cualquier momento

**9.2. Terminación por el Usuario**
Puede terminar el servicio:
- Cancelando desde el panel de configuración
- Enviando notificación por escrito con 30 días de anticipación
- Los servicios continuarán hasta el fin del período pagado

**9.3. Terminación por NextVoice**
Podemos terminar o suspender el servicio:
- Inmediatamente por violación de estos términos
- Con 30 días de aviso por cualquier otra razón
- Sin previo aviso en casos de fraude o actividad ilegal

**9.4. Efectos de la Terminación**
Al terminar el servicio:
- Se revoca el acceso a la plataforma
- Sus datos estarán disponibles para exportación por 30 días
- Después de 30 días, los datos serán eliminados permanentemente
- Las obligaciones de confidencialidad sobreviven la terminación`
    },
    {
      id: 'modificaciones',
      icon: <FileText className="w-6 h-6" />,
      title: '10. Modificaciones a los Términos',
      content: `**10.1. Derecho a Modificar**
Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor:
- Inmediatamente para nuevos usuarios
- 30 días después de la notificación para usuarios existentes

**10.2. Notificación de Cambios**
Le notificaremos cambios materiales mediante:
- Email a la dirección registrada
- Aviso destacado en la plataforma
- Publicación en nuestra página web

**10.3. Aceptación de Cambios**
El uso continuado del Servicio después de la notificación constituye aceptación de los nuevos términos. Si no está de acuerdo, puede terminar el servicio según la Sección 9.`
    },
    {
      id: 'general',
      icon: <Scale className="w-6 h-6" />,
      title: '11. Disposiciones Generales',
      content: `**11.1. Ley Aplicable**
Estos términos se rigen por las leyes de la República de Colombia, sin considerar conflictos de leyes.

**11.2. Jurisdicción**
Cualquier disputa será resuelta por los tribunales competentes de Bogotá, Colombia, renunciando a cualquier otro fuero.

**11.3. Resolución de Disputas**
Antes de iniciar acciones legales, las partes intentarán resolver disputas mediante:
- Negociación directa durante 30 días
- Mediación ante un centro autorizado
- Arbitraje si la mediación no es exitosa

**11.4. Divisibilidad**
Si alguna disposición es declarada inválida, las demás permanecerán en pleno vigor.

**11.5. Cesión**
No puede ceder estos términos sin nuestro consentimiento previo. NextVoice puede ceder libremente en caso de fusión o adquisición.

**11.6. Acuerdo Completo**
Estos términos, junto con la Política de Privacidad y cualquier acuerdo adicional, constituyen el acuerdo completo entre las partes.

**11.7. Renuncia**
La falta de ejercicio de cualquier derecho no constituye renuncia al mismo.`
    },
    {
      id: 'contacto',
      icon: <Mail className="w-6 h-6" />,
      title: '12. Contacto',
      content: `Para cualquier consulta sobre estos Términos y Condiciones, puede contactarnos:

**NextVoice S.A.S.**
- **Email:** legal@nextvoice.com
- **Soporte:** soporte@nextvoice.com
- **Teléfono:** +57 (1) 234-5678
- **Dirección:** Bogotá, Colombia

**Horario de Atención:**
Lunes a Viernes: 8:00 AM - 6:00 PM (GMT-5)

Para ejercer sus derechos sobre datos personales, escriba a: privacidad@nextvoice.com`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
              className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Términos y Condiciones
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
            className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-800"
          >
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Bienvenido a NextVoice. Estos Términos y Condiciones regulan el uso de nuestra plataforma 
              de inteligencia artificial conversacional para la gestión automatizada de comunicaciones 
              empresariales. Por favor, lea detenidamente este documento antes de utilizar nuestros servicios.
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
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
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                >
                  <span className="text-blue-600 dark:text-blue-400">{index + 1}.</span>
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
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
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
                href="/privacidad" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Política de Privacidad
              </a>
              <a 
                href="mailto:legal@nextvoice.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Contactar Legal
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;

