# Estrategia PWA Offline-First para App Revisiones

## Objetivo
Permitir que los revisores utilicen la aplicación en zonas sin cobertura (sótanos, garajes), capturando datos, fotos y vídeos, y sincronizando todo automáticamente cuando recuperen la conexión.

## Arquitectura Propuesta

### 1. Vite PWA Plugin
Utilizar `vite-plugin-pwa` para gestionar el Service Worker y el caché de assets estáticos (HTML, CSS, JS, fuentes).

**Configuración Clave:**
- **Strategy**: `injectManifest` (para control total sobre el Service Worker).
- **RegisterType**: `autoUpdate`.
- **Manifest**: Definir `display: standalone`, colores de marca e iconos.

### 2. Almacenamiento Local (IndexedDB)
Usar `idb` o `dexie.js` como wrapper sobre IndexedDB para almacenar datos complejos (no usar localStorage para esto por límites de tamaño).

**Esquema de Datos Local:**
- `reviews_cache`: Copia de las revisiones asignadas.
- `checklist_actions`: Cola de acciones (respuestas, notas) pendientes de sincronización.
- `media_queue`: Cola de archivos (fotos/vídeos) pendientes de subida. Los archivos se guardan como `Blob` en IndexedDB.

### 3. Sistema de Sincronización (Sync Engine)

**Flujo de Trabajo:**
1. **Detección**: Escuchar eventos `online` y `offline` del navegador.
2. **Modo Offline**: 
   - Las lecturas se hacen contra `reviews_cache`.
   - Las escrituras (completar item, subir foto) van a `checklist_actions` y `media_queue`.
   - La UI muestra indicadores "Guardado en dispositivo" o "Sin conexión".
3. **Modo Online (Reconexión)**:
   - El `SyncManager` detecta conexión.
   - Procesa `checklist_actions` en orden secuencial contra Supabase.
   - Procesa `media_queue` subiendo archivos a Supabase Storage.
   - Si una subida falla, se reintenta con backoff exponencial.
   - Una vez vaciadas las colas, descarga los últimos datos de Supabase para actualizar `reviews_cache`.

### 4. Gestión de Conflictos
Como el revisor “posee” la revisión durante el proceso, el riesgo de conflictos de edición es bajo. La estrategia será "Last Write Wins" (Última escritura gana) para los datos del checklist, ya que solo el revisor debería estar tocándolos en ese momento.

## Pasos de Implementación Futura

1. Instalar `vite-plugin-pwa` y `dexie`.
2. Crear clase `OfflineStorage` para abstraer IndexedDB.
3. Crear Hook `useOfflineSync` para manejar el estado de conexión y la cola.
4. Refactorizar llamadas a `supabase` en `ChecklistScreen` para que pasen por una capa intermedia `Repository` que decida si ir a red o a base de datos local.
