/*
  # Eliminate Infinite Recursion - Complete RLS Redesign

  ## Problem
  The original RLS policies contained direct recursive queries to the profiles table
  that Supabase evaluates WITH RLS applied, creating infinite loops:
  - Policy needs to check if user is admin
  - Checks: SELECT FROM profiles WHERE role = 'admin'
  - That SELECT is subject to RLS policies
  - RLS policies need to check if user is admin
  - Back to step 1 = infinite recursion

  ## Solution
  Use auth.jwt() with custom claims instead of querying profiles.
  When users are created, store their role in app_metadata.
  Policies read role from JWT instead of querying profiles.

  ## CRITICAL CHANGES
  1. Drop all existing recursive policies
  2. Create new non-recursive policies using auth.jwt() -> 'app_metadata' -> 'role'
  3. For profiles table: Allow users to read own profile directly, no admin lookups
  4. For other tables: Use JWT role or ownership checks, never recursive queries
*/

-- =====================================================
-- DROP ALL EXISTING PROBLEMATIC POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Reviewers can view assigned reviews" ON reviews;
DROP POLICY IF EXISTS "Clients can view own sent reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update all reviews" ON reviews;
DROP POLICY IF EXISTS "Reviewers can update assigned reviews" ON reviews;

DROP POLICY IF EXISTS "Admins can view all checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Reviewers can view checklist items for assigned reviews" ON checklist_items;
DROP POLICY IF EXISTS "Clients can view checklist items for sent reviews" ON checklist_items;
DROP POLICY IF EXISTS "Reviewers can insert checklist items for assigned reviews" ON checklist_items;
DROP POLICY IF EXISTS "Admins can insert any checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Reviewers can update checklist items for assigned reviews" ON checklist_items;
DROP POLICY IF EXISTS "Admins can update all checklist items" ON checklist_items;

DROP POLICY IF EXISTS "Admins can view all checklist media" ON checklist_media;
DROP POLICY IF EXISTS "Reviewers can view media for assigned reviews" ON checklist_media;
DROP POLICY IF EXISTS "Clients can view media for sent reviews" ON checklist_media;
DROP POLICY IF EXISTS "Reviewers can insert media for assigned reviews" ON checklist_media;
DROP POLICY IF EXISTS "Admins can insert any media" ON checklist_media;
DROP POLICY IF EXISTS "Admins can update all media" ON checklist_media;

DROP POLICY IF EXISTS "Admins can view all external docs" ON external_docs;
DROP POLICY IF EXISTS "Clients can view docs for sent reviews" ON external_docs;
DROP POLICY IF EXISTS "Admins can insert external docs" ON external_docs;
DROP POLICY IF EXISTS "Admins can update external docs" ON external_docs;
DROP POLICY IF EXISTS "Admins can delete external docs" ON external_docs;

DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;

DROP POLICY IF EXISTS "Users can view own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can insert own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can update own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Admins can view all sync queue" ON sync_queue;

DROP FUNCTION IF EXISTS is_admin(uuid);

-- =====================================================
-- HELPER: Safely drop all RLS policies for a table
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
-- PROFILES TABLE POLICIES (NO ADMIN CHECKS - SIMPLE)
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
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

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
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update all reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

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
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

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
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

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
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- CHECKLIST_MEDIA TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all checklist media"
  ON checklist_media FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

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
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update all media"
  ON checklist_media FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- EXTERNAL_DOCS TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all external docs"
  ON external_docs FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

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
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can update external docs"
  ON external_docs FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin')
  WITH CHECK ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

CREATE POLICY "Admins can delete external docs"
  ON external_docs FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

-- =====================================================
-- ACTIVITY_LOGS TABLE POLICIES
-- =====================================================

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');

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
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');
