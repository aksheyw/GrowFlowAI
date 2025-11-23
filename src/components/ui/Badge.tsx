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
            success: 'bg-green-100 text-green-700 border-green-200', // Done, Low Priority
            warning: 'bg-yellow-100 text-yellow-700 border-yellow-200', // In Progress, Medium Priority
            danger: 'bg-red-100 text-red-700 border-red-200', // High Priority
            neutral: 'bg-gray-100 text-gray-700 border-gray-200', // Not Started
            info: 'bg-blue-100 text-blue-700 border-blue-200',
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
