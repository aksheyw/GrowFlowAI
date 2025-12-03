
const N8N_WEBHOOK_URL = 'https://n8n.srv1134430.hstgr.cloud/webhook/manual-calendar-sync';

export async function syncTaskToCalendar(taskId: string, userId: string): Promise<boolean> {
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
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
