import { useRef, useEffect, useState } from 'react';
import { Notification } from '../lib/supabase';
import { X, ChevronRight } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NOTIFICATION_ICONS = {
  assigned: '📋',
  updated: '✏️',
  completed: '✅',
};

export default function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 10) return 'just now';
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return created.toLocaleDateString();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
      style={{
        animation: 'slideDown 0.2s ease-out',
      }}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {notifications.length === 0 ? 'No notifications' : `${notifications.length} recent`}
          </p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-green-700 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-all"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">You'll see updates here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-all cursor-pointer group relative ${
                  !notification.read ? 'bg-green-50/50' : ''
                }`}
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="flex gap-3">
                  <div className="text-2xl flex-shrink-0 leading-none">
                    {NOTIFICATION_ICONS[notification.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm break-words ${
                      !notification.read ? 'text-gray-900 font-medium' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <span>{getTimeAgo(notification.created_at)}</span>
                      {!notification.read && (
                        <span className="w-1 h-1 rounded-full bg-green-600"></span>
                      )}
                    </p>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-600 hover:bg-green-700 hover:scale-125 transition-all shadow-sm"
                      title="Mark as read"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
          <button className="text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 flex items-center justify-center gap-1 w-full transition-all py-2 rounded-lg">
            View all notifications
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
