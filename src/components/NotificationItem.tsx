import { motion } from 'framer-motion';
import { Clock, Check } from 'lucide-react';
import { Notification } from '../lib/supabase';
import { getNotificationStyle, formatTimeAgo } from '../utils/notificationHelpers';

interface NotificationItemProps {
    notification: Notification;
    index: number;
    onMarkRead: (id: string) => void;
    onClick: (notification: Notification) => void;
}

export default function NotificationItem({
    notification,
    index,
    onMarkRead,
    onClick
}: NotificationItemProps) {
    const style = getNotificationStyle(notification.type);
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onClick(notification)}
            className={`
        px-6 py-4
        transition-colors duration-200
        cursor-pointer
        ${!notification.read
                    ? 'bg-blue-50/30 hover:bg-blue-50/50'
                    : 'hover:bg-gray-50'
                }
      `}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
          w-10 h-10 rounded-xl flex-shrink-0
          flex items-center justify-center
          ${style.bg}
        `}>
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Message */}
                    <p className={`
            text-sm leading-relaxed mb-1
            ${!notification.read
                            ? 'font-medium text-gray-900'
                            : 'text-gray-700'
                        }
          `}>
                        {notification.message}
                    </p>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 mt-2">
                        {/* Timestamp */}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.created_at)}
                        </span>

                        {/* Mark as read button (unread only) */}
                        {!notification.read && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkRead(notification.id);
                                }}
                                className="
                  text-xs text-[#6FA84C] hover:text-[#2D5016]
                  font-medium transition-colors duration-200
                  flex items-center gap-1
                "
                            >
                                <Check className="w-3 h-3" />
                                <span>Mark read</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Unread indicator dot */}
                {!notification.read && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="
              w-2 h-2 rounded-full bg-blue-500
              flex-shrink-0 mt-2
            "
                    />
                )}
            </div>
        </motion.div>
    );
}
