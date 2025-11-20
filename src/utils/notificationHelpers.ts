import {
    UserPlus,
    Edit3,
    CheckCircle2,
    AlertCircle,
    Bell,
    LucideIcon
} from 'lucide-react';

export type NotificationType = 'assigned' | 'updated' | 'completed' | 'overdue' | 'reminder';
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'celebration';

interface NotificationStyle {
    bg: string;
    iconColor: string;
    icon: LucideIcon;
}

/**
 * Get icon and style configuration for a notification type
 */
export function getNotificationStyle(type: NotificationType): NotificationStyle {
    const styles: Record<NotificationType, NotificationStyle> = {
        assigned: {
            bg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            icon: UserPlus
        },
        updated: {
            bg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            icon: Edit3
        },
        completed: {
            bg: 'bg-green-100',
            iconColor: 'text-green-600',
            icon: CheckCircle2
        },
        overdue: {
            bg: 'bg-red-100',
            iconColor: 'text-red-600',
            icon: AlertCircle
        },
        reminder: {
            bg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            icon: Bell
        }
    };

    return styles[type] || styles.assigned;
}

/**
 * Format timestamp as relative time (Just now, 5m ago, 2h ago, etc.)
 */
export function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return time.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Get toast type from notification type
 */
export function getToastTypeFromNotification(type: NotificationType): ToastType {
    const mapping: Record<NotificationType, ToastType> = {
        assigned: 'info',
        updated: 'info',
        completed: 'celebration',
        overdue: 'warning',
        reminder: 'info'
    };

    return mapping[type] || 'info';
}

/**
 * Get notification title based on type
 */
export function getNotificationTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
        assigned: 'New task assigned',
        updated: 'Task updated',
        completed: 'Task completed! 🎉',
        overdue: 'Task overdue',
        reminder: 'Task reminder'
    };

    return titles[type] || 'Notification';
}
