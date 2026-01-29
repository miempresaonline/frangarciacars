/*
  # Add DELETE policies for checklist_media table

  1. Security
    - Add policy for reviewers to delete their own media
    - Add policy for admins to delete any media
  
  2. Notes
    - Reviewers can delete media they uploaded for their assigned reviews
    - Admins can delete any media from any review
    - This fixes the issue where media deletion wasn't allowed by RLS policies
*/

CREATE POLICY "Reviewers can delete media for assigned reviews"
  ON checklist_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = checklist_media.review_id
        AND r.reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete all media"
  ON checklist_media FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin');
