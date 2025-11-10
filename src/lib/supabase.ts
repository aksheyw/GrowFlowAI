import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  content: string;
  processed: boolean;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  note_id: string | null;
  user_id: string;
  assignee_id: string | null;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  deadline: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
};

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: 'assigned' | 'updated' | 'completed';
  task_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  actor?: Profile;
};

export type TaskDetail = {
  id: string;
  task_id: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};
