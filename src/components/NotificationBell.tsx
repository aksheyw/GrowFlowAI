import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../contexts/ToastContext';
import { getToastTypeFromNotification } from '../utils/notificationHelpers';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const previousNotificationIds = useRef(new Set<string>());
  const isInitialLoad = useRef(true);

  // Detect new notifications and show toasts
  useEffect(() => {
    if (isInitialLoad.current) {
      previousNotificationIds.current = new Set(notifications.map(n => n.id));
      isInitialLoad.current = false;
      return;
    }

    const currentIds = new Set(notifications.map(n => n.id));
    const newNotifications = notifications.filter(
      n => !previousNotificationIds.current.has(n.id) && !n.read
    );

    if (newNotifications.length > 0) {
      // Trigger pulse ring animation
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 4500); // 3 pulses * 1.5s

      // Show toast for each new notification
      newNotifications.forEach(notification => {
        const notificationAge = Date.now() - new Date(notification.created_at).getTime();

        // Only show toast if notification is less than 10 seconds old
        if (notificationAge < 10000) {
          addToast(
            notification.message,
            getToastTypeFromNotification(notification.type),
            5000
          );
        }
      });
    }

    previousNotificationIds.current = currentIds;
  }, [notifications, addToast]);

  return (
    <div className="relative notification-bell">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2.5 rounded-xl
          transition-colors duration-200
          ${isOpen
            ? 'bg-gray-200'
            : 'hover:bg-gray-100'
          }
        `}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell Icon */}
        <Bell className="w-6 h-6 text-gray-700" />

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="
                absolute -top-1 -right-1
                min-w-[20px] h-5 px-1.5
                rounded-full
                bg-gradient-to-br from-red-500 to-red-600
                text-white text-xs font-bold
                flex items-center justify-center
                shadow-lg shadow-red-500/50
                ring-2 ring-white
              "
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Ring Animation (new notification) */}
        <AnimatePresence>
          {hasNewNotification && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [0.5, 0, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: 2,
                ease: "easeOut"
              }}
              className="
                absolute inset-0 rounded-xl
                border-2 border-red-500
                pointer-events-none
              "
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
