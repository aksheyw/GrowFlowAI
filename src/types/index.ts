export type NotificationType = 'task_assigned' | 'task_updated' | 'deadline_soon' | 'meeting_summary' | 'system_alert';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    message: string;
    task_id?: string;
    read: boolean;
    created_at: string;
}
