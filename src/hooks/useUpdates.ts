import { useState, useCallback, useMemo, useEffect } from 'react';
import { UpdateNotification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
    const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { profile } = useAuth(); // Assuming useAuth is available in the same directory or context

    const fetchNotifications = useCallback(async () => {
        if (!profile?.id) return;

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', profile.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedNotifications: UpdateNotification[] = (data || []).map((n: any) => {
                let type: any = 'system_alert';
                if (n.type === 'assigned') type = 'task_assigned';
                else if (n.type === 'updated') type = 'task_updated';
                else if (n.type === 'completed') type = 'task_updated'; // Map completed to updated for now
                else if (n.type === 'summary_ready') type = 'meeting_summary';
                else if (n.type === 'note_created') type = 'note_created';

                return {
                    id: n.id,
                    user_id: n.recipient_id,
                    type,
                    message: n.message,
                    task_id: n.task_id,
                    note_id: (type === 'meeting_summary' || type === 'note_created') ? n.task_id : undefined,
                    read: n.read,
                    created_at: n.created_at,
                };
            });

            setNotifications(mappedNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [profile?.id]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Real-time subscription
    useEffect(() => {
        if (!profile?.id) return;

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${profile.id}`,
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id, fetchNotifications]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);

    const markRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert on error? For read status, maybe not critical.
        }
    }, []);

    const markAllRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        try {
            if (!profile?.id) return;
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('recipient_id', profile.id)
                .eq('read', false);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [profile?.id]);

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
