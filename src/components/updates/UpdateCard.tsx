import { motion } from 'framer-motion';
import { User, Clock, FileText, Sparkles, Activity } from 'lucide-react';
import { Notification, NotificationType } from '../../types';

interface UpdateCardProps {
    notification: Notification;
    onClick: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'task_assigned':
            return { Icon: User, bgColor: 'bg-green-500/10', iconColor: 'text-green-600' };
        case 'deadline_soon':
            return { Icon: Clock, bgColor: 'bg-red-500/10', iconColor: 'text-red-600' };
        case 'meeting_summary':
            return { Icon: FileText, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-600' };
        case 'system_alert':
            return { Icon: Sparkles, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-600' };
        case 'task_updated':
            return { Icon: Activity, bgColor: 'bg-orange-500/10', iconColor: 'text-orange-600' };
    }
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export default function UpdateCard({ notification, onClick }: UpdateCardProps) {
    const { Icon, bgColor, iconColor } = getNotificationIcon(notification.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => onClick(notification.id)}
            className={`
        p-4 border-b border-gray-100 cursor-pointer
        hover:bg-gray-50 transition-colors
        flex items-start gap-3
        ${!notification.read ? 'bg-green-50/30' : 'bg-white'}
      `}
        >
            {/* Icon Container */}
            <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.created_at)}
                </p>
            </div>

            {/* Unread Indicator */}
            {!notification.read && (
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
            )}
        </motion.div>
    );
}
