import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../contexts/ToastContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [bellShake, setBellShake] = useState(false);
  const previousNotificationIds = useRef(new Set<string>());
  const isInitialLoad = useRef(true);

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
      newNotifications.forEach(notification => {
        const notificationAge = Date.now() - new Date(notification.created_at).getTime();
        if (notificationAge < 10000) {
          addToast(notification.message, 'notification', 5000);
        }
      });

      if (unreadCount > 0) {
        setBellShake(true);
        setTimeout(() => setBellShake(false), 500);
      }
    }

    previousNotificationIds.current = currentIds;
  }, [notifications, unreadCount, addToast]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg smooth-transition button-press ${
          bellShake ? 'animate-bell-shake' : ''
        } ${isOpen ? 'bg-gray-100' : ''}`}
        title="Notifications"
      >
        <Bell className={`w-5 h-5 smooth-transition ${isOpen ? 'text-green-700' : ''}`} />

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg animate-badge-pop">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      <NotificationDropdown
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
