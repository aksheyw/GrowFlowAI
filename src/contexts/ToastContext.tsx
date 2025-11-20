import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'celebration';

export interface Toast {
  id: string;
  title?: string;  // Optional title
  message: string;
  type: ToastType;
  duration?: number;
  onClick?: () => void;  // Click handler
  action?: {  // Optional action button
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;  // Don't auto-dismiss
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  showToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Simple API for basic toasts (backward compatible)
  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 5000) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(7);
      const newToast: Toast = { id, message, type, duration };

      setToasts(prev => {
        const updated = [newToast, ...prev];
        return updated.slice(0, 3);  // Limit to 3 toasts
      });

      return id;
    },
    []
  );

  // Rich API for advanced toasts
  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(7);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000
      };

      setToasts(prev => {
        const updated = [newToast, ...prev];
        return updated.slice(0, 3);  // Limit to 3 toasts
      });

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
