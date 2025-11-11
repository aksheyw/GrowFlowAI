/*
  # Fix Task Delete Policy

  1. Changes
    - Update delete policy to allow both task creators AND assignees to delete tasks
    - This makes it consistent with the update policy
  
  2. Security
    - Users can only delete tasks they created OR are assigned to
    - Maintains proper access control while fixing the delete functionality
*/

DROP POLICY IF EXISTS "Users can delete tasks they created" ON tasks;

CREATE POLICY "Users can delete tasks they created or are assigned to"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR auth.uid() = assignee_id
  );
