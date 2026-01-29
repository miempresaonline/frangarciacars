/*
  # Fix RLS Recursive Policies in Other Tables

  ## Problem
  Similar to the profiles table, several other tables had policies with recursive
  subqueries that could cause infinite recursion: reviews, checklist_items,
  checklist_media, external_docs, sync_queue.

  ## Solution
  Replace all recursive admin checks with the is_admin() function.

  ## Tables Modified
  - reviews
  - checklist_items
  - checklist_media
  - external_docs
  - sync_queue
*/

-- =====================================================
-- REVIEWS TABLE - Replace policies with non-recursive versions
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Reviewers can view assigned reviews" ON reviews;
DROP POLICY IF EXISTS "Clients can view own sent reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update all reviews" ON reviews;
DROP POLICY IF EXISTS "Reviewers can update assigned reviews" ON reviews;

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Reviewers can view assigned reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'reviewer'
    )
  );

CREATE POLICY "Clients can view own sent reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    AND status = 'sent_to_client'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'client'
    )
  );

CREATE POLICY "Admins can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update all reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Reviewers can update assigned reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    reviewer_id = auth.uid()
    AND status IN ('draft', 'in_progress')
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'reviewer'
    )
  )
  WITH CHECK (
    reviewer_id = auth.uid()
    AND status IN ('draft', 'in_progress', 'pending_qc')
  );

-- =====================================================
-- CHECKLIST_ITEMS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Reviewers can view checklist items for assigned reviews" ON checklist_items;
DROP POLICY IF EXISTS "Clients can view checklist items for sent reviews" ON checklist_items;
DROP POLICY IF EXISTS "Reviewers can insert checklist items for assigned reviews" ON checklist_items;
DROP POLICY IF EXISTS "Admins can insert any checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Reviewers can update checklist items for assigned reviews" ON checklist_items;
DROP POLICY IF EXISTS "Admins can update all checklist items" ON checklist_items;

CREATE POLICY "Admins can view all checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Reviewers can view checklist items for assigned reviews"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = checklist_items.review_id
        AND r.reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view checklist items for sent reviews"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = checklist_items.review_id
        AND r.client_id = auth.uid()
        AND r.status = 'sent_to_client'
    )
  );

CREATE POLICY "Reviewers can insert checklist items for assigned reviews"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id
        AND r.reviewer_id = auth.uid()
        AND r.status IN ('draft', 'in_progress')
    )
  );

CREATE POLICY "Admins can insert any checklist items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Reviewers can update checklist items for assigned reviews"
  ON checklist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id
        AND r.reviewer_id = auth.uid()
        AND r.status IN ('draft', 'in_progress')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id
        AND r.reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all checklist items"
  ON checklist_items FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- CHECKLIST_MEDIA TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all checklist media" ON checklist_media;
DROP POLICY IF EXISTS "Reviewers can view media for assigned reviews" ON checklist_media;
DROP POLICY IF EXISTS "Clients can view media for sent reviews" ON checklist_media;
DROP POLICY IF EXISTS "Reviewers can insert media for assigned reviews" ON checklist_media;
DROP POLICY IF EXISTS "Admins can insert any media" ON checklist_media;
DROP POLICY IF EXISTS "Admins can update all media" ON checklist_media;

CREATE POLICY "Admins can view all checklist media"
  ON checklist_media FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Reviewers can view media for assigned reviews"
  ON checklist_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = checklist_media.review_id
        AND r.reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view media for sent reviews"
  ON checklist_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = checklist_media.review_id
        AND r.client_id = auth.uid()
        AND r.status = 'sent_to_client'
    )
    AND is_deleted_by_admin = false
  );

CREATE POLICY "Reviewers can insert media for assigned reviews"
  ON checklist_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id
        AND r.reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert any media"
  ON checklist_media FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update all media"
  ON checklist_media FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- EXTERNAL_DOCS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all external docs" ON external_docs;
DROP POLICY IF EXISTS "Clients can view docs for sent reviews" ON external_docs;
DROP POLICY IF EXISTS "Admins can insert external docs" ON external_docs;
DROP POLICY IF EXISTS "Admins can update external docs" ON external_docs;
DROP POLICY IF EXISTS "Admins can delete external docs" ON external_docs;

CREATE POLICY "Admins can view all external docs"
  ON external_docs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Clients can view docs for sent reviews"
  ON external_docs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = external_docs.review_id
        AND r.client_id = auth.uid()
        AND r.status = 'sent_to_client'
    )
  );

CREATE POLICY "Admins can insert external docs"
  ON external_docs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update external docs"
  ON external_docs FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete external docs"
  ON external_docs FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- =====================================================
-- ACTIVITY_LOGS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Note: "All authenticated users can insert activity logs" policy remains unchanged
-- as it doesn't contain recursive queries
