import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = ''
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Card Content Container */}
      <div className={`bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up ${className}`}>
        
        {/* Header */}
        <div className="p-5 border-b dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-650 dark:text-slate-350">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3.5">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
