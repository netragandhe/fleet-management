import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />
  };

  const bgStyles = {
    success: 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-950/30 text-slate-800 dark:text-slate-200 shadow-emerald-500/5',
    warning: 'bg-white dark:bg-slate-900 border-amber-100 dark:border-amber-950/30 text-slate-800 dark:text-slate-200 shadow-amber-500/5',
    error: 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-950/30 text-slate-800 dark:text-slate-200 shadow-rose-500/5',
    info: 'bg-white dark:bg-slate-900 border-sky-100 dark:border-sky-950/30 text-slate-800 dark:text-slate-200 shadow-sky-500/5'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg z-50 animate-slide-up max-w-sm pointer-events-auto ${bgStyles[type]}`}>
      {icons[type]}
      <p className="text-xs font-semibold flex-1 leading-normal">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onCloseToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-55 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onCloseToast(toast.id)}
        />
      ))}
    </div>
  );
}
