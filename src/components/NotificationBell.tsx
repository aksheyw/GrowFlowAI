import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../contexts/ToastContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);
  const [bellShake, setBellShake] = useState(false);

  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      const newNotifications = notifications.filter(n => !n.read).slice(0, unreadCount - prevUnreadCount);
      if (newNotifications.length > 0) {
        newNotifications.forEach(notification => {
          addToast(notification.message, 'notification', 5000);
        });
        setBellShake(true);
        setTimeout(() => setBellShake(false), 500);
      }
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, notifications, addToast, prevUnreadCount]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all ${
          bellShake ? 'animate-bell-shake' : ''
        }`}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />

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
