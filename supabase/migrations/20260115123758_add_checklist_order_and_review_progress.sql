/*
  # Add Checklist Category Order and Review Progress Tracking

  ## Overview
  This migration adds functionality for:
  1. Customizable order for checklist categories (drag & drop support)
  2. Progress tracking for reviews to enable statistics and dashboards

  ## New Tables
    - `checklist_category_order`
      - `id` (uuid, primary key) - Unique identifier
      - `category_key` (text) - Category identifier (exterior, interior, etc.)
      - `order_position` (integer) - Display order (1, 2, 3...)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## Modified Tables
    - `reviews`
      - Added `progress_percentage` (numeric) - Percentage of completion (0-100)
      - Added `completed_items` (integer) - Number of completed checklist items
      - Added `total_items` (integer) - Total number of checklist items

  ## Security
    - Enable RLS on `checklist_category_order` table
    - Add policies for admins to manage category order
    - Policies for reviewers/clients to read category order
    - Review progress fields are readable by all authenticated users with access to the review

  ## Important Notes
    1. Category order defaults to the hardcoded values if no custom order exists
    2. Progress is calculated based on completed checklist items
    3. Progress updates automatically when checklist items are saved
*/

-- Create checklist_category_order table
CREATE TABLE IF NOT EXISTS checklist_category_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text UNIQUE NOT NULL,
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add progress tracking fields to reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'progress_percentage'
  ) THEN
    ALTER TABLE reviews ADD COLUMN progress_percentage numeric(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'completed_items'
  ) THEN
    ALTER TABLE reviews ADD COLUMN completed_items integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'total_items'
  ) THEN
    ALTER TABLE reviews ADD COLUMN total_items integer DEFAULT 0;
  END IF;
END $$;

-- Insert default category order
INSERT INTO checklist_category_order (category_key, order_position)
VALUES
  ('exterior', 1),
  ('interior', 2),
  ('engine', 3),
  ('obd', 4),
  ('test_drive', 5),
  ('documentation', 6)
ON CONFLICT (category_key) DO NOTHING;

-- Enable RLS on checklist_category_order
ALTER TABLE checklist_category_order ENABLE ROW LEVEL SECURITY;

-- Policies for checklist_category_order

-- Admins can read category order
CREATE POLICY "Admins can read category order"
  ON checklist_category_order FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert category order
CREATE POLICY "Admins can insert category order"
  ON checklist_category_order FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update category order
CREATE POLICY "Admins can update category order"
  ON checklist_category_order FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Reviewers can read category order
CREATE POLICY "Reviewers can read category order"
  ON checklist_category_order FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'reviewer'
    )
  );

-- Function to update review progress
CREATE OR REPLACE FUNCTION update_review_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews
  SET
    completed_items = (
      SELECT COUNT(*)
      FROM checklist_items
      WHERE checklist_items.review_id = NEW.review_id
    ),
    total_items = (
      SELECT COUNT(*)
      FROM checklist_templates
    ),
    progress_percentage = (
      (SELECT COUNT(*)::numeric FROM checklist_items WHERE checklist_items.review_id = NEW.review_id) /
      NULLIF((SELECT COUNT(*)::numeric FROM checklist_templates), 0)
    ) * 100,
    updated_at = now()
  WHERE id = NEW.review_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update review progress when checklist items change
DROP TRIGGER IF EXISTS trigger_update_review_progress ON checklist_items;
CREATE TRIGGER trigger_update_review_progress
  AFTER INSERT OR UPDATE OR DELETE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_review_progress();