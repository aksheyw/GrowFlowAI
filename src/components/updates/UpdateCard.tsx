import { motion } from 'framer-motion';
import { User, Clock, FileText, Sparkles, Activity, Bell } from 'lucide-react';
import { UpdateNotification, UpdateNotificationType } from '../../types';

interface UpdateCardProps {
    notification: UpdateNotification;
    onClick: (notification: UpdateNotification) => void;
}

const getNotificationIcon = (type: UpdateNotificationType) => {
    switch (type) {
        case 'task_assigned':
            return { Icon: User, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' };
        case 'deadline_soon':
            return { Icon: Clock, bgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400' };
        case 'meeting_summary':
            return { Icon: FileText, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' };
        case 'system_alert':
            return { Icon: Bell, bgColor: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' };
        case 'task_updated':
            return { Icon: Activity, bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' };
        case 'note_created':
            return { Icon: FileText, bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' };
        default:
            return { Icon: Sparkles, bgColor: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-600 dark:text-gray-400' };
    }
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function UpdateCard({ notification, onClick }: UpdateCardProps) {
    const { Icon, bgColor, iconColor } = getNotificationIcon(notification.type);

    return (
        <div
            onClick={() => onClick(notification)}
            className={`
                group relative
                p-4 rounded-2xl
                bg-white dark:bg-[#1C1C1E]
                border border-transparent dark:border-[#38383A]
                shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none
                hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:hover:bg-[#2C2C2E]
                transition-all duration-200 cursor-pointer
                flex items-start gap-4
                ${!notification.read ? 'pr-8' : ''}
            `}
        >
            {/* Icon Container */}
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-[15px] leading-snug ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notification.message}
                </p>
                <p className="text-[13px] text-gray-500 dark:text-gray-500 mt-1.5 font-medium">
                    {formatTime(notification.created_at)}
                </p>
            </div>

            {/* Unread Indicator */}
            {!notification.read && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-2.5 h-2.5 bg-[#007AFF] rounded-full shadow-sm ring-4 ring-white dark:ring-[#1C1C1E] group-hover:ring-gray-50 dark:group-hover:ring-[#2C2C2E] transition-all" />
                </div>
            )}
        </div>
    );
}
