import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import NotificationBell from '../NotificationBell';
import Logo from '../Logo';

import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
    const { user } = useAuth();
    const location = useLocation();
    const isAuthPage = ['/login', '/signup', '/reset-password'].includes(location.pathname);
    const isNotePage = location.pathname.startsWith('/note/');

    if (isAuthPage || isNotePage) return null;

    return (
        <>
            {/* Desktop Header */}
            <header
                className="
          hidden md:block
          sticky top-0 z-50
          bg-white/80 backdrop-blur-xl
          border-b border-gray-100
          shadow-sm
          transition-all duration-200
        "
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center md:justify-between">
                    {/* Left: Logo */}
                    <Link to="/dashboard" className="group">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Logo size="md" />
                        </motion.div>
                    </Link>

                    {/* Right: Notifications & Profile */}
                    {user && (
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <Link to="/profile" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <User className="w-5 h-5 text-gray-600" />
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Header */}
            <header
                className="
          md:hidden
          sticky top-0 z-50
          bg-white/90 backdrop-blur-xl
          border-b border-gray-100
          shadow-sm
        "
            >
                <div className={`px-4 h-16 flex items-center ${user ? 'justify-between' : 'justify-center'}`}>
                    {/* Logo only */}
                    <Link to="/dashboard">
                        <Logo size="sm" />
                    </Link>

                    {/* Right: Notifications only */}
                    {user && <NotificationBell />}
                </div>
            </header>
        </>
    );
}
