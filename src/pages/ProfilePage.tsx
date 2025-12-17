import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User,
    LogOut,
    Bell,
    Moon,
    HelpCircle,
    ChevronRight,
    Trophy,
    Flame,
    Sprout,
    Shield,
    Mail,
    Calendar
} from 'lucide-react';
import EmailIntegrationSettings from '../components/profile/EmailIntegrationSettings';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getInitials } from '../utils/premiumHelpers';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelector from '../components/profile/ThemeSelector';

export default function ProfilePage() {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeView, setActiveView] = useState<'main' | 'email_integration'>('main');
    const [showLevelTooltip, setShowLevelTooltip] = useState(false);
    const [autoSync, setAutoSync] = useState(profile?.auto_calendar_sync || false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        if (profile) {
            setAutoSync(profile.auto_calendar_sync || false);
        }
    }, [profile]);

    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        activeStreak: 0,
        level: 1
    });

    // ... (rest of the file)

    // In menuItems:

    const loadStats = useCallback(async () => {
        try {
            // Get task stats
            const { data: tasks, error } = await supabase
                .from('tasks')
                .select('status, created_at')
                .eq('user_id', user?.id);

            if (error) throw error;

            const total = tasks?.length || 0;
            const completed = tasks?.filter(t => t.status === 'Done').length || 0;

            // Calculate level based on completed tasks (simple gamification)
            const level = Math.floor(completed / 5) + 1;

            setStats({
                totalTasks: total,
                completedTasks: completed,
                activeStreak: 3, // Mock data for now
                level
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadStats();
        }
    }, [user, loadStats]);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
            showToast({ type: 'success', title: 'Signed out', message: 'See you soon!' });
        } catch {
            showToast({ type: 'error', title: 'Error', message: 'Failed to sign out' });
        }
    };

    interface MenuItem {
        icon: any;
        label: string;
        action: () => void | Promise<void> | any;
        badge?: string;
        toggle?: boolean;
        value?: boolean;
    }

    const menuItems: { title: string; items: MenuItem[] }[] = [
        {
            title: 'Account Settings',
            items: [
                {
                    icon: Mail,
                    label: 'Email Integration',
                    action: () => setActiveView('email_integration'),
                    badge: 'New'
                },
                {
                    icon: User,
                    label: 'Edit Profile',
                    action: () => showToast({ type: 'info', title: 'Coming Soon', message: 'Profile editing will be available shortly.' }),
                    badge: 'Coming Soon'
                },
                {
                    icon: Bell,
                    label: 'Notifications',
                    action: () => showToast({ type: 'info', title: 'Coming Soon', message: 'Notification settings coming in the next update.' }),
                    badge: 'Coming Soon'
                },
                {
                    icon: Shield,
                    label: 'Privacy & Security',
                    action: () => showToast({ type: 'info', title: 'Coming Soon', message: 'Privacy settings are locked for now.' }),
                    badge: 'Coming Soon'
                }
            ]
        },
        {
            title: 'App Preferences',
            items: [
                {
                    icon: Calendar,
                    label: 'Auto-Sync to Google Calendar',
                    action: async () => {
                        const newValue = !autoSync;
                        // Optimistic update
                        setAutoSync(newValue);

                        try {
                            const { error } = await supabase
                                .from('profiles')
                                .update({ auto_calendar_sync: newValue })
                                .eq('id', user?.id);

                            if (error) throw error;

                            await refreshProfile();

                            showToast({
                                type: 'success',
                                title: newValue ? 'Calendar Sync Enabled' : 'Calendar Sync Disabled',
                                message: newValue ? 'Tasks will now automatically sync to your calendar.' : 'Automatic sync has been turned off.'
                            });
                        } catch (error) {
                            console.error('Error updating calendar sync:', error);
                            // Revert on error
                            setAutoSync(!newValue);
                            showToast({ type: 'error', title: 'Error', message: 'Failed to update calendar settings' });
                        }
                    },
                    toggle: true,
                    value: autoSync
                },
                {
                    icon: Moon,
                    label: 'Appearance',
                    action: () => setShowThemeSelector(true),
                    badge: theme === 'system' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'
                },
                {
                    icon: HelpCircle,
                    label: 'Help & Support',
                    action: () => showToast({ type: 'success', title: 'Help', message: 'Contact support@growflow.app for assistance.' })
                }
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-ios-bg-dark pb-24 md:pb-12">
            {activeView === 'main' && (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center mb-8"
                    >
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6FA84C] to-[#2D5016] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                                {getInitials(profile?.full_name || user?.email || 'User')}
                            </div>
                            <div
                                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 cursor-help z-10"
                                onMouseEnter={() => setShowLevelTooltip(true)}
                                onMouseLeave={() => setShowLevelTooltip(false)}
                                onClick={() => setShowLevelTooltip(!showLevelTooltip)}
                            >
                                <div className="flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-ios-card-dark/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 dark:border-ios-separator-dark whitespace-nowrap">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                        <span className="text-[10px] font-bold text-white">★</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Lvl {stats.level}</span>
                                </div>

                                <AnimatePresence>
                                    {showLevelTooltip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white/80 dark:bg-ios-card-dark/90 backdrop-blur-md text-gray-800 dark:text-gray-200 text-xs p-3 rounded-xl shadow-xl border border-white/50 dark:border-ios-separator-dark text-center z-50"
                                        >
                                            <div className="font-bold mb-1 text-gray-900 dark:text-white">Gardener Level {stats.level}</div>
                                            <div className="text-gray-600 dark:text-gray-400">Complete 5 tasks to level up!</div>
                                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rotate-45 border-t border-l border-white/50" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.full_name || 'Gardener'}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </motion.div>

                    {/* Gamification Stats */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-3 gap-4 mb-8"
                    >
                        <motion.div variants={itemVariants} className="bg-white dark:bg-ios-card-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-ios-separator-dark flex flex-col items-center text-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 text-green-700">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed</span>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white dark:bg-ios-card-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-ios-separator-dark flex flex-col items-center text-center">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2 text-orange-700">
                                <Flame className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeStreak}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Day Streak</span>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white dark:bg-ios-card-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-ios-separator-dark flex flex-col items-center text-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-700">
                                <Sprout className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Planted</span>
                        </motion.div>
                    </motion.div>

                    {/* Settings Menu */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {menuItems.map((section, idx) => (
                            <motion.div key={idx} variants={itemVariants}>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
                                    {section.title}
                                </h3>
                                <div className="bg-white dark:bg-ios-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-ios-separator-dark overflow-hidden">
                                    {section.items.map((item, itemIdx) => (
                                        <button
                                            key={itemIdx}
                                            onClick={item.action}
                                            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-ios-surface-dark transition-colors ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100 dark:border-ios-separator-dark' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-ios-surface-dark flex items-center justify-center text-gray-600 dark:text-gray-400">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.toggle ? (
                                                    <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ease-[bezier(0.25,0.1,0.25,1)] ${item.value ? 'bg-[#34C759]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                                        <div className={`absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-all duration-300 ease-[bezier(0.25,0.1,0.25,1)] ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {item.badge && (
                                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-ios-surface-dark text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Logout Button */}
                        <motion.button
                            variants={itemVariants}
                            onClick={handleLogout}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-white dark:bg-ios-card-dark p-4 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-8"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </motion.button>

                        <div className="text-center text-xs text-gray-400 mt-8">
                            GrowFlow v1.0.0 • Built with 🌱
                        </div>
                    </motion.div>
                </div>
            )}

            {
                activeView === 'email_integration' && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <EmailIntegrationSettings onBack={() => setActiveView('main')} />
                    </div>
                )
            }
            <ThemeSelector isOpen={showThemeSelector} onClose={() => setShowThemeSelector(false)} />
        </div >
    );
}
