/*
  # Create Notifications Table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `recipient_id` (uuid, references profiles)
      - `actor_id` (uuid, references profiles - who triggered the notification)
      - `type` (text: 'assigned', 'updated', 'completed')
      - `task_id` (uuid, references tasks)
      - `message` (text)
      - `read` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on notifications table
    - Users can only read their own notifications
    - Only system can insert/update notifications
    - Users can update read status on their own notifications

  3. Indexes
    - Index on recipient_id for efficient querying
    - Index on read status for filtering unread
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('assigned', 'updated', 'completed')),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notification read status"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(recipient_id, created_at DESC);