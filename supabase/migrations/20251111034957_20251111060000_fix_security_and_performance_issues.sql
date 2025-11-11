/*
  # Fix Security and Performance Issues

  ## Summary
  This migration addresses all security and performance issues identified in the database audit.

  ## Changes Made
  
  ### 1. Add Missing Foreign Key Indexes
  - Add index for notifications.actor_id
  
  ### 2. Optimize RLS Policies
  - Replace auth.<function>() with (select auth.<function>()) for better performance
  - Update all RLS policies to use the optimized pattern
  
  ### 3. Clean Up Indexes
  - Remove duplicate indexes
  - Remove unused indexes that aren't providing value
  
  ### 4. Fix Function Security
  - Add explicit search_path to all functions to prevent search_path injection attacks
  
  ## Security
  - All changes maintain or improve security posture
  - RLS policies remain restrictive
  - Function search paths now immutable
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Add index for notifications.actor_id foreign key
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id 
  ON notifications(actor_id);

-- ============================================================================
-- 2. CLEAN UP DUPLICATE AND UNUSED INDEXES
-- ============================================================================

-- Drop duplicate index (keeping the more comprehensive one)
DROP INDEX IF EXISTS idx_task_details_order;

-- Drop unused indexes
DROP INDEX IF EXISTS idx_notifications_recipient_read;
DROP INDEX IF EXISTS idx_task_details_task_id_order;
DROP INDEX IF EXISTS idx_tasks_deadline;
DROP INDEX IF EXISTS idx_tasks_note_id;
DROP INDEX IF EXISTS idx_notes_user_id;
DROP INDEX IF EXISTS idx_notifications_task_id;
DROP INDEX IF EXISTS idx_notifications_read_status;

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES
-- ============================================================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- NOTES TABLE
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- TASKS TABLE
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON tasks;
CREATE POLICY "Users can view tasks they created or are assigned to"
  ON tasks FOR SELECT
  TO authenticated
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT auth.uid()) = assignee_id));

DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
CREATE POLICY "Users can insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
CREATE POLICY "Users can update tasks they created or are assigned to"
  ON tasks FOR UPDATE
  TO authenticated
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT auth.uid()) = assignee_id))
  WITH CHECK (((SELECT auth.uid()) = user_id) OR ((SELECT auth.uid()) = assignee_id));

DROP POLICY IF EXISTS "Users can delete tasks they created" ON tasks;
CREATE POLICY "Users can delete tasks they created"
  ON tasks FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- NOTIFICATIONS TABLE
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = recipient_id);

DROP POLICY IF EXISTS "Users can update own notification read status" ON notifications;
CREATE POLICY "Users can update own notification read status"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = recipient_id)
  WITH CHECK ((SELECT auth.uid()) = recipient_id);

DROP POLICY IF EXISTS "Users can insert notifications for their tasks" ON notifications;
CREATE POLICY "Users can insert notifications for their tasks"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = (SELECT auth.uid()) AND
    (
      task_id IS NULL OR
      EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = task_id
        AND (tasks.user_id = (SELECT auth.uid()) OR tasks.assignee_id = (SELECT auth.uid()))
      )
    )
  );

-- TASK_DETAILS TABLE
DROP POLICY IF EXISTS "Users can view task details for accessible tasks" ON task_details;
CREATE POLICY "Users can view task details for accessible tasks"
  ON task_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks
      WHERE tasks.id = task_details.task_id
      AND ((tasks.user_id = (SELECT auth.uid())) OR (tasks.assignee_id = (SELECT auth.uid())))
    )
  );

DROP POLICY IF EXISTS "Users can insert task details for accessible tasks" ON task_details;
CREATE POLICY "Users can insert task details for accessible tasks"
  ON task_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM tasks
      WHERE tasks.id = task_details.task_id
      AND ((tasks.user_id = (SELECT auth.uid())) OR (tasks.assignee_id = (SELECT auth.uid())))
    )
  );

DROP POLICY IF EXISTS "Users can update task details for accessible tasks" ON task_details;
CREATE POLICY "Users can update task details for accessible tasks"
  ON task_details FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks
      WHERE tasks.id = task_details.task_id
      AND ((tasks.user_id = (SELECT auth.uid())) OR (tasks.assignee_id = (SELECT auth.uid())))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM tasks
      WHERE tasks.id = task_details.task_id
      AND ((tasks.user_id = (SELECT auth.uid())) OR (tasks.assignee_id = (SELECT auth.uid())))
    )
  );

DROP POLICY IF EXISTS "Users can delete task details for accessible tasks" ON task_details;
CREATE POLICY "Users can delete task details for accessible tasks"
  ON task_details FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks
      WHERE tasks.id = task_details.task_id
      AND ((tasks.user_id = (SELECT auth.uid())) OR (tasks.assignee_id = (SELECT auth.uid())))
    )
  );

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Update handle_new_user function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_name text;
BEGIN
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
    updated_at = now();
  
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Update validate_task_data function with explicit search_path
CREATE OR REPLACE FUNCTION public.validate_task_data()
RETURNS trigger 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'Invalid user_id: user profile does not exist';
  END IF;
  
  IF NEW.assignee_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.assignee_id) THEN
      RAISE EXCEPTION 'Invalid assignee_id: user profile does not exist';
    END IF;
  END IF;
  
  IF NEW.note_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.notes WHERE id = NEW.note_id) THEN
      RAISE EXCEPTION 'Invalid note_id: note does not exist';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update check_database_health function with explicit search_path
CREATE OR REPLACE FUNCTION public.check_database_health()
RETURNS TABLE (
  check_name text,
  status text,
  details text
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Orphaned Tasks'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::text,
    COUNT(*)::text || ' tasks with invalid user_id'::text
  FROM tasks t
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = t.user_id);
  
  RETURN QUERY
  SELECT 
    'Orphaned Notifications'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::text,
    COUNT(*)::text || ' notifications with invalid recipient_id'::text
  FROM notifications n
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = n.recipient_id);
  
  RETURN QUERY
  SELECT 
    'Users Without Profiles'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::text,
    COUNT(*)::text || ' auth users without profiles'::text
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);
  
  RETURN QUERY
  SELECT 
    'RLS Enabled'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::text,
    COUNT(*)::text || ' public tables without RLS'::text
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'notes', 'tasks', 'notifications', 'task_details')
    AND NOT rowsecurity;
END;
$$;

-- Update update_updated_at_column function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;