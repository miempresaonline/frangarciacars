/*
  # Fix RLS to use user_metadata instead of app_metadata

  ## Problem
  The previous migration checked auth.jwt() -> 'app_metadata' -> 'role'
  BUT supabase.auth.signUp() with options.data writes to user_metadata, NOT app_metadata.
  
  app_metadata can ONLY be written with the service role key.
  user_metadata is what we get from signUp() with options.data.

  ## Solution
  Change ALL policies to check:
  (auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin'
  
  Instead of:
  (auth.jwt() -> 'app_metadata')::jsonb ->> 'role' = 'admin'
*/

-- =====================================================
-- DROP ALL EXISTING POLICIES
-- =====================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename IN ('profiles', 'reviews', 'checklist_items', 'checklist_media', 'external_docs', 'activity_logs', 'sync_queue')
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END $$;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Reviewers can view assigned reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Clients can view own sent reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    AND status = 'sent_to_client'
  );

CREATE POLICY "Admins can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update all reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Reviewers can update assigned reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

-- =====================================================
-- CHECKLIST_ITEMS TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

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

CREATE POLICY "Reviewers can insert checklist items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id
        AND r.reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert any checklist items"
  ON checklist_items FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Reviewers can update checklist items"
  ON checklist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id
        AND r.reviewer_id = auth.uid()
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
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- CHECKLIST_MEDIA TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all checklist media"
  ON checklist_media FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

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

CREATE POLICY "Reviewers can insert media"
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
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update all media"
  ON checklist_media FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- EXTERNAL_DOCS TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all external docs"
  ON external_docs FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

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
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update external docs"
  ON external_docs FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can delete external docs"
  ON external_docs FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- ACTIVITY_LOGS TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "All authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- SYNC_QUEUE TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view own sync queue"
  ON sync_queue FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sync queue"
  ON sync_queue FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sync queue"
  ON sync_queue FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all sync queue"
  ON sync_queue FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata')::jsonb ->> 'role' = 'admin');
