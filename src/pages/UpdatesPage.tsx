import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUpdates } from '../hooks/useUpdates';
import { useToast } from '../contexts/ToastContext';
import UpdateCard from '../components/updates/UpdateCard';
import { UpdateNotification } from '../types';
import { Check, Bell } from 'lucide-react';

type FilterType = 'All' | 'Alerts' | 'Tasks' | 'Mentions';

const FILTERS: FilterType[] = ['All', 'Alerts', 'Tasks', 'Mentions'];

export default function UpdatesPage() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { groupedNotifications, unreadCount, markRead, markAllRead, isLoading } = useUpdates();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');

    const handleNotificationClick = (notification: UpdateNotification) => {
        markRead(notification.id);

        if (notification.task_id) {
            navigate(`/task/${notification.task_id}`);
            return;
        }

        const noteId = notification.note_id;
        if (noteId) {
            navigate(`/note/${noteId}`);
            return;
        }

        if (notification.type === 'system_alert') {
            addToast(notification.message, 'info', 4000);
        }
    };

    const hasNotifications = Object.keys(groupedNotifications).length > 0;
    const sectionOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pb-32 md:pb-8 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-[#38383A] shadow-sm">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Updates
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h1>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-sm font-medium text-[#007AFF] hover:text-[#007AFF]/80 transition-colors flex items-center gap-1"
                            >
                                <Check className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                  ${activeFilter === filter
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm'
                                        : 'bg-white dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#38383A] hover:bg-gray-50 dark:hover:bg-[#3A3A3C]'
                                    }
                `}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : hasNotifications ? (
                    <div className="space-y-8">
                        {sectionOrder.map((section) => {
                            const notifications = groupedNotifications[section];
                            if (!notifications || notifications.length === 0) return null;

                            const filteredNotifications = notifications.filter(notification => {
                                if (activeFilter === 'All') return true;
                                if (activeFilter === 'Alerts') return notification.type === 'system_alert';
                                if (activeFilter === 'Tasks') return notification.type === 'task_updated' || notification.type === 'deadline_soon';
                                if (activeFilter === 'Mentions') return notification.type === 'meeting_summary';
                                return true;
                            });

                            if (filteredNotifications.length === 0) return null;

                            return (
                                <div key={section}>
                                    <h2 className="text-[13px] font-semibold text-gray-400/80 dark:text-gray-500/80 uppercase tracking-wide mb-3 pl-1">
                                        {section}
                                    </h2>

                                    <div className="space-y-3">
                                        <AnimatePresence mode="popLayout">
                                            {filteredNotifications.map((notification, index) => (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                                >
                                                    <UpdateCard
                                                        notification={notification}
                                                        onClick={handleNotificationClick}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center py-24 px-4 text-center"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mb-6">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            All caught up
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                            You have no new updates. Enjoy your free time!
                        </p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
