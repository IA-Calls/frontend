# Sistema de Deadlines para Usuarios

## Descripción General

El sistema de deadlines permite establecer fechas de expiración para las cuentas de usuario, con opciones predefinidas y visualización clara del estado de cada cuenta.

## Características Principales

### 1. Opciones de Deadline
- **Sin expiración**: La cuenta no tiene fecha límite
- **1 minuto**: Para pruebas rápidas
- **1 día**: Para cuentas temporales de corta duración
- **1 semana**: Para cuentas de prueba o temporales
- **1 mes**: Para cuentas con acceso limitado

### 2. Cálculo Automático
- Los deadlines se calculan automáticamente desde la fecha actual
- Se muestran en tiempo real en el modal de creación/edición
- Formato legible en español (dd/mm/aaaa hh:mm)

### 3. Estados Visuales
- 🟢 **Activo**: Deadline válido y no próximo a expirar
- 🟠 **Próximo a expirar**: Deadline válido pero expira en las próximas 24 horas
- 🔴 **Expirado**: Deadline ya pasó
- ⚪ **Sin expiración**: No tiene deadline configurado

### 4. Filtros de Búsqueda
- **Todos los deadlines**: Muestra todos los usuarios
- **Expirados**: Solo usuarios con deadline vencido
- **Activos**: Usuarios con deadline válido
- **Sin expiración**: Usuarios sin deadline configurado

## Implementación Técnica

### Campos de Base de Datos
```json
{
  "time": "2024-12-31T23:59:59.000Z"
}
```

### Componentes Modificados
1. **UserModal.jsx**: Agregado selector de deadline y cálculo automático
2. **UserManagementContent.jsx**: Nueva columna de deadline con indicadores visuales
3. **Tabla de usuarios**: Muestra deadline, tiempo restante y estado

### Funciones Principales
- `calculateDeadline(deadlineType)`: Calcula fecha basada en el tipo seleccionado
- `formatDeadline(deadlineString)`: Formatea y calcula tiempo restante
- `isDeadlineExpiringSoon(deadline)`: Detecta si expira en las próximas 24h

## Uso del Sistema

### Crear Usuario con Deadline
1. Abrir modal "Nuevo Usuario"
2. Seleccionar tipo de deadline del dropdown
3. Ver fecha calculada automáticamente
4. Guardar usuario

### Editar Deadline de Usuario
1. Hacer clic en "Editar" en la tabla
2. Cambiar tipo de deadline
3. Ver nueva fecha calculada
4. Guardar cambios

### Visualizar Estados
- **Columna Deadline**: Muestra fecha, tiempo restante y estado
- **Indicadores de color**: Verde (activo), naranja (próximo a expirar), rojo (expirado)
- **Filtros**: Permiten buscar por estado de deadline

## Beneficios

1. **Control de Acceso**: Limita el tiempo de acceso de usuarios temporales
2. **Seguridad**: Las cuentas expiran automáticamente
3. **Flexibilidad**: Múltiples opciones de duración
4. **Visibilidad**: Estado claro y fácil de entender
5. **Filtrado**: Búsqueda eficiente por estado de deadline

## Consideraciones

- Los deadlines se calculan desde el momento de creación/edición
- El sistema detecta automáticamente cuentas próximas a expirar (24h)
- Los usuarios expirados se marcan claramente en la interfaz
- El filtro permite gestionar fácilmente cuentas por estado de deadline

## Próximas Mejoras

- Notificaciones automáticas antes de la expiración
- Reportes de usuarios próximos a expirar
- Renovación automática de deadlines
- Historial de cambios de deadline
