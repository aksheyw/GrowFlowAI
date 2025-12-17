import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Tab {
    path: string;
    icon: LucideIcon;
    label: string;
    badge?: number | null;
    special?: boolean;
}

interface TabButtonProps {
    tab: Tab;
    isActive: boolean;
    onClick: () => void;
}

export default function TabButton({ tab, isActive, onClick }: TabButtonProps) {
    const Icon = tab.icon;

    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.95, opacity: 0.7 }}
            transition={{ duration: 0.1 }}
            className={`
        relative
        flex flex-col items-center justify-center
        min-w-[64px] h-full px-3
        transition-all duration-200
        ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}
      `}
        >
            {/* Active background pill */}
            {isActive && (
                <motion.div
                    layoutId="activeTabBg"
                    className="
            absolute inset-0 -m-1
            bg-gray-100 dark:bg-ios-surface-dark rounded-xl
            -z-10
          "
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 35,
                        mass: 0.8,
                    }}
                />
            )}

            {/* Icon container */}
            <div className="relative">
                {/* Icon */}
                <Icon
                    className={`
            w-6 h-6
            transition-all duration-200
          `}
                />

                {/* Badge (if exists) */}
                {tab.badge && tab.badge > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="
              absolute -top-1 -right-1
              min-w-[18px] h-[18px] px-1
              bg-red-500 rounded-full
              flex items-center justify-center
              text-white text-[10px] font-bold
              shadow-sm
            "
                    >
                        {tab.badge > 9 ? '9+' : tab.badge}
                    </motion.div>
                )}
            </div>

            {/* Label */}
            <span
                className={`
          text-[10px] mt-1.5
          transition-all duration-200
          ${isActive ? 'font-semibold' : 'font-normal'}
        `}
            >
                {tab.label}
            </span>
        </motion.button>
    );
}
