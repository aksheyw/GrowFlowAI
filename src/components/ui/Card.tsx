import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    'bg-white dark:bg-ios-card-dark rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-ios-separator-dark',
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';
