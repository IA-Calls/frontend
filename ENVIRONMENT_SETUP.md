# Configuración de Entorno - Sistema de Versionamiento

Este proyecto ahora incluye un sistema de versionamiento de entorno que permite manejar diferentes configuraciones según el ambiente de ejecución.

## 🚀 Scripts Disponibles

### Desarrollo Local
```bash
npm run start:development
```
- Usa las URLs del backend local (localhost:5000)
- Carga variables desde `env.development`

### Producción
```bash
npm run start:production
```
- Usa las URLs del backend de producción
- Carga variables desde `env.production`

### Scripts de Build
```bash
npm run build:development    # Build para desarrollo
npm run build:production     # Build para producción
```

## 📁 Archivos de Configuración

### `env.development`
Contiene las variables para desarrollo local:
- Backend: `http://localhost:5000`
- URLs de API locales

### `env.production`
Contiene las variables para producción:
- Backend: `https://your-production-backend.com`
- URLs de API de producción

### `src/config/environment.js`
Archivo centralizado que:
- Carga las variables de entorno
- Proporciona métodos helper
- Maneja fallbacks por defecto

## 🔧 Variables de Entorno Disponibles

```bash
REACT_APP_ENV                          # Ambiente actual
REACT_APP_BACKEND_URL                  # URL base del backend
REACT_APP_TWILIO_CALL_URL             # URL del servicio Twilio
REACT_APP_CLIENTS_PENDING_API_URL     # Endpoint de clientes pendientes
REACT_APP_GROUPS_API_URL              # Endpoint de grupos
REACT_APP_EXTRACT_EXCEL_API_URL       # Endpoint de extracción Excel
REACT_APP_OUTBOUND_CALL_PROXY_API_URL # Endpoint de llamadas salientes
```

## 📝 Uso en el Código

```javascript
import config from '../config/environment.js'

// Usar variables directamente
const apiUrl = config.BACKEND_URL

// Verificar ambiente
if (config.isDevelopment()) {
  console.log('Modo desarrollo')
}

// Construir URLs completas
const fullUrl = config.getApiUrl('/api/users')
```

## 🚨 Notas Importantes

1. **REACT_APP_**: Todas las variables deben empezar con `REACT_APP_` para ser accesibles en React
2. **Archivos .env**: Los archivos `env.development` y `env.production` están en `.gitignore` por seguridad
3. **Fallbacks**: El sistema incluye valores por defecto para desarrollo local
4. **Logging**: En desarrollo, se muestran logs del ambiente actual

## 🔄 Migración

Si tienes URLs hardcodeadas en tu código, reemplázalas por:

```javascript
// Antes
const API_URL = "http://localhost:5000/api"

// Después
import config from '../config/environment.js'
const API_URL = config.BACKEND_URL + '/api'
```

## 🛠️ Personalización

Para agregar nuevas variables:

1. Agregar en `env.development` y `env.production`
2. Actualizar `src/config/environment.js`
3. Usar en tu componente

```javascript
// En env.development
REACT_APP_NEW_API_URL=http://localhost:5000/new-api

// En environment.js
NEW_API_URL: process.env.REACT_APP_NEW_API_URL || 'http://localhost:5000/new-api'

// En tu componente
const newApiUrl = config.NEW_API_URL
```
