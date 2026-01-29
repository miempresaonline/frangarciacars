# Changelog

Registro de cambios y mejoras del Sistema de Gestión de Revisiones.

## [2026-01-12] - Versión Inicial v0.1.0

### Añadido

#### Infraestructura Base
- Configuración completa de base de datos Supabase con 7 tablas
- Sistema de autenticación con roles (Admin, Revisor, Cliente)
- Row Level Security (RLS) configurado para todas las tablas
- Triggers automáticos para auditoría y logging
- Definición TypeScript completa del esquema de BD

#### Checklist de Inspección
- Definición completa de 80+ puntos de inspección
- 6 categorías: Exterior, Interior, Motor, OBD, Prueba de Conducción, Documentación
- Validaciones por tipo (select, text, number, boolean, fotos, videos)
- Requisitos de fotos/videos mínimos por item
- Documentación de referencia completa (CHECKLIST_REFERENCE.md)

#### Panel de Administrador
- Dashboard con métricas en tiempo real
  - Total de revisiones
  - Revisiones en progreso
  - Revisiones pendientes de QC
  - Revisiones enviadas a cliente
  - Tiempo promedio de revisión
- **Gestión de Usuarios**
  - Crear usuarios (Admin, Revisor, Cliente)
  - Lista de usuarios con filtros por rol y estado
  - Búsqueda por nombre/email
  - Activar/desactivar usuarios
  - Asignación de admin responsable para clientes
  - Integración con Supabase Auth
- **Gestión de Revisiones**
  - Crear nuevas revisiones
  - Asignar cliente, revisor y admin responsable
  - Capturar datos del vehículo (marca, modelo, año, KM, VIN)
  - Lista de revisiones con filtros por estado
  - Búsqueda por vehículo, VIN o cliente
  - Indicadores visuales de estado
  - Notificación cuando cliente ha visto el informe
- Navegación lateral responsive
- Diseño desktop-optimized

#### Interfaz de Revisor
- Dashboard mobile-first
- Lista de revisiones asignadas
- Perfil de usuario
- Navegación optimizada para dispositivos móviles
- (Checklist completa en siguiente fase)

#### Vista de Cliente
- Pantalla de disclaimer obligatorio con términos y condiciones
- Vista premium del informe
- Diseño limpio y profesional
- (Visualización completa del informe en siguiente fase)

#### Autenticación
- Login con email/contraseña
- Gestión de sesiones persistentes
- AuthContext global para React
- Enrutamiento automático basado en roles
- Protección de rutas
- Pantalla de carga

#### Supabase Storage
- Documentación completa para configuración de buckets
- Políticas RLS para:
  - `review-photos`: Fotos de checklist
  - `review-videos`: Videos de checklist
  - `external-docs`: Documentos PDF externos
- Ejemplos de código para subir/eliminar archivos
- Estructura de carpetas organizadas por revisión
- SQL script para aplicar políticas automáticamente

#### Documentación
- `README.md`: Visión general y estado del proyecto
- `SETUP.md`: Guía paso a paso para configuración inicial
- `CHECKLIST_REFERENCE.md`: Referencia completa de 80+ puntos de inspección
- `NEXT_STEPS.md`: Roadmap detallado en 7 fases
- `SUPABASE_STORAGE_SETUP.md`: Guía completa de configuración de Storage
- `CHANGELOG.md`: Este archivo

#### Calidad de Código
- TypeScript strict mode
- Componentes modulares y reutilizables
- Separación clara de responsabilidades
- Manejo de errores robusto
- Loading states consistentes
- ESLint configurado
- Build exitoso sin errores

### Características Técnicas

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Estado**: React Context API
- **Autenticación**: Supabase Auth

### Métricas del Proyecto

- **Tablas de BD**: 7
- **Tipos personalizados**: 7 enums
- **Políticas RLS**: 38+
- **Puntos de checklist**: 80+
- **Categorías**: 6
- **Componentes React**: 10+
- **Archivos TypeScript**: 15+
- **Líneas de código**: ~3,500+
- **Tiempo de build**: ~5 segundos

## Próximas Versiones

### v0.2.0 - App Revisor Completa (Próximamente)
- Implementación completa del flujo de checklist
- Captura de fotos/videos con validación
- Backup automático a galería del dispositivo
- Control de tiempo (total, conducción, pausas)
- Validación bloqueante de campos obligatorios
- Sincronización offline

### v0.3.0 - Vista Cliente Premium (Próximamente)
- Visualización completa del informe
- Galería de fotos optimizada
- Reproductor de videos embebido
- Descarga de documentos externos
- Botón de contacto WhatsApp

### v0.4.0 - PWA y Offline (Próximamente)
- Service Workers
- IndexedDB para estado local
- Cola de sincronización
- Background sync
- Manifest.json
- Instalable como app nativa

### v0.5.0 - Control de Calidad Admin (Próximamente)
- Vista detallada de revisión para QC
- Edición inline de comentarios
- Eliminar fotos/videos inapropiados
- Añadir documentos externos
- Aprobar y enviar a cliente
- Rechazar para corrección

---

**Mantenido por**: Equipo de Desarrollo Fran Garcia Cars
**Última actualización**: 2026-01-12
