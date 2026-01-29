/*
  # Add simplified value and notes columns to checklist_items

  ## Changes

  This migration simplifies the checklist_items table structure:

  1. New Columns
    - `value` (text) - Unified column to store all types of values as text
    - `notes` (text) - Renamed from `comment` for clarity

  2. Changes Made
    - Add `value` column to store responses in a simplified format
    - Rename `comment` to `notes` for better semantic meaning
    - Keep old value_* columns for backward compatibility

  ## Notes

  - The new `value` column simplifies data storage by converting all value types to text
  - This makes the frontend code simpler and more maintainable
  - Old value_* columns remain for backward compatibility but new code uses `value`
*/

-- Add the new value column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checklist_items' AND column_name = 'value'
  ) THEN
    ALTER TABLE checklist_items ADD COLUMN value text;
  END IF;
END $$;

-- Rename comment to notes if notes doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checklist_items' AND column_name = 'notes'
  ) THEN
    ALTER TABLE checklist_items RENAME COLUMN comment TO notes;
  END IF;
END $$;
