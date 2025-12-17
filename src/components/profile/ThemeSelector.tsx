import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
    const { theme, setTheme } = useTheme();

    const options = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="
                            fixed z-[100] 
                            bottom-20 left-4 right-4 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                            md:w-96
                            bg-white dark:bg-ios-card-dark 
                            rounded-2xl shadow-2xl 
                            border border-gray-100 dark:border-ios-separator-dark
                            overflow-hidden
                        "
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-ios-separator-dark flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-ios-label-primary-dark">Appearance</h3>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-ios-surface-dark transition-colors">
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 space-y-2">
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setTheme(option.id)}
                                    className={`
                                        w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200
                                        ${theme === option.id
                                            ? 'bg-gray-100 dark:bg-ios-surface-dark text-gray-900 dark:text-ios-label-primary-dark font-medium'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-ios-surface-dark'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <option.icon className="w-5 h-5" />
                                        <span>{option.label}</span>
                                    </div>
                                    {theme === option.id && (
                                        <motion.div layoutId="activeCheck" className="w-2 h-2 rounded-full bg-green-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
