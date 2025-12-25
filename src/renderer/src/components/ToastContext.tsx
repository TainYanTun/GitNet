import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              flex items-center gap-3 px-4 py-3 rounded-md shadow-medium
              border border-zed-border dark:border-zed-dark-border
              bg-zed-surface dark:bg-zed-dark-surface
              text-zed-text dark:text-zed-dark-text
              animate-fade-in-up transition-all duration-300
              min-w-[200px] max-w-sm
            `}
          >
            <div className={`
              flex-shrink-0 w-2 h-2 rounded-full
              ${toast.type === 'success' ? 'bg-commit-feat' : ''}
              ${toast.type === 'error' ? 'bg-commit-fix' : ''}
              ${toast.type === 'info' ? 'bg-zed-accent dark:bg-zed-dark-accent' : ''}
            `} />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-zed-muted dark:text-zed-dark-muted hover:text-zed-text dark:hover:text-zed-dark-text"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
