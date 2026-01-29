# Próximos Pasos de Desarrollo

Este documento describe el roadmap de desarrollo para completar la aplicación.

## FASE 1: Gestión de Usuarios (Admin) ⏱️ Estimado: 2-3 días

### Objetivos
- Permitir al admin crear y gestionar usuarios sin necesidad de SQL
- Implementar CRUD completo de usuarios

### Tareas

#### 1.1 Crear Componentes de UI
- [ ] Formulario de creación de usuario
  - Campos: email, nombre completo, rol, teléfono, ubicación (para revisores)
  - Validación de email único
  - Generación automática de contraseña o campo manual
  - Select para asignar admin responsable (para clientes)

- [ ] Lista de usuarios con filtros
  - Filtro por rol
  - Filtro por estado (activo/inactivo)
  - Búsqueda por nombre/email

- [ ] Modal de edición de usuario
  - Editar información de perfil
  - Activar/Desactivar usuario
  - Resetear contraseña

#### 1.2 Implementar Lógica de Backend
- [ ] Función para crear usuario con Supabase Auth
- [ ] Función para actualizar perfil
- [ ] Función para listar usuarios con paginación
- [ ] Manejo de errores (email duplicado, etc.)

#### 1.3 Integración con Activity Logs
- [ ] Registrar creación de usuarios
- [ ] Registrar modificaciones
- [ ] Registrar activación/desactivación

---

## FASE 2: Gestión de Revisiones (Admin) ⏱️ Estimado: 3-4 días

### Objetivos
- Crear y asignar revisiones desde el dashboard
- Implementar sistema de QC completo
- Generar y enviar informes a clientes

### Tareas

#### 2.1 Crear Revisiones
- [ ] Formulario de nueva revisión
  - Select cliente
  - Select revisor
  - Datos del vehículo (marca, modelo, año, KM, VIN)
  - Estado inicial: "draft"

- [ ] Vista de lista de revisiones
  - Filtros por estado
  - Filtros por revisor/cliente
  - Búsqueda por VIN/marca/modelo
  - Ordenar por fecha

#### 2.2 Control de Calidad (QC)
- [ ] Vista detallada de revisión
  - Ver todos los items de checklist completados
  - Galería de fotos con opción de eliminar
  - Reproductor de videos con opción de eliminar
  - Edición inline de comentarios y valores

- [ ] Gestión de documentos externos
  - Subir PDFs (Carvertical, TUV, etc.)
  - Previsualizar documentos
  - Eliminar documentos

- [ ] Botones de acción
  - "Rechazar" → vuelve a "in_progress" (revisor debe corregir)
  - "Aprobar y Enviar" → cambia a "sent_to_client" + envía email

#### 2.3 Sistema de Notificaciones
- [ ] Email automático al cliente cuando se envía
  - Template con branding Fran Garcia Cars
  - Link de acceso directo al informe
  - Credenciales de acceso (si es primera vez)

- [ ] Notificación al admin cuando cliente ve informe
  - Actualizar `client_viewed_at` en BD
  - Mostrar indicador visual en lista de revisiones

#### 2.4 Dashboard con Métricas
- [ ] Cards con estadísticas
  - Total revisiones
  - Por estado
  - Por revisor
  - Tiempo promedio de completado

- [ ] Gráficos
  - Revisiones por semana/mes
  - Top modelos revisados
  - Tasa de rechazo en QC
  - Modelos con más problemas

---

## FASE 3: App del Revisor (Mobile) ⏱️ Estimado: 5-7 días

### Objetivos
- Implementar flujo completo de checklist
- Captura de fotos/videos con validación
- Sincronización offline robusta

### Tareas

#### 3.1 Selección y Inicio de Revisión
- [ ] Lista de revisiones asignadas
  - Ver detalles del vehículo
  - Estado actual
  - Botón "Iniciar Revisión"

- [ ] Al iniciar:
  - Actualizar `started_at`
  - Cambiar estado a "in_progress"
  - Iniciar cronómetro total

#### 3.2 Componente de Checklist
- [ ] Navegación por categorías
  - Tabs horizontales con scroll
  - Indicador de progreso por categoría
  - Indicador de validación (completo/incompleto)

- [ ] Renderizado dinámico de items
  - Según `valueType` del item:
    - `select`: Botones grandes estilo chips
    - `text`: Input de texto
    - `number`: Input numérico con teclado numérico
    - `boolean`: Toggle switch

- [ ] Captura de fotos
  - Botón "Añadir Foto"
  - Abrir cámara nativa
  - Guardar en Supabase Storage
  - **Guardar copia en galería del dispositivo**
  - Mostrar miniaturas
  - Permitir eliminar

- [ ] Captura de videos
  - Botón "Grabar Video"
  - Abrir cámara en modo video
  - Límite de duración según item
  - Guardar en Supabase Storage
  - **Guardar copia en galería del dispositivo**
  - Mostrar thumbnail
  - Permitir eliminar

#### 3.3 Validación y Bloqueo
- [ ] No permitir avanzar de categoría si:
  - Faltan campos obligatorios
  - Faltan fotos mínimas
  - Faltan videos obligatorios

- [ ] Botón "Finalizar" solo disponible si:
  - TODAS las categorías están completas
  - TODOS los campos obligatorios están llenos

- [ ] Mensajes claros de error
  - Lista de items pendientes
  - Scroll automático al primer error

#### 3.4 Control de Tiempo
- [ ] Cronómetro total
  - Iniciar al abrir revisión
  - Continuar en background
  - Guardar cada 30 segundos

- [ ] Botón de Pausa
  - Sumar tiempo pausado
  - Mostrar indicador visual

- [ ] Cronómetro de conducción
  - Iniciar al entrar en categoría "Test Drive"
  - Guardar separadamente en `driving_time_seconds`

#### 3.5 Finalización
- [ ] Al pulsar "Finalizar":
  - Validación final
  - Actualizar `completed_at`
  - Cambiar estado a "pending_qc"
  - Enviar notificación al admin
  - Crear activity log

---

## FASE 4: Vista del Cliente ⏱️ Estimado: 3-4 días

### Objetivos
- Diseño premium del informe
- Solo mostrar información seleccionada
- Experiencia de lectura optimizada

### Tareas

#### 4.1 Estructura del Informe
- [ ] Header con datos del vehículo
  - Foto portada grande
  - Marca, modelo, año, KM, VIN
  - Fecha de revisión

- [ ] Resumen ejecutivo
  - Puntuación general (basada en valores select)
  - Puntos críticos detectados
  - Recomendaciones generales

#### 4.2 Secciones del Informe
- [ ] Navegación por categorías
  - Accordion/collapsible sections
  - Icons y colores según estado

- [ ] Items individuales
  - Solo mostrar si tienen valor o comentario
  - Color-coding según valor (rojo/amarillo/verde)
  - Comentario del revisor (si existe)

- [ ] Galería de fotos
  - Grid responsive
  - Lightbox para ampliar
  - Agrupadas por item

- [ ] Videos
  - Player embebido
  - Controls personalizados

#### 4.3 Documentos Externos
- [ ] Sección de documentos
  - Lista de PDFs disponibles
  - Botón de descarga
  - Previsualización (si navegador lo soporta)

#### 4.4 Acciones del Cliente
- [ ] Botón "Contactar por WhatsApp"
  - Link directo a WhatsApp del admin responsable
  - Mensaje pre-rellenado con referencia

- [ ] Botón "Descargar Informe PDF"
  - Generar PDF del informe (fase futura)

---

## FASE 5: Offline y PWA ⏱️ Estimado: 4-5 días

### Objetivos
- App funcional sin conexión
- Sincronización automática al recuperar red
- Instalable como app nativa

### Tareas

#### 5.1 Service Worker
- [ ] Configurar Vite PWA plugin
- [ ] Estrategia de cache
  - Cache-first para assets estáticos
  - Network-first para API calls
  - Background sync para POST/PUT

- [ ] Precaching
  - HTML, CSS, JS, imágenes del UI
  - Iconos, logo

#### 5.2 IndexedDB
- [ ] Schema local
  - Tabla de reviews
  - Tabla de checklist_items
  - Tabla de media (pendiente de subir)
  - Tabla de sync_queue

- [ ] CRUD operations
  - Guardar datos localmente
  - Sincronizar con Supabase cuando hay red
  - Resolver conflictos (last-write-wins)

#### 5.3 Gestión de Media Offline
- [ ] Almacenar fotos/videos localmente
  - IndexedDB para blobs pequeños
  - File System API para blobs grandes (si disponible)

- [ ] Cola de subida
  - Añadir a `sync_queue` al capturar
  - Subir automáticamente cuando haya red
  - Reintentar en caso de fallo
  - Mostrar indicador de progreso

#### 5.4 Backup a Galería
- [ ] Implementar usando:
  - Web Share API (para compartir a galería)
  - File System Access API (Chrome/Edge)
  - Fallback: download automático

#### 5.5 Manifest.json
- [ ] Configurar manifest
  - Nombre: "Fran Garcia Cars - Revisiones"
  - Icons en múltiples tamaños
  - Theme color: #0029D4
  - Display: standalone
  - Start URL: /

- [ ] Prompt de instalación
  - Detectar si ya está instalada
  - Mostrar banner de instalación
  - Ocultar después de instalar

#### 5.6 Sincronización en Background
- [ ] Background Sync API
  - Registrar sync al crear/modificar datos offline
  - Sincronizar cuando se recupere la red
  - Notificar al usuario del resultado

---

## FASE 6: Mejoras y Optimizaciones ⏱️ Estimado: 2-3 días

### Tareas

#### 6.1 Performance
- [ ] Lazy loading de imágenes
- [ ] Compresión de imágenes antes de subir
- [ ] Thumbnails para fotos grandes
- [ ] Code splitting por rutas

#### 6.2 UX
- [ ] Skeleton screens durante carga
- [ ] Animaciones y transiciones suaves
- [ ] Toast notifications
- [ ] Confirmaciones antes de acciones destructivas

#### 6.3 Testing
- [ ] Probar offline mode end-to-end
- [ ] Probar en dispositivos reales
- [ ] Probar sincronización con red intermitente
- [ ] Probar backup a galería en iOS/Android

#### 6.4 Seguridad
- [ ] Revisar políticas RLS
- [ ] Audit de permisos
- [ ] Rate limiting en endpoints críticos
- [ ] Validación de tamaño de archivos

---

## FASE 7: Features Avanzados (Opcional) ⏱️ Estimado: Variable

### 7.1 Generación de PDF
- [ ] Template de informe en PDF
- [ ] Generar PDF server-side (Edge Function)
- [ ] Incluir todas las fotos
- [ ] Branding profesional

### 7.2 OCR de VIN
- [ ] Integrar servicio OCR
- [ ] Escanear VIN desde foto
- [ ] Auto-completar campos

### 7.3 "Segunda Opinión"
- [ ] Generar informe parcial
- [ ] Solo audio/video de motor
- [ ] Compartir por email/WhatsApp a mecánicos externos

### 7.4 Analytics
- [ ] Dashboard de métricas avanzado
- [ ] Gráficos interactivos
- [ ] Exportar reportes
- [ ] Análisis de tendencias (ej: modelos con más problemas)

### 7.5 Notificaciones Push
- [ ] Firebase Cloud Messaging
- [ ] Notificar a revisor cuando se asigna revisión
- [ ] Notificar a admin cuando se completa revisión
- [ ] Notificar a cliente cuando está listo

### 7.6 Multi-idioma
- [ ] i18n setup (react-i18next)
- [ ] Español (actual)
- [ ] Alemán
- [ ] Inglés

---

## Priorización Recomendada

1. **Crítico (Sprint 1)**: Fases 1, 2, 3
2. **Importante (Sprint 2)**: Fases 4, 5
3. **Nice to have (Sprint 3)**: Fase 6
4. **Futuro**: Fase 7

## Tiempo Total Estimado

- **MVP funcional**: 13-18 días
- **Versión completa**: 15-21 días
- **Con features avanzados**: +10-15 días adicionales

---

## Consideraciones Técnicas

### Supabase Storage
Necesitarás configurar buckets de Storage:
- `review-photos`: Para fotos de checklist
- `review-videos`: Para videos
- `external-docs`: Para PDFs

### Políticas de Storage
```sql
-- Permitir a revisores subir a su review
CREATE POLICY "Reviewers can upload to assigned reviews"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'review-photos'
    AND EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id::text = (storage.foldername(name))[1]
        AND reviews.reviewer_id = auth.uid()
    )
  );

-- Similar para videos y docs
```

### Compresión de Imágenes
Considerar usar:
- `browser-image-compression` (client-side)
- Sharp (server-side en Edge Functions)

### Límites Recomendados
- Foto: Max 5MB, comprimir a 1920x1080
- Video: Max 50MB, max 60 segundos
- PDF: Max 10MB

---

**Última actualización**: 2026-01-12
