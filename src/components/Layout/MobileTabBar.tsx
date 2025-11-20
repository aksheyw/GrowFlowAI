import { Home, PlusCircle, Bell, User } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import TabButton from './TabButton';

export default function MobileTabBar() {
    const { currentPath, navigate } = useNavigation();

    // TODO: Get actual unread count from notifications context
    const unreadCount = 0;

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
            path: '/notifications',
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
        <nav
            className="
        md:hidden
        fixed bottom-0 left-0 right-0 z-40
        bg-white/95 backdrop-blur-xl
        border-t border-gray-300
        shadow-[0_-2px_10px_rgba(0,0,0,0.08)]
        pb-safe
      "
        >
            <div className="flex items-center justify-around h-16">
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
    );
}
