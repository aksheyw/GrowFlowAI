import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotificationBell from '../NotificationBell';
import Logo from '../Logo';

export default function Header() {
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link to="/dashboard" className="group">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Logo size="md" />
                        </motion.div>
                    </Link>

                    {/* Right: Notifications */}
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                    </div>
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
                <div className="px-4 h-16 flex items-center justify-between">
                    {/* Logo only */}
                    <Link to="/dashboard">
                        <Logo size="sm" />
                    </Link>

                    {/* Right: Notifications only */}
                    <NotificationBell />
                </div>
            </header>
        </>
    );
}
