# Sistema de Login Moderno con Clean Architecture

Una aplicación React moderna con una página de login elegante y arquitectura limpia, construida con Tailwind CSS.

## 🚀 Características

- **Diseño Moderno**: Interfaz elegante con gradientes, efectos de vidrio y animaciones suaves
- **Arquitectura Limpia**: Estructura de carpetas organizadas siguiendo principios de Clean Architecture
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Validación Robusta**: Validación de formularios en tiempo real
- **Componentes Reutilizables**: Sistema de componentes modulares
- **Estado de Carga**: Indicadores visuales durante las operaciones
- **Autenticación JWT**: Sistema de autenticación con tokens
- **TypeScript Ready**: Estructura preparada para TypeScript

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/                 # Componentes de autenticación
│   │   ├── LoginPage.jsx     # Página principal de login
│   │   ├── LoginForm.jsx     # Formulario de login
│   │   └── WelcomeSection.jsx # Sección de bienvenida
│   └── common/               # Componentes reutilizables
│       ├── Input.jsx         # Componente de entrada
│       └── Button.jsx        # Componente de botón
├── hooks/                    # Custom Hooks
│   └── useAuth.js           # Hook de autenticación
├── services/                 # Servicios de datos
│   └── authService.js       # Servicio de autenticación
├── utils/                    # Utilidades
│   └── validators.js        # Funciones de validación
├── assets/                   # Recursos estáticos
└── styles/                   # Estilos adicionales
```

## 🛠️ Tecnologías Utilizadas

- **React 19**: Framework de JavaScript
- **Tailwind CSS**: Framework de CSS utilitario
- **PostCSS**: Procesador de CSS
- **Autoprefixer**: Plugin para prefijos de navegador
- **Inter Font**: Tipografía moderna

## 🎨 Características de Diseño

### Página de Login
- **Layout dividido**: Sección de bienvenida y formulario
- **Gradiente atractivo**: Colores morados y azules
- **Efectos de vidrio**: Elementos con backdrop-filter
- **Animaciones suaves**: Transiciones y hover effects
- **Iconos SVG**: Íconos vectoriales incluidos

### Componentes Reutilizables
- **Input personalizado**: Con iconos, validación y estados
- **Button moderno**: Con estados de carga y variantes
- **Validación en tiempo real**: Feedback inmediato al usuario

## 🚀 Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar desarrollo**:
   ```bash
   npm start
   ```

3. **Construir para producción**:
   ```bash
   npm run build
   ```

## 🔐 Sistema de Autenticación

### Servicio de Autenticación
- Manejo de tokens JWT
- Almacenamiento local seguro
- Verificación de expiración
- Logout automático

### Hook de Autenticación
- Estado global de autenticación
- Funciones de login/logout
- Context API para compartir estado

## 🎨 Personalización

### Colores Principales
```css
primary-50: #eff6ff
primary-500: #3b82f6
primary-600: #2563eb
primary-700: #1d4ed8
```

### Animaciones Disponibles
- `fade-in`: Aparición suave
- `slide-up`: Deslizamiento hacia arriba
- `bounce`: Rebote sutil
- `pulse`: Pulsación suave

## 📱 Responsive Design

- **Mobile First**: Diseño que prioriza dispositivos móviles
- **Breakpoints**: sm, md, lg, xl siguiendo Tailwind CSS
- **Componentes adaptables**: Se ajustan automáticamente

## 🔒 Seguridad

- Validación de entrada
- Sanitización de datos
- Almacenamiento seguro de tokens
- Verificación de autenticación

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Coverage
npm run test:coverage
```

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Soporte

Si tienes preguntas o necesitas ayuda, no dudes en crear un issue en el repositorio.

---

**¡Disfruta construyendo aplicaciones increíbles! 🚀**
