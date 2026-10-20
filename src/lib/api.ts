
import { n8nFetch } from './n8n';

export async function syncTaskToCalendar(taskId: string, userId: string): Promise<boolean> {
    try {
        const response = await n8nFetch('manual-calendar-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task_id: taskId,
                user_id: userId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to sync with calendar');
        }

        return true;
    } catch (error) {
        console.error('Error syncing task to calendar:', error);
        throw error;
    }
}
