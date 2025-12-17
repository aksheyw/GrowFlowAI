import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ElementType;
    children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, icon: Icon, children, ...props }, ref) => {

        const variants = {
            primary: 'bg-[#2D5016] text-white hover:bg-[#1a310d] shadow-sm',
            secondary: 'bg-white dark:bg-ios-card-dark text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-ios-separator-dark hover:bg-gray-50 dark:hover:bg-ios-surface-dark shadow-sm',
            ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-ios-surface-dark hover:text-gray-900 dark:hover:text-white',
            danger: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-100 dark:border-red-800',
        };

        const sizes = {
            sm: 'h-11 sm:h-8 px-3 text-xs rounded-lg',
            md: 'h-11 sm:h-10 px-4 text-sm rounded-xl',
            lg: 'h-12 px-6 text-base rounded-xl',
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5016]/20 disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : Icon ? (
                    <Icon className={cn("w-4 h-4", children && "mr-2")} />
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
