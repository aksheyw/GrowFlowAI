/*
  # Fix Security and Performance Issues

  1. Changes
    - Add missing indexes for foreign keys (actor_id, task_id in notifications, note_id in tasks)
    - Optimize all RLS policies to use (select auth.uid()) pattern for better performance
    - Remove unused indexes that are not being utilized
    
  2. Performance Improvements
    - Foreign key indexes will improve join performance
    - RLS policy optimization will cache auth.uid() calls instead of re-evaluating for each row
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_note_id ON tasks(note_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_notes_user_id;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_task_details_task_id;
DROP INDEX IF EXISTS idx_notifications_recipient_id;

-- Drop existing RLS policies to recreate them with optimized patterns
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks they created" ON tasks;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notification read status" ON notifications;
DROP POLICY IF EXISTS "Users can view task details for accessible tasks" ON task_details;
DROP POLICY IF EXISTS "Users can insert task details for accessible tasks" ON task_details;
DROP POLICY IF EXISTS "Users can update task details for accessible tasks" ON task_details;
DROP POLICY IF EXISTS "Users can delete task details for accessible tasks" ON task_details;

-- Recreate profiles policies with optimization
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Recreate notes policies with optimization
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

-- Recreate tasks policies with optimization
CREATE POLICY "Users can view tasks they created or are assigned to"
  ON tasks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select auth.uid()) = assignee_id);

CREATE POLICY "Users can insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update tasks they created or are assigned to"
  ON tasks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select auth.uid()) = assignee_id)
  WITH CHECK ((select auth.uid()) = user_id OR (select auth.uid()) = assignee_id);

CREATE POLICY "Users can delete tasks they created"
  ON tasks FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Recreate notifications policies with optimization
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = recipient_id);

CREATE POLICY "Users can update own notification read status"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = recipient_id)
  WITH CHECK ((select auth.uid()) = recipient_id);

-- Recreate task_details policies with optimization
CREATE POLICY "Users can view task details for accessible tasks"
  ON task_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = (select auth.uid()) OR tasks.assignee_id = (select auth.uid()))
    )
  );

CREATE POLICY "Users can insert task details for accessible tasks"
  ON task_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = (select auth.uid()) OR tasks.assignee_id = (select auth.uid()))
    )
  );

CREATE POLICY "Users can update task details for accessible tasks"
  ON task_details FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = (select auth.uid()) OR tasks.assignee_id = (select auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = (select auth.uid()) OR tasks.assignee_id = (select auth.uid()))
    )
  );

CREATE POLICY "Users can delete task details for accessible tasks"
  ON task_details FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_details.task_id
      AND (tasks.user_id = (select auth.uid()) OR tasks.assignee_id = (select auth.uid()))
    )
  );