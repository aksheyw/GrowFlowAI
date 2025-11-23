export type UpdateNotificationType = 'task_assigned' | 'task_updated' | 'deadline_soon' | 'meeting_summary' | 'system_alert';

export interface UpdateNotification {
    id: string;
    user_id: string;
    type: UpdateNotificationType;
    message: string;
    task_id?: string;
    read: boolean;
    created_at: string;
}
