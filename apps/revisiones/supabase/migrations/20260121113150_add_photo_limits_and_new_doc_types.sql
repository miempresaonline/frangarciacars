/*
  # Add Photo Limits and New Document Types

  1. Changes
    - Add new document types: 'documentacion' and 'coc' to doc_type enum
    - Document types are now: carvertical, tuv, service_history, documentacion, coc
  
  2. Notes
    - Photo limits will be enforced in application logic based on checklist definitions
    - Existing records remain unchanged
*/

-- Add new document types to the enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'doc_type' AND e.enumlabel = 'documentacion'
  ) THEN
    ALTER TYPE doc_type ADD VALUE 'documentacion';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'doc_type' AND e.enumlabel = 'coc'
  ) THEN
    ALTER TYPE doc_type ADD VALUE 'coc';
  END IF;
END $$;