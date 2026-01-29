# Configuración de Supabase Storage

Este documento detalla cómo configurar los buckets de Storage para fotos, videos y documentos.

## Buckets Necesarios

El sistema requiere 3 buckets de Storage:

1. **review-photos**: Para fotos de los items de checklist
2. **review-videos**: Para videos de los items de checklist
3. **external-docs**: Para documentos externos (PDF Carvertical, TUV, etc.)

## Paso 1: Crear Buckets

Ve al Dashboard de Supabase > Storage y crea los siguientes buckets:

### 1.1 Bucket: review-photos

- **Name**: `review-photos`
- **Public**: `true` (para que las fotos sean accesibles)
- **File size limit**: `5 MB`
- **Allowed MIME types**: `image/*`

### 1.2 Bucket: review-videos

- **Name**: `review-videos`
- **Public**: `true`
- **File size limit**: `50 MB`
- **Allowed MIME types**: `video/*`

### 1.3 Bucket: external-docs

- **Name**: `external-docs`
- **Public**: `true`
- **File size limit**: `10 MB`
- **Allowed MIME types**: `application/pdf`

## Paso 2: Configurar Políticas de Acceso (RLS)

### Políticas para review-photos

```sql
-- Permitir a revisores subir fotos a sus revisiones asignadas
CREATE POLICY "Reviewers can upload photos to assigned reviews"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-photos'
  AND auth.role() = 'authenticated'
  AND (
    -- Revisor puede subir a sus propias revisiones
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id::text = (storage.foldername(name))[1]
        AND reviews.reviewer_id = auth.uid()
    )
    OR
    -- Admin puede subir a cualquier revisión
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
);

-- Permitir a revisores ver fotos de sus revisiones
CREATE POLICY "Reviewers can view photos from assigned reviews"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'review-photos'
  AND (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id::text = (storage.foldername(name))[1]
        AND reviews.reviewer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
);

-- Permitir a clientes ver fotos de sus revisiones enviadas
CREATE POLICY "Clients can view photos from sent reviews"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'review-photos'
  AND EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id::text = (storage.foldername(name))[1]
      AND reviews.client_id = auth.uid()
      AND reviews.status = 'sent_to_client'
  )
);

-- Permitir a admins actualizar/borrar fotos
CREATE POLICY "Admins can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-photos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-photos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);
```

### Políticas para review-videos

```sql
-- Políticas similares para videos
CREATE POLICY "Reviewers can upload videos to assigned reviews"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-videos'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id::text = (storage.foldername(name))[1]
        AND reviews.reviewer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
);

CREATE POLICY "Reviewers can view videos from assigned reviews"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'review-videos'
  AND (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id::text = (storage.foldername(name))[1]
        AND reviews.reviewer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
);

CREATE POLICY "Clients can view videos from sent reviews"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'review-videos'
  AND EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id::text = (storage.foldername(name))[1]
      AND reviews.client_id = auth.uid()
      AND reviews.status = 'sent_to_client'
  )
);

CREATE POLICY "Admins can update videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-videos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-videos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);
```

### Políticas para external-docs

```sql
-- Solo admins pueden subir documentos
CREATE POLICY "Admins can upload external docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'external-docs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

-- Admins pueden ver todos los documentos
CREATE POLICY "Admins can view external docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'external-docs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

-- Clientes pueden ver documentos de sus revisiones enviadas
CREATE POLICY "Clients can view docs from sent reviews"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'external-docs'
  AND EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id::text = (storage.foldername(name))[1]
      AND reviews.client_id = auth.uid()
      AND reviews.status = 'sent_to_client'
  )
);

-- Admins pueden actualizar/borrar documentos
CREATE POLICY "Admins can update external docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'external-docs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete external docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'external-docs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);
```

## Paso 3: Estructura de Carpetas

Los archivos se organizan por revisión:

```
review-photos/
  ├── [review_id]/
  │   ├── [item_id]_001.jpg
  │   ├── [item_id]_002.jpg
  │   └── ...

review-videos/
  ├── [review_id]/
  │   ├── [item_id]_video.mp4
  │   └── ...

external-docs/
  ├── [review_id]/
  │   ├── carvertical.pdf
  │   ├── tuv.pdf
  │   └── ...
```

## Paso 4: Ejemplo de Uso en Código

### Subir una Foto

```typescript
import { supabase } from './lib/supabase';

async function uploadPhoto(reviewId: string, itemId: string, file: File) {
  const fileName = `${reviewId}/${itemId}_${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('review-photos')
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('review-photos')
    .getPublicUrl(fileName);

  return { path: data.path, url: publicUrl };
}
```

### Subir un Video

```typescript
async function uploadVideo(reviewId: string, itemId: string, file: File) {
  const fileName = `${reviewId}/${itemId}_${Date.now()}.mp4`;

  const { data, error } = await supabase.storage
    .from('review-videos')
    .upload(fileName, file, {
      contentType: 'video/mp4',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('review-videos')
    .getPublicUrl(fileName);

  return { path: data.path, url: publicUrl };
}
```

### Subir un PDF

```typescript
async function uploadExternalDoc(reviewId: string, docType: string, file: File) {
  const fileName = `${reviewId}/${docType}_${Date.now()}.pdf`;

  const { data, error } = await supabase.storage
    .from('external-docs')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('external-docs')
    .getPublicUrl(fileName);

  return { path: data.path, url: publicUrl };
}
```

### Eliminar Archivos

```typescript
async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}
```

## Paso 5: Compresión de Imágenes (Recomendado)

Para optimizar el almacenamiento y la velocidad de carga, instala y usa:

```bash
npm install browser-image-compression
```

```typescript
import imageCompression from 'browser-image-compression';

async function compressAndUpload(file: File) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  const compressedFile = await imageCompression(file, options);
  return await uploadPhoto(reviewId, itemId, compressedFile);
}
```

## Resumen de Verificación

Una vez configurado, verifica:

- [ ] Los 3 buckets están creados
- [ ] Los buckets son públicos
- [ ] Las políticas RLS están aplicadas
- [ ] Puedes subir archivos desde la aplicación
- [ ] Los revisores solo ven sus revisiones
- [ ] Los clientes solo ven revisiones enviadas
- [ ] Los admins tienen acceso completo

## Solución de Problemas

### Error: "new row violates row-level security policy"

- Verifica que las políticas RLS estén aplicadas correctamente
- Verifica que el usuario tenga el rol correcto en la tabla `profiles`
- Verifica que el `review_id` en la ruta del archivo coincida con una revisión existente

### Error: "The resource already exists"

- El archivo ya existe en Storage
- Usa `upsert: true` o cambia el nombre del archivo

### Error: "Payload too large"

- El archivo excede el límite de tamaño configurado
- Comprime la imagen/video antes de subir

---

**Última actualización**: 2026-01-12
