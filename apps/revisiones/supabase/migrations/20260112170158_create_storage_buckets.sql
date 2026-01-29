/*
  # Create Storage Buckets and Policies

  ## Buckets Created
  1. `review-photos` - Public bucket for review photos
  2. `review-videos` - Public bucket for review videos
  3. `external-docs` - Private bucket for external documents (PDFs)

  ## Security Policies
  - Reviewers can upload media to their assigned reviews
  - Admins can upload/delete any media
  - Clients can view media from reviews sent to them
  - All authenticated users can view photos and videos (public buckets)
  - Documents require authentication and proper permissions
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('review-photos', 'review-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('review-videos', 'review-videos', true, 104857600, ARRAY['video/mp4', 'video/quicktime']),
  ('external-docs', 'external-docs', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

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
