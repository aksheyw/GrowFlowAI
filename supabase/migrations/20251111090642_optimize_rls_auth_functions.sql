/*
  # Optimize RLS Policies with Auth Function Calls
  
  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale
  
  2. Tables Updated
    - `profiles`: 2 policies optimized
    - `notes`: 4 policies optimized  
    - `tasks`: 4 policies optimized
    - `notifications`: 2 policies optimized
  
  3. Security
    - No security changes, only performance optimization
    - All existing security rules remain enforced
*/

-- Drop and recreate profiles policies with optimized auth calls
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Drop and recreate notes policies with optimized auth calls
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate tasks policies with optimized auth calls
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks they created" ON tasks;

CREATE POLICY "Users can view tasks they created or are assigned to"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR 
    (select auth.uid()) = assignee_id
  );

CREATE POLICY "Users can insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update tasks they created or are assigned to"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR 
    (select auth.uid()) = assignee_id
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR 
    (select auth.uid()) = assignee_id
  );

CREATE POLICY "Users can delete tasks they created"
  ON tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate notifications policies with optimized auth calls
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notification read status" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = recipient_id);

CREATE POLICY "Users can update own notification read status"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = recipient_id)
  WITH CHECK ((select auth.uid()) = recipient_id);
