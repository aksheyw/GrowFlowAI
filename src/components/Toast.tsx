import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  PartyPopper,
  LucideIcon
} from 'lucide-react';
import { Toast as ToastType } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

interface ToastStyle {
  bg: string;
  iconColor: string;
  progressBar: string;
  icon: LucideIcon;
}

function getToastStyle(type: ToastType['type']): ToastStyle {
  const styles: Record<ToastType['type'], ToastStyle> = {
    success: {
      bg: 'bg-green-100',
      iconColor: 'text-green-600',
      progressBar: 'bg-green-500',
      icon: CheckCircle2
    },
    error: {
      bg: 'bg-red-100',
      iconColor: 'text-red-600',
      progressBar: 'bg-red-500',
      icon: AlertCircle
    },
    warning: {
      bg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      progressBar: 'bg-yellow-500',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      progressBar: 'bg-blue-500',
      icon: Info
    },
    celebration: {
      bg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      progressBar: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: PartyPopper
    }
  };

  return styles[type];
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isHovered, setIsHovered] = useState(false);
  const style = getToastStyle(toast.type);
  const Icon = style.icon;

  // Auto-dismiss unless persistent or hovered
  useEffect(() => {
    if (toast.persistent || isHovered) return;
    if (!toast.duration || toast.duration <= 0) return;

    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, toast.persistent, isHovered, onRemove]);

  const handleClick = () => {
    if (toast.onClick) {
      toast.onClick();
      onRemove(toast.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-white rounded-2xl
        shadow-2xl border border-gray-100
        overflow-hidden
        ${toast.onClick ? 'cursor-pointer' : ''}
        hover:shadow-3xl
        transition-shadow duration-200
      `}
      onClick={handleClick}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-xl flex-shrink-0
          flex items-center justify-center
          ${style.bg}
        `}>
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title (if present) */}
          {toast.title && (
            <h4 className="font-semibold text-gray-900 mb-1 text-sm">
              {toast.title}
            </h4>
          )}

          {/* Message */}
          <p className={`text-sm text-gray-600 leading-relaxed ${!toast.title ? 'font-medium text-gray-900' : ''}`}>
            {toast.message}
          </p>

          {/* Action button (optional) */}
          {toast.action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.action!.onClick();
                onRemove(toast.id);
              }}
              className="
                mt-2 text-sm text-[#6FA84C] hover:text-[#2D5016]
                font-medium transition-colors duration-200
              "
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(toast.id);
          }}
          className="
            p-1 rounded-lg
            hover:bg-gray-100
            transition-colors duration-200
            flex-shrink-0
          "
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      {!toast.persistent && toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: isHovered ? "100%" : "0%" }}
          transition={{
            duration: isHovered ? 0 : (toast.duration / 1000),
            ease: "linear"
          }}
          className={`h-1 ${style.progressBar}`}
        />
      )}
    </motion.div>
  );
}
