import { useQuery } from '@tanstack/react-query';
import { supabase, Task } from '../lib/supabase';

export function useTasks() {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          assignee:assignee_id(id, full_name, email, avatar_url),
          note:note_id(id, meeting_title, meeting_date, meeting_participants, meeting_location)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Task[];
        },
    });
}
