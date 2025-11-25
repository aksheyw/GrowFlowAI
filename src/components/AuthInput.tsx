import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    success?: boolean;
}

export default function AuthInput({
    label,
    error,
    success,
    className = '',
    type = 'text',
    value,
    ...props
}: AuthInputProps) {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const hasValue = value !== '' && value !== undefined;

    return (
        <div className={`relative ${className}`}>
            <div className="relative group">
                <input
                    type={inputType}
                    value={value}
                    className={`
            w-full h-[52px] px-4 pt-5 pb-1
            bg-gray-50/50 border border-gray-200 rounded-xl
            transition-all duration-300 ease-out
            focus:outline-none text-gray-900 font-medium text-base
            placeholder-transparent
            ${error ? 'border-red-300 bg-red-50/30' : 'hover:border-gray-300'}
            ${(focused || hasValue) ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : ''}
            ${focused && !error ? 'border-[#6FA84C] ring-4 ring-[#6FA84C]/10' : ''}
            ${success && !focused ? 'border-[#6FA84C] bg-green-50/30' : ''}
          `}
                    onFocus={(e) => {
                        setFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />

                <label
                    className={`
            absolute left-4 transition-all duration-200 pointer-events-none origin-left
            ${(focused || hasValue)
                            ? 'top-2 text-[11px] tracking-wide font-semibold uppercase'
                            : 'top-[15px] text-[15px] text-gray-500 font-medium'
                        }
            ${focused ? 'text-[#6FA84C]' : 'text-gray-500'}
            ${error ? 'text-red-500' : ''}
          `}
                >
                    {label}
                </label>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <AnimatePresence>
                        {success && !error && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                            >
                                <Check className="w-4 h-4 text-[#6FA84C]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1 rounded-full hover:bg-gray-100"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="mt-1.5 text-[13px] text-red-500 font-medium flex items-center gap-1.5 px-1">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            {error}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
