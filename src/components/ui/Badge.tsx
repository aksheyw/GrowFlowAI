import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'neutral', children, ...props }, ref) => {

        const variants = {
            // Success (Done, Low Priority) - Mint/Teal for premium feel
            success: 'bg-green-100 dark:bg-emerald-500/20 text-green-700 dark:text-emerald-300 border-green-200 dark:border-emerald-500/30',
            // Warning (In Progress, Medium Priority) - Warm amber for visibility
            warning: 'bg-yellow-100 dark:bg-amber-500/20 text-yellow-700 dark:text-amber-300 border-yellow-200 dark:border-amber-500/30',
            // Danger (High Priority, Overdue) - Vivid coral/red for urgency
            danger: 'bg-red-100 dark:bg-rose-500/20 text-red-700 dark:text-rose-300 border-red-200 dark:border-rose-500/30',
            // Neutral (Not Started) - Subtle gray
            neutral: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30',
            // Info (Processed, Synced) - Cool blue
            info: 'bg-blue-100 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 border-blue-200 dark:border-sky-500/30',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
