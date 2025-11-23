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
    Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getInitials } from '../utils/premiumHelpers';
import { useToast } from '../contexts/ToastContext';

export default function ProfilePage() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [showLevelTooltip, setShowLevelTooltip] = useState(false);
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        activeStreak: 0,
        level: 1
    });

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

    const menuItems = [
        {
            title: 'Account Settings',
            items: [
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
                    icon: Moon,
                    label: 'Dark Mode',
                    action: () => showToast({ type: 'info', title: 'Coming Soon', message: 'Dark mode is currently in development.' }),
                    badge: 'Coming Soon'
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
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
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
                            <div className="flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 whitespace-nowrap">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                    <span className="text-[10px] font-bold text-white">★</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Lvl {stats.level}</span>
                            </div>

                            <AnimatePresence>
                                {showLevelTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white/80 backdrop-blur-md text-gray-800 text-xs p-3 rounded-xl shadow-xl border border-white/50 text-center z-50"
                                    >
                                        <div className="font-bold mb-1 text-gray-900">Gardener Level {stats.level}</div>
                                        <div className="text-gray-600">Complete 5 tasks to level up!</div>
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rotate-45 border-t border-l border-white/50" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'Gardener'}</h1>
                    <p className="text-gray-500">{user?.email}</p>
                </motion.div>

                {/* Gamification Stats */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-3 gap-4 mb-8"
                >
                    <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 text-green-700">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.completedTasks}</span>
                        <span className="text-xs text-gray-500 font-medium">Completed</span>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2 text-orange-700">
                            <Flame className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.activeStreak}</span>
                        <span className="text-xs text-gray-500 font-medium">Day Streak</span>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-700">
                            <Sprout className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.totalTasks}</span>
                        <span className="text-xs text-gray-500 font-medium">Total Planted</span>
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
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                                {section.title}
                            </h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {section.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        onClick={item.action}
                                        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-900">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.badge && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
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
                        className="w-full bg-white p-4 rounded-2xl shadow-sm border border-red-100 flex items-center justify-center gap-2 text-red-600 font-semibold hover:bg-red-50 transition-colors mt-8"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </motion.button>

                    <div className="text-center text-xs text-gray-400 mt-8">
                        GrowFlow v1.0.0 • Built with 🌱
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
