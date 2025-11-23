import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck } from 'lucide-react';
import { Notification } from '../lib/supabase';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Don't close if clicking the bell button
      if ((target as Element).closest?.('.notification-bell')) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    // Close dropdown
    onClose();

    // Mark as read
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to dashboard with task highlighted
    if (notification.task_id) {
      navigate('/dashboard', {
        state: { highlightTaskId: notification.task_id }
      });
    }
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="
        notification-dropdown
        absolute right-0 mt-3
        w-[420px] max-w-[calc(100vw-2rem)]
        bg-white rounded-2xl
        shadow-2xl border border-gray-100
        overflow-hidden
        z-50
      "
      role="region"
      aria-label="Notifications dropdown"
      aria-live="polite"
    >
      {/* Header */}
      <div className="
        px-6 py-4 
        border-b border-gray-100
        bg-gradient-to-r from-gray-50 to-white
      ">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Notifications
          </h3>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMarkAllAsRead}
              className="
                text-sm text-[#6FA84C] hover:text-[#2D5016]
                font-medium transition-colors duration-200
                flex items-center gap-1.5
              "
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </motion.button>
          )}
        </div>

        {/* Unread count indicator */}
        {unreadCount > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </p>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="
                w-16 h-16 mx-auto mb-4
                bg-gradient-to-br from-gray-100 to-gray-200
                rounded-2xl
                flex items-center justify-center
              ">
                <BellOff className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">
                All caught up!
              </h4>
              <p className="text-sm text-gray-600">
                You have no new notifications
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
                onMarkRead={onMarkAsRead}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Sticky "View All" Link */}
      {notifications.length > 0 && (
        <button
          onClick={() => {
            onClose();
            navigate('/updates');
          }}
          className="
            block w-full py-3 text-sm text-center font-medium
            text-gray-500 hover:text-green-700 hover:bg-gray-50
            transition-colors border-t border-gray-100 rounded-b-xl
            sticky bottom-0 bg-white
          "
        >
          View all notifications
        </button>
      )}
    </motion.div>
  );
}
