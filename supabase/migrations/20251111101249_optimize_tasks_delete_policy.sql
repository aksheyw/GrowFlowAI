/*
  # Optimize Tasks Delete Policy with Subquery

  1. Performance Improvements
    - Update tasks delete policy to use subquery pattern for auth.uid()
    - Prevents re-evaluation of auth.uid() for each row
    - Significantly improves query performance at scale
    
  2. Changes
    - Replace direct auth.uid() calls with (SELECT auth.uid())
    
  3. Security
    - Maintains same security guarantees
    - Users can still only delete tasks they created or are assigned to
*/

DROP POLICY IF EXISTS "Users can delete tasks they created or are assigned to" ON tasks;

CREATE POLICY "Users can delete tasks they created or are assigned to"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    ((SELECT auth.uid()) = user_id) OR ((SELECT auth.uid()) = assignee_id)
  );
