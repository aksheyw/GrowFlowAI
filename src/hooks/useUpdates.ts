import { useState, useCallback, useMemo } from 'react';
import { UpdateNotification } from '../types';

// Mock data for development
const MOCK_NOTIFICATIONS: UpdateNotification[] = [
    {
        id: '1',
        user_id: 'user-1',
        type: 'task_assigned',
        message: 'You were assigned to "Complete Q4 Report"',
        task_id: 'task-1',
        read: false,
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        user_id: 'user-1',
        type: 'deadline_soon',
        message: 'Task "Review Marketing Materials" is due in 2 hours',
        task_id: 'task-2',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
        id: '3',
        user_id: 'user-1',
        type: 'meeting_summary',
        message: 'New summary available for "Team Standup - Nov 23"',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
        id: '4',
        user_id: 'user-1',
        type: 'task_updated',
        message: 'Alex updated "Dashboard Redesign" status to In Progress',
        task_id: 'task-3',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
        id: '5',
        user_id: 'user-1',
        type: 'system_alert',
        message: 'Welcome to GrowFlow! 🌱 Start by adding your first task.',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    },
    {
        id: '6',
        user_id: 'user-1',
        type: 'task_assigned',
        message: 'Jordan assigned you to "Update API Documentation"',
        task_id: 'task-4',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    },
    {
        id: '7',
        user_id: 'user-1',
        type: 'deadline_soon',
        message: 'Task "Prepare Presentation" is due tomorrow',
        task_id: 'task-5',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // Yesterday
    },
    {
        id: '8',
        user_id: 'user-1',
        type: 'meeting_summary',
        message: 'Summary ready for "Product Planning Session"',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    {
        id: '9',
        user_id: 'user-1',
        type: 'task_updated',
        message: 'Sarah completed "User Research Analysis"',
        task_id: 'task-6',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    },
    {
        id: '10',
        user_id: 'user-1',
        type: 'system_alert',
        message: 'New feature: AI-powered meeting summaries are now available!',
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // Last week
    },
];

export interface GroupedNotifications {
    [key: string]: UpdateNotification[];
}

export function groupNotificationsByDate(notifications: UpdateNotification[]): GroupedNotifications {
    const groups: GroupedNotifications = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    notifications.forEach((notification) => {
        const notificationDate = new Date(notification.created_at);
        const notificationDay = new Date(
            notificationDate.getFullYear(),
            notificationDate.getMonth(),
            notificationDate.getDate()
        );

        let groupKey: string;

        if (notificationDay.getTime() === today.getTime()) {
            groupKey = 'Today';
        } else if (notificationDay.getTime() === yesterday.getTime()) {
            groupKey = 'Yesterday';
        } else if (notificationDay >= lastWeek) {
            groupKey = 'This Week';
        } else {
            groupKey = 'Earlier';
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(notification);
    });

    return groups;
}

export function useUpdates() {
    const [notifications, setNotifications] = useState<UpdateNotification[]>(MOCK_NOTIFICATIONS);
    const [isLoading] = useState(false);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);

    const markRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const groupedNotifications = useMemo(() => {
        return groupNotificationsByDate(notifications);
    }, [notifications]);

    return {
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        isLoading,
        groupedNotifications,
    };
}
