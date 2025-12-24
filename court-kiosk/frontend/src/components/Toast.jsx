import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, [removeToast]);

  const toast = useCallback((() => {
    return {
      success: (message, duration) => addToast(message, 'success', duration),
      error: (message, duration) => addToast(message, 'error', duration),
      info: (message, duration) => addToast(message, 'info', duration),
      warning: (message, duration) => addToast(message, 'warning', duration),
    };
  })(), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div 
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map(({ id, message, type }) => {
          const Icon = toastIcons[type];
          return (
            <div
              key={id}
              className={`${toastStyles[type]} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
              role="alert"
            >
              <Icon className={`${iconStyles[type]} flex-shrink-0 w-5 h-5 mt-0.5`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium">{message}</p>
              <button
                onClick={() => removeToast(id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

