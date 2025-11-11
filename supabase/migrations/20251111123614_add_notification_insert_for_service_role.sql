/*
  # Allow service role to insert notifications

  1. Changes
    - Add policy to allow service role (edge functions) to insert notifications
    - This enables the process-ai-notes edge function to create notifications when assigning tasks

  2. Security
    - Service role can insert notifications (needed for automated task assignments)
    - Users can still only read and update their own notifications
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Service role can insert notifications'
  ) THEN
    CREATE POLICY "Service role can insert notifications"
      ON notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
