/*
  # Add Closed Status to Reviews

  ## Overview
  This migration adds a new status 'closed' to the review_status enum,
  allowing administrators to manually mark reviews as closed or discarded.

  ## Changes
  1. Add 'closed' value to review_status enum type
  
  ## Status Flow
  - created (draft) → Admin creates review
  - in_progress → Reviewer is completing checklist (0% to 100%)
  - pending_qc → Reviewer submitted for QC review
  - sent_to_client → Admin approved and sent to client
  - closed → Admin manually closed/discarded the review
*/

-- Add 'closed' to the review_status enum
ALTER TYPE review_status ADD VALUE IF NOT EXISTS 'closed';
