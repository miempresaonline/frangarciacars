-- =====================================================
-- STORAGE POLICIES FOR VEHICLE INSPECTION SYSTEM
-- =====================================================
-- This file contains all RLS policies for Storage buckets
-- Execute this after creating the buckets: review-photos, review-videos, external-docs

-- =====================================================
-- REVIEW-PHOTOS BUCKET POLICIES
-- =====================================================

-- Reviewers and admins can upload photos
CREATE POLICY "Reviewers and admins can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-photos'
  AND (
    -- Reviewer can upload to assigned reviews
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id::text = (storage.foldername(name))[1]
        AND reviews.reviewer_id = auth.uid()
    )
    OR
    -- Admin can upload to any review
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
);

-- Reviewers and admins can view photos from relevant reviews
CREATE POLICY "Reviewers and admins can view photos"
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

-- Clients can view photos from their sent reviews
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

-- Admins can update photos
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

-- Admins can delete photos
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

-- =====================================================
-- REVIEW-VIDEOS BUCKET POLICIES
-- =====================================================

-- Reviewers and admins can upload videos
CREATE POLICY "Reviewers and admins can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
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

-- Reviewers and admins can view videos from relevant reviews
CREATE POLICY "Reviewers and admins can view videos"
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

-- Clients can view videos from their sent reviews
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

-- Admins can update videos
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

-- Admins can delete videos
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

-- =====================================================
-- EXTERNAL-DOCS BUCKET POLICIES
-- =====================================================

-- Only admins can upload external docs
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

-- Admins can view all external docs
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

-- Clients can view docs from their sent reviews
CREATE POLICY "Clients can view external docs from sent reviews"
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

-- Admins can update external docs
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

-- Admins can delete external docs
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

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify policies are created correctly

SELECT
  policyname,
  tablename,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, cmd, policyname;
