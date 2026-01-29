/*
  # Vehicle Inspection Management System - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for a professional vehicle inspection PWA
  used in Germany. The system supports three user roles (Admin, Reviewer, Client) with strict
  data isolation and offline-first capabilities.

  ## 1. New Tables

  ### `profiles`
  Extension of auth.users with role-based metadata
  - `id` (uuid, FK to auth.users)
  - `role` (enum: admin, reviewer, client)
  - `full_name` (text)
  - `email` (text)
  - `phone` (text, optional)
  - `assigned_admin_id` (uuid, for clients - their internal responsible person)
  - `location` (text, optional - for reviewers)
  - `active` (boolean)
  - `metadata` (jsonb, for flexible additional data)
  - `created_at`, `updated_at`

  ### `reviews`
  Main entity for vehicle inspections
  - `id` (uuid, primary key)
  - `client_id` (uuid, FK to profiles)
  - `reviewer_id` (uuid, FK to profiles)
  - `assigned_admin_id` (uuid, FK to profiles)
  - `status` (enum: draft, in_progress, pending_qc, confirmed, sent_to_client)
  - `vehicle_vin` (text)
  - `vehicle_make` (text)
  - `vehicle_model` (text)
  - `vehicle_year` (integer)
  - `vehicle_km` (integer)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `driving_time_seconds` (integer, time spent on test drive)
  - `total_time_seconds` (integer, total inspection time)
  - `paused_time_seconds` (integer, time paused)
  - `qc_notes` (text, admin notes during quality control)
  - `client_viewed_at` (timestamptz, when client first opened report)
  - `sent_to_client_at` (timestamptz)
  - `metadata` (jsonb)
  - `created_at`, `updated_at`

  ### `checklist_items`
  Individual checklist data points for each review
  - `id` (uuid, primary key)
  - `review_id` (uuid, FK to reviews)
  - `category` (text, e.g., "exterior", "interior", "engine", "obd", "test_drive", "documentation")
  - `item_key` (text, unique identifier like "exterior_body_condition")
  - `item_label` (text, human readable label)
  - `value_type` (enum: select, text, number, boolean, multiple_photos, single_video)
  - `value_select` (integer, for select type)
  - `value_text` (text, for text type)
  - `value_number` (numeric, for number type)
  - `value_boolean` (boolean, for boolean type)
  - `comment` (text, optional reviewer comment)
  - `is_mandatory` (boolean)
  - `requires_photo` (boolean)
  - `requires_video` (boolean)
  - `min_photos` (integer)
  - `order_index` (integer, for sorting)
  - `created_at`, `updated_at`

  ### `checklist_media`
  Photos and videos associated with checklist items
  - `id` (uuid, primary key)
  - `checklist_item_id` (uuid, FK to checklist_items)
  - `review_id` (uuid, FK to reviews)
  - `media_type` (enum: photo, video)
  - `file_path` (text, Supabase Storage path)
  - `file_url` (text, public URL)
  - `thumbnail_url` (text, for videos)
  - `file_size_bytes` (bigint)
  - `duration_seconds` (integer, for videos)
  - `width` (integer)
  - `height` (integer)
  - `captured_at` (timestamptz)
  - `uploaded_at` (timestamptz)
  - `is_deleted_by_admin` (boolean, soft delete for QC)
  - `metadata` (jsonb)
  - `created_at`

  ### `external_docs`
  External documents like Carvertical, TUV reports
  - `id` (uuid, primary key)
  - `review_id` (uuid, FK to reviews)
  - `doc_type` (enum: carvertical, tuv, maintenance, other)
  - `file_name` (text)
  - `file_path` (text, Supabase Storage path)
  - `file_url` (text)
  - `file_size_bytes` (bigint)
  - `uploaded_by` (uuid, FK to profiles)
  - `uploaded_at` (timestamptz)
  - `metadata` (jsonb)
  - `created_at`

  ### `activity_logs`
  Comprehensive audit trail
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `review_id` (uuid, FK to reviews, optional)
  - `action` (text, e.g., "review_created", "review_completed", "qc_approved")
  - `description` (text)
  - `metadata` (jsonb, additional context)
  - `ip_address` (text)
  - `user_agent` (text)
  - `created_at` (timestamptz)

  ### `sync_queue`
  Offline synchronization queue for reviewer app
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `review_id` (uuid, FK to reviews, optional)
  - `operation_type` (enum: create, update, delete, upload_media)
  - `entity_type` (text, e.g., "checklist_item", "media")
  - `entity_id` (uuid)
  - `payload` (jsonb)
  - `status` (enum: pending, synced, failed)
  - `attempts` (integer, default 0)
  - `last_attempt_at` (timestamptz)
  - `error_message` (text)
  - `created_at` (timestamptz)

  ## 2. Security

  - RLS enabled on ALL tables
  - Admins: Full access to all data
  - Reviewers: Access only to their assigned reviews
  - Clients: Read-only access to their own review after it's sent to them
  - All policies check authentication and ownership/membership

  ## 3. Indexes

  - Performance indexes on foreign keys and frequently queried columns
  - Composite indexes for common query patterns

  ## 4. Important Notes

  - All timestamps use timestamptz for timezone support
  - JSONB fields allow flexible metadata without schema changes
  - Soft deletes used for media (is_deleted_by_admin) to maintain audit trail
  - Sync queue enables robust offline-first functionality
  - Activity logs provide complete audit trail for compliance
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'reviewer', 'client');
CREATE TYPE review_status AS ENUM ('draft', 'in_progress', 'pending_qc', 'confirmed', 'sent_to_client');
CREATE TYPE checklist_value_type AS ENUM ('select', 'text', 'number', 'boolean', 'multiple_photos', 'single_video');
CREATE TYPE media_type AS ENUM ('photo', 'video');
CREATE TYPE doc_type AS ENUM ('carvertical', 'tuv', 'maintenance', 'other');
CREATE TYPE sync_operation_type AS ENUM ('create', 'update', 'delete', 'upload_media');
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'failed');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  assigned_admin_id uuid REFERENCES auth.users(id),
  location text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_assigned_admin_idx ON profiles(assigned_admin_id);
CREATE INDEX IF NOT EXISTS profiles_active_idx ON profiles(active);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status review_status NOT NULL DEFAULT 'draft',
  vehicle_vin text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_km integer,
  started_at timestamptz,
  completed_at timestamptz,
  driving_time_seconds integer DEFAULT 0,
  total_time_seconds integer DEFAULT 0,
  paused_time_seconds integer DEFAULT 0,
  qc_notes text,
  client_viewed_at timestamptz,
  sent_to_client_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_client_id_idx ON reviews(client_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_assigned_admin_idx ON reviews(assigned_admin_id);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);

-- =====================================================
-- CHECKLIST_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  category text NOT NULL,
  item_key text NOT NULL,
  item_label text NOT NULL,
  value_type checklist_value_type NOT NULL,
  value_select integer,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  comment text,
  is_mandatory boolean DEFAULT false,
  requires_photo boolean DEFAULT false,
  requires_video boolean DEFAULT false,
  min_photos integer DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checklist_items_review_id_idx ON checklist_items(review_id);
CREATE INDEX IF NOT EXISTS checklist_items_category_idx ON checklist_items(category);
CREATE INDEX IF NOT EXISTS checklist_items_item_key_idx ON checklist_items(item_key);
CREATE UNIQUE INDEX IF NOT EXISTS checklist_items_review_item_key_unique ON checklist_items(review_id, item_key);

-- =====================================================
-- CHECKLIST_MEDIA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS checklist_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_item_id uuid REFERENCES checklist_items(id) ON DELETE CASCADE,
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  media_type media_type NOT NULL,
  file_path text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  file_size_bytes bigint,
  duration_seconds integer,
  width integer,
  height integer,
  captured_at timestamptz DEFAULT now(),
  uploaded_at timestamptz DEFAULT now(),
  is_deleted_by_admin boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checklist_media_item_id_idx ON checklist_media(checklist_item_id);
CREATE INDEX IF NOT EXISTS checklist_media_review_id_idx ON checklist_media(review_id);
CREATE INDEX IF NOT EXISTS checklist_media_type_idx ON checklist_media(media_type);
CREATE INDEX IF NOT EXISTS checklist_media_deleted_idx ON checklist_media(is_deleted_by_admin);

-- =====================================================
-- EXTERNAL_DOCS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS external_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  doc_type doc_type NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_url text NOT NULL,
  file_size_bytes bigint,
  uploaded_by uuid NOT NULL REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS external_docs_review_id_idx ON external_docs(review_id);
CREATE INDEX IF NOT EXISTS external_docs_type_idx ON external_docs(doc_type);
CREATE INDEX IF NOT EXISTS external_docs_uploaded_by_idx ON external_docs(uploaded_by);

-- =====================================================
-- ACTIVITY_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_review_id_idx ON activity_logs(review_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);

-- =====================================================
-- SYNC_QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  operation_type sync_operation_type NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status sync_status NOT NULL DEFAULT 'pending',
  attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sync_queue_user_id_idx ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS sync_queue_review_id_idx ON sync_queue(review_id);
CREATE INDEX IF NOT EXISTS sync_queue_status_idx ON sync_queue(status);
CREATE INDEX IF NOT EXISTS sync_queue_created_at_idx ON sync_queue(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- REVIEWS POLICIES
-- =====================================================

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

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
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

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
-- CHECKLIST_ITEMS POLICIES
-- =====================================================

CREATE POLICY "Admins can view all checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

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
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

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
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =====================================================
-- CHECKLIST_MEDIA POLICIES
-- =====================================================

CREATE POLICY "Admins can view all checklist media"
  ON checklist_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

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
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all media"
  ON checklist_media FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =====================================================
-- EXTERNAL_DOCS POLICIES
-- =====================================================

CREATE POLICY "Admins can view all external docs"
  ON external_docs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

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
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update external docs"
  ON external_docs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete external docs"
  ON external_docs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =====================================================
-- ACTIVITY_LOGS POLICIES
-- =====================================================

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- SYNC_QUEUE POLICIES
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
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log review status changes
CREATE OR REPLACE FUNCTION log_review_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activity_logs (user_id, review_id, action, description, metadata)
    VALUES (
      auth.uid(),
      NEW.id,
      'review_status_changed',
      'Review status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_review_status_change_trigger
  AFTER UPDATE ON reviews
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_review_status_change();

-- Function to track client view
CREATE OR REPLACE FUNCTION track_client_view()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_viewed_at IS NOT NULL AND OLD.client_viewed_at IS NULL THEN
    INSERT INTO activity_logs (user_id, review_id, action, description)
    VALUES (
      auth.uid(),
      NEW.id,
      'client_viewed_report',
      'Client viewed the inspection report for the first time'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_client_view_trigger
  AFTER UPDATE ON reviews
  FOR EACH ROW
  WHEN (NEW.client_viewed_at IS NOT NULL AND OLD.client_viewed_at IS NULL)
  EXECUTE FUNCTION track_client_view();