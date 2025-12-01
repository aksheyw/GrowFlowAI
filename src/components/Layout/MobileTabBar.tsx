import { Home, PlusCircle, Bell, User } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { useUpdates } from '../../hooks/useUpdates';
import TabButton from './TabButton';

export default function MobileTabBar() {
    const { currentPath, navigate } = useNavigation();
    const { user } = useAuth();
    const { unreadCount } = useUpdates();

    // Don't show tab bar if user is not authenticated
    if (!user) {
        return null;
    }

    const tabs = [
        {
            path: '/dashboard',
            icon: Home,
            label: 'Garden',
            badge: null,
        },
        {
            path: '/add-note',
            icon: PlusCircle,
            label: 'Add Note',
            badge: null,
            special: true, // Slightly larger/highlighted
        },
        {
            path: '/updates', // Changed from /notifications
            icon: Bell,
            label: 'Updates',
            badge: unreadCount > 0 ? unreadCount : null,
        },
        {
            path: '/profile',
            icon: User,
            label: 'Profile',
            badge: null,
        },
    ];

    return (
        <>
            {/* Background extending behind Android nav bar - provides contrast */}
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-100"
                style={{
                    height: 'env(safe-area-inset-bottom, 0px)',
                    minHeight: '16px'
                }}
            />

            {/* Actual tab bar - positioned above safe area */}
            <nav
                className="md:hidden fixed left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]"
                style={{
                    bottom: 'max(env(safe-area-inset-bottom, 0px), 16px)'
                }}
            >
                <div className="flex items-center justify-around h-16 px-2">
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.path}
                            tab={tab}
                            isActive={currentPath === tab.path}
                            onClick={() => navigate(tab.path)}
                        />
                    ))}
                </div>
            </nav>
        </>
    );
}
