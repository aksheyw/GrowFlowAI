import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends HTMLMotionProps<"button"> {
    loading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export default function AuthButton({
    loading,
    loadingText,
    children,
    className = '',
    disabled,
    ...props
}: AuthButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || disabled}
            className={`
        w-full h-[52px] mt-2
        bg-gradient-to-b from-[#7AB555] to-[#5A8E3D]
        text-white font-semibold rounded-xl text-[16px] tracking-wide
        shadow-[0_4px_12px_rgba(90,142,61,0.25),0_2px_4px_rgba(90,142,61,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]
        hover:shadow-[0_6px_16px_rgba(90,142,61,0.3),0_4px_6px_rgba(90,142,61,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]
        active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        transition-all duration-200 ease-out
        flex items-center justify-center gap-2
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin opacity-80" />
                    <span className="opacity-90">{loadingText || 'Loading...'}</span>
                </>
            ) : (
                children
            )}
        </motion.button>
    );
}
