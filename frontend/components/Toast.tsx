
import React, { useEffect, useState } from 'react';
import { useToast, Toast as ToastType } from '../contexts/ToastContext';

const toastStyles: Record<ToastType['type'], { bg: string; icon: string; iconColor: string }> = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'check_circle',
    iconColor: 'text-green-500',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'error',
    iconColor: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: 'warning',
    iconColor: 'text-yellow-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'info',
    iconColor: 'text-blue-500',
  },
};

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);
  const style = toastStyles[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300);

      return () => clearTimeout(exitTimer);
    }
  }, [toast.duration]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${style.bg} ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <span className={`material-symbols-outlined ${style.iconColor}`}>
        {style.icon}
      </span>
      <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
      <button
        onClick={handleClose}
        className="p-1 hover:bg-black/5 rounded transition-colors"
      >
        <span className="material-symbols-outlined text-gray-400 text-sm">close</span>
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
