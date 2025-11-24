import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { useUpdates } from '../hooks/useUpdates';
import UpdateCard from '../components/updates/UpdateCard';

type FilterType = 'All' | 'Alerts' | 'Tasks' | 'Mentions';

const FILTERS: FilterType[] = ['All', 'Alerts', 'Tasks', 'Mentions'];

export default function UpdatesPage() {
    const navigate = useNavigate();
    const { groupedNotifications, unreadCount, markRead, markAllRead, isLoading } = useUpdates();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');

    const handleNotificationClick = (id: string) => {
        markRead(id);
        // TODO: Navigate to relevant task/meeting if task_id exists
    };

    const hasNotifications = Object.keys(groupedNotifications).length > 0;

    // Define the order of sections
    const sectionOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 pb-24 md:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Back Button (Mobile) */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        {/* Back to Dashboard (Desktop) */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Dashboard
                        </button>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900">Updates</h1>

                        {/* Mark All Read Button */}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-sm font-medium text-[#2D5016] hover:text-[#1a2f0d] transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                        {unreadCount === 0 && <div className="w-20" />}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`
                  px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${activeFilter === filter
                                        ? 'bg-[#2D5016] text-white shadow-sm'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
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
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-[#2D5016] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : hasNotifications ? (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {sectionOrder.map((section) => {
                            const notifications = groupedNotifications[section];
                            if (!notifications || notifications.length === 0) return null;

                            // Filter notifications based on activeFilter
                            const filteredNotifications = notifications.filter(notification => {
                                if (activeFilter === 'All') return true;
                                if (activeFilter === 'Alerts') return notification.type === 'system_alert';
                                if (activeFilter === 'Tasks') return notification.type === 'task_updated' || notification.type === 'deadline_soon';
                                if (activeFilter === 'Mentions') return notification.type === 'meeting_summary'; // Mapping meeting summaries to mentions/updates for now
                                return true;
                            });

                            if (filteredNotifications.length === 0) return null;

                            return (
                                <div key={section}>
                                    {/* Section Header */}
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {section}
                                        </h2>
                                    </div>

                                    {/* Notification List */}
                                    <AnimatePresence mode="popLayout">
                                        {filteredNotifications.map((notification, index) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.05,
                                                }}
                                            >
                                                <UpdateCard
                                                    notification={notification}
                                                    onClick={handleNotificationClick}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center py-16 px-4"
                    >
                        <div className="w-24 h-24 mb-6 text-6xl">🌱</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            You're all caught up!
                        </h3>
                        <p className="text-gray-500 text-center max-w-sm">
                            No new updates at the moment. Enjoy the peace and quiet.
                        </p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
