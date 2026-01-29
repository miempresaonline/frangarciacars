/*
  # Fix Review Progress Tracking Trigger

  ## Overview
  Fixes the trigger for updating review progress to handle INSERT, UPDATE, and DELETE operations correctly.

  ## Changes
  1. Drop existing trigger and function
  2. Create new functions for INSERT/UPDATE and DELETE separately
  3. Create appropriate triggers for each operation

  ## Important Notes
  - Progress is calculated based on completed vs total items
  - Handles INSERT, UPDATE, and DELETE operations correctly
  - Uses OLD for DELETE and NEW for INSERT/UPDATE
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_update_review_progress ON checklist_items;
DROP FUNCTION IF EXISTS update_review_progress();

-- Function to update review progress (for INSERT and UPDATE)
CREATE OR REPLACE FUNCTION update_review_progress_insert_update()
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

-- Function to update review progress (for DELETE)
CREATE OR REPLACE FUNCTION update_review_progress_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews
  SET
    completed_items = (
      SELECT COUNT(*)
      FROM checklist_items
      WHERE checklist_items.review_id = OLD.review_id
    ),
    total_items = (
      SELECT COUNT(*)
      FROM checklist_templates
    ),
    progress_percentage = (
      (SELECT COUNT(*)::numeric FROM checklist_items WHERE checklist_items.review_id = OLD.review_id) /
      NULLIF((SELECT COUNT(*)::numeric FROM checklist_templates), 0)
    ) * 100,
    updated_at = now()
  WHERE id = OLD.review_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for INSERT and UPDATE
CREATE TRIGGER trigger_update_review_progress_insert_update
  AFTER INSERT OR UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_review_progress_insert_update();

-- Trigger for DELETE
CREATE TRIGGER trigger_update_review_progress_delete
  AFTER DELETE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_review_progress_delete();