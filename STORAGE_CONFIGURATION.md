# Configuración de Supabase Storage

Este documento contiene las instrucciones para configurar los buckets de almacenamiento y sus políticas de seguridad en Supabase.

## Buckets Requeridos

Debes crear los siguientes buckets en tu proyecto de Supabase:

1. **review-photos** - Para almacenar fotos de las revisiones
2. **review-videos** - Para almacenar videos de las revisiones
3. **external-docs** - Para almacenar documentos externos (PDFs)

## Paso 1: Crear Buckets

Ve a **Storage** en el panel de Supabase y crea los tres buckets con la siguiente configuración:

### review-photos
- **Nombre**: `review-photos`
- **Público**: ✅ Sí (para que las fotos sean accesibles directamente)
- **Tamaño máximo de archivo**: 10 MB
- **Tipos de archivo permitidos**: image/jpeg, image/png, image/webp

### review-videos
- **Nombre**: `review-videos`
- **Público**: ✅ Sí (para que los videos sean accesibles directamente)
- **Tamaño máximo de archivo**: 100 MB
- **Tipos de archivo permitidos**: video/mp4, video/quicktime

### external-docs
- **Nombre**: `external-docs`
- **Público**: ❌ No (documentos privados, requieren autenticación)
- **Tamaño máximo de archivo**: 10 MB
- **Tipos de archivo permitidos**: application/pdf

## Paso 2: Configurar Políticas RLS

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase para configurar las políticas de seguridad:

```sql
-- =====================================================
-- POLÍTICAS PARA review-photos
-- =====================================================

-- Permitir a revisores subir fotos a sus revisiones asignadas
CREATE POLICY "Reviewers can upload photos to their reviews"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-photos' AND
  EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id::text = (storage.foldername(name))[1]
    AND reviews.reviewer_id = auth.uid()
  )
);

-- Permitir a admins subir fotos a cualquier revisión
CREATE POLICY "Admins can upload photos to any review"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-photos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Permitir a todos los usuarios autenticados ver fotos
CREATE POLICY "Anyone authenticated can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'review-photos');

-- Permitir a admins eliminar fotos
CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-photos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS PARA review-videos
-- =====================================================

-- Permitir a revisores subir videos a sus revisiones asignadas
CREATE POLICY "Reviewers can upload videos to their reviews"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-videos' AND
  EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id::text = (storage.foldername(name))[1]
    AND reviews.reviewer_id = auth.uid()
  )
);

-- Permitir a admins subir videos a cualquier revisión
CREATE POLICY "Admins can upload videos to any review"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-videos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Permitir a todos los usuarios autenticados ver videos
CREATE POLICY "Anyone authenticated can view videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'review-videos');

-- Permitir a admins eliminar videos
CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-videos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS PARA external-docs
-- =====================================================

-- Permitir a admins y revisores subir documentos
CREATE POLICY "Admins and reviewers can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'external-docs' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'reviewer')
  )
);

-- Permitir a admins ver todos los documentos
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'external-docs' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Permitir a clientes ver documentos de sus revisiones enviadas
CREATE POLICY "Clients can view their review documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'external-docs' AND
  EXISTS (
    SELECT 1 FROM reviews
    INNER JOIN external_docs ON external_docs.review_id = reviews.id
    WHERE reviews.id::text = (storage.foldername(name))[1]
    AND reviews.client_id = auth.uid()
    AND reviews.status = 'sent_to_client'
  )
);

-- Permitir a revisores ver documentos de sus revisiones asignadas
CREATE POLICY "Reviewers can view their review documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'external-docs' AND
  EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id::text = (storage.foldername(name))[1]
    AND reviews.reviewer_id = auth.uid()
  )
);

-- Permitir a admins eliminar documentos
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'external-docs' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

## Paso 3: Verificar Configuración

Después de ejecutar el SQL, verifica que:

1. Los tres buckets están creados
2. Las políticas aparecen en la sección de Storage Policies
3. Puedes subir y acceder a archivos de prueba

## Estructura de Archivos

Los archivos se organizarán con la siguiente estructura:

```
review-photos/
  └── {review_id}/
      └── {checklist_item_id}/
          └── {timestamp}_{filename}.jpg

review-videos/
  └── {review_id}/
      └── {checklist_item_id}/
          └── {timestamp}_{filename}.mp4

external-docs/
  └── {review_id}/
      └── {timestamp}_{filename}.pdf
```

## Notas de Seguridad

- Las fotos y videos son **públicos** para facilitar el acceso desde el cliente, pero las URLs contienen rutas complejas difíciles de adivinar
- Los documentos son **privados** y solo accesibles mediante URLs firmadas con tiempo de expiración
- Todas las políticas requieren autenticación
- Los clientes solo pueden ver documentos de revisiones que se les han enviado oficialmente
