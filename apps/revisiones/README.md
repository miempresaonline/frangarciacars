# Sistema de Gestión de Revisiones de Vehículos - Fran Garcia Cars

PWA profesional para la gestión de revisiones de vehículos en Alemania con funcionalidad offline-first.

## Estado Actual del Proyecto

### ✅ Completado

1. **Base de Datos Supabase**
   - Esquema completo creado con 7 tablas principales
   - RLS (Row Level Security) configurado para todos los roles
   - Triggers automáticos para auditoría y tracking
   - Índices optimizados para rendimiento

2. **Sistema de Autenticación**
   - Login con email/contraseña
   - Mostrar/ocultar contraseña con botón toggle
   - Validación de email en tiempo real
   - Animaciones de entrada suaves y profesionales
   - Feedback visual mejorado con iconos contextuales
   - Mensajes de error específicos y claros
   - Gestión de sesiones persistentes
   - Contexto de autenticación global
   - Enrutamiento basado en roles (Admin, Revisor, Cliente)
   - Sistema de logs para debugging de problemas de login

3. **Tipos TypeScript**
   - Tipos completos para todas las entidades de BD
   - Definición completa de checklist con 6 categorías y +80 puntos de inspección
   - Tipos auxiliares para la aplicación

4. **Estructura Base de la Aplicación**
   - Dashboard de Administrador (desktop-optimized)
   - Interfaz de Revisor (mobile-first)
   - Vista de Cliente (premium experience)
   - Navegación y layouts responsive

5. **Gestión de Usuarios (Admin)**
   - Formulario modal para crear usuarios
   - Lista de usuarios con filtros (rol, estado, búsqueda)
   - Activar/desactivar usuarios
   - Asignación de admin responsable para clientes
   - Integración completa con Supabase Auth

6. **Gestión de Revisiones (Admin)**
   - Formulario modal para crear revisiones
   - Asignación de cliente, revisor y admin responsable
   - Captura de datos del vehículo (marca, modelo, año, KM, VIN)
   - Lista de revisiones con filtros por estado
   - Vista de detalles con información completa

7. **Dashboard con Métricas**
   - Estadísticas en tiempo real (total, en progreso, pendiente QC, enviadas)
   - Cálculo de tiempo promedio de revisión
   - Lista de revisiones recientes
   - Indicadores visuales de estado
   - Notificación cuando cliente ha visto el informe

8. **Configuración de Supabase Storage**
   - Documentación completa para crear buckets
   - Políticas RLS para fotos, videos y documentos
   - Ejemplos de código para subir/eliminar archivos
   - Estructura de carpetas por revisión

### 🚧 Siguiente Fase de Desarrollo

5. **App Revisor - Checklist Completa**
   - Gestión de usuarios (crear revisores y clientes)
   - Crear y asignar revisiones
   - Control de calidad (QC) de revisiones
   - Métricas y KPIs en tiempo real
   - Gestión de documentos externos

6. **App Revisor - Funcionalidades de Campo**
   - Flujo de checklist paso a paso
   - Captura de fotos/videos con backup a galería
   - Validación de campos obligatorios
   - Trackeo de tiempo (total, conducción, pausas)
   - Sincronización offline

7. **Vista Cliente - Informe Premium**
   - Visualización filtrada del informe
   - Galería de fotos/videos
   - Descarga de documentos externos
   - Tracking de visualización

8. **PWA y Offline**
   - Service Workers
   - IndexedDB para estado local
   - Cola de sincronización
   - Backup automático a galería del dispositivo

## Estructura de la Base de Datos

### Tablas Principales

#### `profiles`
Extensión de auth.users con información de roles y metadata.

#### `reviews`
Entidad principal de la revisión de vehículos.
- Estados: draft → in_progress → pending_qc → confirmed → sent_to_client

#### `checklist_items`
Items individuales de la checklist con valores y comentarios.

#### `checklist_media`
Fotos y videos asociados a items de checklist.

#### `external_docs`
Documentos PDF externos (Carvertical, TUV, Mantenimiento).

#### `activity_logs`
Auditoría completa de todas las acciones en el sistema.

#### `sync_queue`
Cola para sincronización offline de la app de revisores.

## Estructura de la Checklist

La checklist está dividida en 6 categorías principales:

1. **Exterior** (21 puntos)
   - Estado de chapa, espesímetro, faros, neumáticos, frenos, etc.

2. **Interior** (14 puntos)
   - Desgaste, cuadro instrumentos, cinturones, multimedia, etc.

3. **Motor y Mecánica** (20 puntos)
   - Fugas, aceite, arranque, ralentí, correas, suspensión, etc.

4. **Diagnosis OBD** (9 puntos)
   - Lectura de errores, verificación de KM, análisis de unidades

5. **Prueba de Conducción** (7 puntos)
   - Dirección, frenada, cambios, potencia, suspensión

6. **Documentación y Extras** (9 puntos)
   - Vídeo 360°, foto portada, papeles, historial mantenimiento, VIN

**Total: +80 puntos de inspección**

## Configuración Inicial

### 1. Variables de Entorno

El archivo `.env` ya está configurado con las credenciales de Supabase.

### 2. Crear Usuario Administrador

Para crear el primer usuario administrador, puedes usar el Dashboard de Supabase o el SQL Editor:

```sql
-- Este SQL crea un usuario admin de ejemplo
-- IMPORTANTE: Cambia el email y contraseña por los valores reales

-- Primero, ve a Authentication > Users en Supabase Dashboard
-- y crea un usuario con email y contraseña

-- Luego ejecuta esto con el ID del usuario creado:
INSERT INTO profiles (id, role, full_name, email, active, metadata)
VALUES (
  'USER_ID_AQUI',  -- Reemplaza con el UUID del usuario de auth.users
  'admin',
  'Francesc Garcia',
  'admin@frangarciacars.com',
  true,
  '{}'::jsonb
);
```

### 3. Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Credenciales de Prueba

Una vez creado el usuario administrador, podrás:

1. **Iniciar sesión** con el email y contraseña configurados
2. **Crear Revisores** desde el panel de administración
3. **Crear Clientes** y asignarles un responsable interno
4. **Crear Revisiones** y asignarlas a revisores

## Roles y Permisos

### Admin
- Acceso completo a todo el sistema
- Crear y gestionar usuarios
- Crear y asignar revisiones
- Control de calidad (editar/aprobar revisiones)
- Ver todas las métricas y logs

### Reviewer
- Ver revisiones asignadas
- Completar checklist
- Subir fotos/videos
- Marcar revisión como completada
- Modo offline con sincronización

### Client
- Ver solo su propia revisión (cuando está enviada)
- Acceso de solo lectura
- Disclaimer obligatorio antes de ver informe

## Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado con políticas estrictas:

- Los clientes solo ven sus propias revisiones enviadas
- Los revisores solo ven sus revisiones asignadas
- Los admins tienen acceso completo
- Todas las acciones se registran en activity_logs

## Próximos Pasos

Para continuar el desarrollo:

1. **Implementar la gestión de usuarios en Admin Dashboard**
   - Formulario para crear usuarios
   - Listado de usuarios con filtros
   - Edición de perfiles

2. **Desarrollar el flujo completo de revisión en Reviewer App**
   - Implementar el componente de checklist con validación
   - Integrar captura de fotos/videos
   - Añadir sincronización offline

3. **Crear la vista de informe completa para Cliente**
   - Diseño premium del informe
   - Galería de fotos optimizada
   - Integración de documentos externos

4. **Añadir capacidades PWA**
   - Configurar Service Workers
   - Implementar IndexedDB
   - Añadir manifest.json

## Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Build**: Vite
- **Icons**: Lucide React
- **Deployment**: Ready for production

## Soporte

Para preguntas o asistencia técnica, contactar con el equipo de desarrollo.

---

**Fran Garcia Cars** © 2026 - Sistema de Gestión de Revisiones Profesional
